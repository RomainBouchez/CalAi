import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request): Promise<Response> {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error('GEMINI_API_KEY is not defined in environment variables');
            return Response.json({ error: 'API configuration error' }, { status: 500 });
        }

        const { query } = await req.json();

        if (!query || typeof query !== 'string') {
            return Response.json({ error: 'Search query is required' }, { status: 400 });
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
                temperature: 0.3,
                topP: 0.9,
                topK: 40
            }
        });

        const prompt = `Based on the search query "${query}", provide a list of matching foods with their nutritional information per 100g in the following JSON format:

{
  "foods": [
    {
      "name": "Food name in French",
      "calories": "Numeric value only",
      "protein": "Numeric value only", 
      "carbs": "Numeric value only",
      "fats": "Numeric value only",
      "portion": "100g",
      "category": "breakfast/lunch/dinner/snack based on when it's typically eaten"
    }
  ]
}

Rules:
- Return 5-8 relevant food items maximum
- All nutritional values should be per 100g
- Use common French food names
- Categories should be: breakfast, lunch, dinner, or snack
- Provide only numeric values without units in the JSON
- Include both exact matches and similar/related foods
- Prioritize common foods available in France

Search query: "${query}"

Provide only valid JSON without markdown formatting.`;

        try {
            const result = await model.generateContent([prompt]);
            const response = await result.response;
            const responseText = response.text();

            const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();

            try {
                const parsedResponse = JSON.parse(cleanedText);

                if (!parsedResponse.foods || !Array.isArray(parsedResponse.foods)) {
                    throw new Error('Invalid response structure: missing foods array');
                }

                return Response.json({
                    success: true,
                    data: parsedResponse.foods,
                });
            } catch (parseError) {
                console.error('Failed to parse Gemini response as JSON:', parseError);

                const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        const extractedJson = JSON.parse(jsonMatch[0]);
                        if (extractedJson.foods && Array.isArray(extractedJson.foods)) {
                            return Response.json({
                                success: true,
                                data: extractedJson.foods,
                                note: "Response was extracted from partial JSON"
                            });
                        }
                    } catch (extractError) {
                        console.error('Extract error:', extractError);
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
                error: 'Food search failed',
                details: 'Unable to search for foods'
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