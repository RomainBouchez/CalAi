import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request): Promise<Response> {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error('GEMINI_API_KEY is not defined in environment variables');
            return Response.json({ error: 'API configuration error' }, { status: 500 });
        }

        const formData = await req.formData();
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            return Response.json({ error: 'Image is required' }, { status: 400 });
        }

        // Convert image to base64
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');
        const mimeType = imageFile.type;

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
                temperature: 0.1,
                topP: 0.8,
                topK: 40
            }
        });

        const prompt = `Analyze this product image and extract nutritional information. Look for:
1. Product name and brand
2. Barcode if visible
3. Nutritional information (calories, protein, carbs, fats per 100g)
4. Ingredients list if visible

Provide the information in the following JSON format:

{
  "product": {
    "name": "Product name in English",
    "brand": "Brand name if visible",
    "barcode": "Barcode number if visible, otherwise null",
    "calories": "Numeric value only (per 100g)",
    "protein": "Numeric value only (per 100g)", 
    "carbs": "Numeric value only (per 100g)",
    "fats": "Numeric value only (per 100g)",
    "fiber": "Numeric value only (per 100g) if available",
    "sugar": "Numeric value only (per 100g) if available",
    "sodium": "Numeric value in mg (per 100g) if available",
    "portion": "100g",
    "category": "breakfast/lunch/dinner/snack based on product type",
    "confidence": "high/medium/low based on visibility of nutritional info"
  }
}

Rules:
- If nutritional info is clearly visible, use those exact values
- If not visible, provide reasonable estimates based on the product type
- All nutritional values should be per 100g
- Use English product names when possible
- Categories: breakfast, lunch, dinner, or snack
- Provide only numeric values without units in the JSON
- If you can't identify the product clearly, set confidence to "low"

Provide only valid JSON without markdown formatting.`;

        try {
            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType
                    }
                }
            ]);

            const response = await result.response;
            const responseText = response.text();

            const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();

            try {
                const parsedResponse = JSON.parse(cleanedText);

                if (!parsedResponse.product) {
                    throw new Error('Invalid response structure: missing product object');
                }

                const product = parsedResponse.product;

                // Validation des données essentielles
                if (!product.name || typeof product.calories !== 'number') {
                    throw new Error('Missing essential product information');
                }

                return Response.json({
                    success: true,
                    data: {
                        name: product.name,
                        brand: product.brand || null,
                        barcode: product.barcode || null,
                        calories: Number(product.calories) || 0,
                        protein: Number(product.protein) || 0,
                        carbs: Number(product.carbs) || 0,
                        fats: Number(product.fats) || 0,
                        fiber: Number(product.fiber) || 0,
                        sugar: Number(product.sugar) || 0,
                        sodium: Number(product.sodium) || 0,
                        portion: "100g",
                        category: product.category || "snack",
                        confidence: product.confidence || "medium"
                    },
                });
            } catch (parseError) {
                console.error('Failed to parse Gemini response as JSON:', parseError);

                const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        const extractedJson = JSON.parse(jsonMatch[0]);
                        if (extractedJson.product) {
                            const product = extractedJson.product;
                            return Response.json({
                                success: true,
                                data: {
                                    name: product.name || "Unidentified product",
                                    brand: product.brand || null,
                                    barcode: product.barcode || null,
                                    calories: Number(product.calories) || 0,
                                    protein: Number(product.protein) || 0,
                                    carbs: Number(product.carbs) || 0,
                                    fats: Number(product.fats) || 0,
                                    portion: "100g",
                                    category: product.category || "snack",
                                    confidence: "low"
                                },
                                note: "Response was extracted from partial JSON"
                            });
                        }
                    } catch (extractError) {
                        console.error('Extract error:', extractError);
                    }
                }

                return Response.json({
                    error: 'Unable to analyze this product',
                    details: 'The image is not clear enough or does not contain nutritional information'
                }, { status: 400 });
            }
        } catch (apiError) {
            console.error('Gemini API Error:', apiError);

            return Response.json({
                error: 'Error analyzing the product',
                details: 'Service temporarily unavailable'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('General error:', error);

        return Response.json({
            error: 'Processing error',
            details: 'Unable to process the image'
        }, { status: 500 });
    }
}