import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request): Promise<Response> {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error('GEMINI_API_KEY is not defined in environment variables');
            return Response.json({ error: 'API configuration error' }, { status: 500 });
        }

        const { image } = await req.json();

        // Simple server-side image size reduction
        const reduceImageSize = (base64Image: string): string => {
            try {
                // Remove data URL prefix if present
                const base64Data = base64Image.replace(/^data:image\/[^;]+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                
                console.log(`Original image size: ${buffer.length} bytes`);
                
                // If image is larger than 300KB, reduce it drastically
                if (buffer.length > 300 * 1024) {
                    // Reduce to 20% of original size
                    const reductionFactor = 0.2;
                    const targetLength = Math.floor(base64Data.length * reductionFactor);
                    const reducedBase64 = base64Data.substring(0, targetLength);
                    
                    console.log(`Reduced image size: ${Buffer.from(reducedBase64, 'base64').length} bytes`);
                    return `data:image/jpeg;base64,${reducedBase64}`;
                }
                
                return base64Image;
            } catch (error) {
                console.error('Error reducing image size:', error);
                return base64Image;
            }
        };

        // Reduce image size before sending to Gemini
        const processedImage = reduceImageSize(image);

        const genAi = new GoogleGenerativeAI(apiKey);
        const model = genAi.getGenerativeModel({
            model: 'gemini-1.5-flash',
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

        const prompt = `Analyze this image of a refrigerator, pantry, or kitchen storage area and identify all visible food ingredients. Return a JSON response with the following structure:

{
  "ingredientAnalysis": {
    "identifiedIngredients": [
      {
        "name": "ingredient name in French",
        "category": "one of: vegetables, fruits, meat, dairy, grains, spices, condiments, beverages, other",
        "quantity": "estimated quantity visible (e.g., '2 pieces', '1 bottle', 'several', 'about 200g')",
        "unit": "unit type if applicable (pieces, kg, g, ml, l, bottle, can, etc.)",
        "condition": "fresh, near expiry, expired, canned, frozen, dried",
        "confidence": "high, medium, low",
        "location": "where in the image (e.g., 'top shelf', 'vegetable drawer', 'door', 'center')"
      }
    ],
    "totalItemsFound": "number of distinct ingredients identified",
    "imageQuality": "excellent, good, fair, poor",
    "recommendations": [
      "suggestions for better photos if needed",
      "notes about ingredients that might be hard to identify"
    ]
  }
}

Guidelines:
- Only identify items that are clearly food ingredients that can be used for cooking
- Use French names for ingredients
- Be conservative with quantities - it's better to underestimate
- Group similar items (e.g., "3 tomatoes" not "tomato, tomato, tomato")
- Include both fresh and packaged/processed foods
- Ignore non-food items like kitchen utensils, containers, etc.
- If image quality is poor, mention it in recommendations
- Use appropriate confidence levels based on how clearly you can see each item

Return only valid JSON without any markdown formatting.`;

        try {
            const result = await model.generateContent([prompt, processedImage]);
            const response = await result.response;
            const text = response.text();

            const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();

            try {
                const parsedResponse = JSON.parse(cleanedText);

                if (!parsedResponse.ingredientAnalysis) {
                    throw new Error('Invalid response structure: missing ingredientAnalysis object');
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
                error: 'Ingredient recognition failed',
                details: 'Unable to analyze the kitchen image'
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