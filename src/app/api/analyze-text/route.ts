import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request): Promise<Response> {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error('GEMINI_API_KEY is not defined in environment variables');
            return Response.json({ error: 'API configuration error' }, { status: 500 });
        }

        const { text } = await req.json();

        if (!text || typeof text !== 'string') {
            return Response.json({ error: 'Text is required' }, { status: 400 });
        }

        const genAi = new GoogleGenerativeAI(apiKey);
        const model = genAi.getGenerativeModel({
            model: 'gemini-2.0-flash',
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT" as any,
                    threshold: "BLOCK_MEDIUM_AND_ABOVE" as any
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH" as any,
                    threshold: "BLOCK_MEDIUM_AND_ABOVE" as any
                }
            ],
            generationConfig: {
                temperature: 0.2,
                topP: 0.8,
                topK: 40
            }
        });

        const prompt = `Analyze this food description and provide detailed nutritional information in the following JSON format:
{
  "foodAnalysis": {
    "identifiedFood": "Name and detailed description of the food mentioned",
    "portionSize": "Estimated portion size in grams (numeric value only)",
    "recognizedServingSize": "Estimated serving size in grams (numeric value only)",
    "nutritionFactsPerPortion": {
      "calories": "Estimated calories (numeric value only)",
      "protein": "Estimated protein in grams (numeric value only)",
      "carbs": "Estimated carbs in grams (numeric value only)",
      "fat": "Estimated fat in grams (numeric value only)",
      "fiber": "Estimated fiber in grams (numeric value only)",
      "sugar": "Estimated sugar in grams (numeric value only)",
      "sodium": "Estimated sodium in mg (numeric value only)",
      "cholesterol": "Estimated cholesterol in mg (numeric value only)"
    },
    "nutritionFactsPer100g": {
      "calories": "Calories per 100g (numeric value only)",
      "protein": "Protein in grams per 100g (numeric value only)",
      "carbs": "Carbs in grams per 100g (numeric value only)",
      "fat": "Fat in grams per 100g (numeric value only)",
      "fiber": "Fiber in grams per 100g (numeric value only)",
      "sugar": "Sugar in grams per 100g (numeric value only)",
      "sodium": "Sodium in mg per 100g (numeric value only)",
      "cholesterol": "Cholesterol in mg per 100g (numeric value only)"
    },
    "additionalNotes": [
      "Any notable nutritional characteristics",
      "Presence of allergens",
      "Whether it's vegetarian/vegan/gluten-free if applicable"
    ]
  }
}

Food description: "${text}"

Important: 
- Provide only numeric values without units in the JSON
- Be realistic with portion sizes based on common serving sizes
- If the description is unclear, make reasonable assumptions
- Ensure the response is valid JSON without markdown formatting`;

        try {
            const result = await model.generateContent([prompt]);
            const response = await result.response;
            const responseText = response.text();

            const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();

            try {
                const parsedResponse = JSON.parse(cleanedText);

                if (!parsedResponse.foodAnalysis) {
                    throw new Error('Invalid response structure: missing foodAnalysis object');
                }

                return Response.json({
                    success: true,
                    data: parsedResponse,
                });
            } catch (parseError) {
                console.error('Failed to parse Gemini response as JSON:', parseError);

                const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        const extractedJson = JSON.parse(jsonMatch[0]);
                        return Response.json({
                            success: true,
                            data: extractedJson,
                            note: "Response was extracted from partial JSON"
                        });
                    } catch (extractError) {
                        return Response.json({
                            error: 'Invalid response format',
                            details: 'Could not parse response as JSON'
                        }, { status: 500 });
                    }
                }

                return Response.json({
                    error: 'Invalid response format',
                    details: 'Could not parse response as JSON'
                }, { status: 500 });
            }
        } catch (apiError) {
            console.error('Gemini API Error:', apiError);

            return Response.json({
                error: 'Food analysis failed',
                details: 'Unable to analyze the food description'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('General error:', error);

        return Response.json({
            error: 'Request processing error',
            details: 'Unable to process the request'
        }, { status: 500 });
    }
}