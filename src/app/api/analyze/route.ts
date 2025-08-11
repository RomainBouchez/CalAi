import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request): Promise<Response> {
    try {
        // Get API key from environment variables
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error('GEMINI_API_KEY is not defined in environment variables');
            return Response.json({ error: 'API configuration error' }, { status: 500 });
        }

        const { image } = await req.json();

        // Initialize the Gemini API
        const genAi = new GoogleGenerativeAI(apiKey);
        const model = genAi.getGenerativeModel({
            model: 'gemini-2.0-flash',
            // Optional: Add safety settings and generation config for production
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
                temperature: 0.2, // Lower temperature for more consistent responses
                topP: 0.8,
                topK: 40
            }
        });

        const prompt = `Analyze this food image and provide detailed nutritional information in the following JSON format:
    {
      "foodAnalysis": {
        "identifiedFood": "Name and detailed description of what you see in the image",
        "portionSize": "Estimated portion size in grams",
        "recognizedServingSize": "Estimated serving size in grams",
        "nutritionFactsPerPortion": {
          "calories": "Estimated calories",
          "protein": "Estimated protein in grams",
          "carbs": "Estimated carbs in grams",
          "fat": "Estimated fat in grams",
          "fiber": "Estimated fiber in grams",
          "sugar": "Estimated sugar in grams",
          "sodium": "Estimated sodium in mg",
          "cholesterol": "Estimated cholesterol in mg"
        },
        "nutritionFactsPer100g": {
          "calories": "Calories per 100g",
          "protein": "Protein in grams per 100g",
          "carbs": "Carbs in grams per 100g",
          "fat": "Fat in grams per 100g",
          "fiber": "Fiber in grams per 100g",
          "sugar": "Sugar in grams per 100g",
          "sodium": "Sodium in mg per 100g",
          "cholesterol": "Cholesterol in mg per 100g"
        },
        "additionalNotes": [
          "Any notable nutritional characteristics",
          "Presence of allergens",
          "Whether it's vegetarian/vegan/gluten-free if applicable"
        ]
      }
    }
    
    Ensure the response is in valid JSON format exactly as specified above, without any markdown formatting.
    Provide realistic estimates based on typical portion sizes and nutritional databases.
    Be as specific and accurate as possible in identifying the food and its components.
    Make sure to calculate both portion-based and per 100g nutritional values for easy comparison.`;

        try {
            const result = await model.generateContent([prompt, image]);
            const response = await result.response;
            const text = response.text();

            // Clean up the response text to remove any markdown formatting
            const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();

            try {
                // Parse and validate the JSON structure
                const parsedResponse = JSON.parse(cleanedText);

                // Validate the response structure
                if (!parsedResponse.foodAnalysis) {
                    throw new Error('Invalid response structure: missing foodAnalysis object');
                }

                return Response.json({
                    success: true,
                    data: parsedResponse,
                });
            } catch (parseError) {
                console.error('Failed to parse Gemini response as JSON:', parseError);

                // Try to extract JSON from the text as a fallback
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
                        // Changed variable name to avoid unused variable error
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

            // Generic error message for production
            return Response.json({
                error: 'Food analysis failed',
                details: 'Unable to analyze the food image'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('General error:', error);

        // Generic error message for production
        return Response.json({
            error: 'Request processing error',
            details: 'Unable to process the request'
        }, { status: 500 });
    }
}