import { GoogleGenerativeAI } from '@google/generative-ai';

interface RecipeRequest {
    availableIngredients: Array<{
        name: string;
        quantity: string;
        unit?: string;
        category: string;
    }>;
    nutritionalNeeds: {
        remainingCalories: number;
        remainingProtein: number;
        remainingCarbs: number;
        remainingFats: number;
        remainingFiber?: number;
        remainingSodium?: number;
    };
    userPreferences?: {
        dietaryRestrictions?: string[];
        allergies?: string[];
        cuisinePreferences?: string[];
        difficultyLevel?: 'easy' | 'medium' | 'hard';
        maxCookTime?: number;
    };
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export async function POST(req: Request): Promise<Response> {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error('GEMINI_API_KEY is not defined in environment variables');
            return Response.json({ error: 'API configuration error' }, { status: 500 });
        }

        const requestData: RecipeRequest = await req.json();
        const { availableIngredients, nutritionalNeeds, userPreferences, mealType } = requestData;

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

        const ingredientsList = availableIngredients.map(ing => 
            `- ${ing.name} (${ing.quantity} ${ing.unit || ''})`
        ).join('\n');

        const restrictionsText = userPreferences?.dietaryRestrictions?.length 
            ? `\nRestrictions alimentaires: ${userPreferences.dietaryRestrictions.join(', ')}`
            : '';
        
        const allergiesText = userPreferences?.allergies?.length 
            ? `\nAllergies: ${userPreferences.allergies.join(', ')}`
            : '';

        const cuisineText = userPreferences?.cuisinePreferences?.length 
            ? `\nPréférences culinaires: ${userPreferences.cuisinePreferences.join(', ')}`
            : '';

        const prompt = `Vous êtes un chef cuisinier expert et nutritionniste. Créez une recette délicieuse pour un ${mealType} en utilisant UNIQUEMENT les ingrédients disponibles ci-dessous, et qui corresponde EXACTEMENT aux besoins nutritionnels restants.

INGRÉDIENTS DISPONIBLES:
${ingredientsList}

BESOINS NUTRITIONNELS À ATTEINDRE:
- Calories: ${nutritionalNeeds.remainingCalories} kcal
- Protéines: ${nutritionalNeeds.remainingProtein}g
- Glucides: ${nutritionalNeeds.remainingCarbs}g
- Lipides: ${nutritionalNeeds.remainingFats}g
${nutritionalNeeds.remainingFiber ? `- Fibres: ${nutritionalNeeds.remainingFiber}g` : ''}
${nutritionalNeeds.remainingSodium ? `- Sodium: ${nutritionalNeeds.remainingSodium}mg` : ''}

TYPE DE REPAS: ${mealType}
${restrictionsText}${allergiesText}${cuisineText}
${userPreferences?.difficultyLevel ? `\nNiveau de difficulté souhaité: ${userPreferences.difficultyLevel}` : ''}
${userPreferences?.maxCookTime ? `\nTemps de cuisson maximum: ${userPreferences.maxCookTime} minutes` : ''}

CONTRAINTES IMPORTANTES:
1. Utilisez UNIQUEMENT les ingrédients listés ci-dessus
2. Les valeurs nutritionnelles doivent correspondre au plus près aux besoins restants
3. La recette doit être savoureuse et appétissante
4. Adaptée au type de repas demandé (${mealType})
5. Instructions claires et détaillées

Retournez un JSON avec la structure suivante:
{
  "recipeGeneration": {
    "recipeName": "nom appétissant de la recette",
    "description": "description courte et appétissante",
    "ingredients": [
      {
        "name": "nom de l'ingrédient",
        "quantity": "quantité précise à utiliser",
        "unit": "unité",
        "notes": "notes optionnelles sur la préparation"
      }
    ],
    "instructions": [
      "Étape 1 détaillée",
      "Étape 2 détaillée",
      "etc."
    ],
    "nutritionalInfo": {
      "calories": "nombre exact de calories",
      "protein": "grammes de protéines",
      "carbs": "grammes de glucides", 
      "fats": "grammes de lipides",
      "fiber": "grammes de fibres",
      "sodium": "milligrammes de sodium",
      "sugar": "grammes de sucre"
    },
    "cookingInfo": {
      "prepTime": "temps de préparation en minutes",
      "cookTime": "temps de cuisson en minutes",
      "servings": "nombre de portions",
      "difficulty": "easy, medium ou hard"
    },
    "tips": [
      "conseil de préparation 1",
      "conseil de préparation 2"
    ],
    "unusedIngredients": [
      "liste des ingrédients disponibles mais non utilisés"
    ]
  }
}

Assurez-vous que la recette soit réaliste, délicieuse et que les valeurs nutritionnelles correspondent au mieux aux besoins spécifiés. Retournez uniquement du JSON valide sans formatage markdown.`;

        try {
            const result = await model.generateContent([prompt]);
            const response = await result.response;
            const text = response.text();

            const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();

            try {
                const parsedResponse = JSON.parse(cleanedText);

                if (!parsedResponse.recipeGeneration) {
                    throw new Error('Invalid response structure: missing recipeGeneration object');
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
                error: 'Recipe generation failed',
                details: 'Unable to generate recipe with available ingredients'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('General error:', error);

        return Response.json({
            error: 'Request processing error',
            details: 'Unable to process the recipe generation request'
        }, { status: 500 });
    }
}