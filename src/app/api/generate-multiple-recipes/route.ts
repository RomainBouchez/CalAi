import { GoogleGenerativeAI } from '@google/generative-ai';

interface MacroControls {
    protein: boolean;
    carbs: boolean;
    fats: boolean;
}

interface RecipeRequest {
    availableIngredients: Array<{
        name: string;
        quantity: string;
        unit?: string;
        category: string;
    }>;
    nutritionalNeeds: {
        calories: number;
        protein?: number;
        carbs?: number;
        fats?: number;
    };
    autoMacros?: boolean;
    macroControls?: MacroControls;
    recipeType?: string;
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
        const { availableIngredients, nutritionalNeeds, autoMacros, macroControls, recipeType, userPreferences, mealType } = requestData;

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
                temperature: 0.4,
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

        const recipeTypeText = recipeType 
            ? `\nTYPE DE PLAT SOUHAITÉ: "${recipeType}" - Adaptez ce type de plat avec les ingrédients disponibles`
            : '';

        // Configuration des objectifs nutritionnels selon le mode
        const nutritionObjectives = autoMacros 
            ? `- Calories: EXACTEMENT ${nutritionalNeeds.calories} kcal
- Protéines, glucides, lipides: CALCULÉS AUTOMATIQUEMENT de manière optimale pour le type de plat${recipeType ? ` (${recipeType})` : ''}`
            : (() => {
                const objectives = [`- Calories: EXACTEMENT ${nutritionalNeeds.calories} kcal`];
                if (macroControls?.protein && nutritionalNeeds.protein) {
                    objectives.push(`- Protéines: EXACTEMENT ${nutritionalNeeds.protein}g`);
                } else {
                    objectives.push(`- Protéines: CALCULÉES AUTOMATIQUEMENT par l'IA`);
                }
                if (macroControls?.carbs && nutritionalNeeds.carbs) {
                    objectives.push(`- Glucides: EXACTEMENT ${nutritionalNeeds.carbs}g`);
                } else {
                    objectives.push(`- Glucides: CALCULÉS AUTOMATIQUEMENT par l'IA`);
                }
                if (macroControls?.fats && nutritionalNeeds.fats) {
                    objectives.push(`- Lipides: EXACTEMENT ${nutritionalNeeds.fats}g`);
                } else {
                    objectives.push(`- Lipides: CALCULÉS AUTOMATIQUEMENT par l'IA`);
                }
                return objectives.join('\n');
            })();

        const prompt = `Vous êtes un chef cuisinier expert et nutritionniste. Créez 3 RECETTES DIFFÉRENTES pour un ${mealType} en utilisant UNIQUEMENT les ingrédients disponibles ci-dessous.

INGRÉDIENTS DISPONIBLES:
${ingredientsList}${recipeTypeText}

OBJECTIFS NUTRITIONNELS (pour chaque recette):
${nutritionObjectives}

CONTRAINTES:
- Utilisez UNIQUEMENT les ingrédients listés
- ${recipeType ? `RESPECTEZ LE TYPE DE PLAT: "${recipeType}" - Les 3 recettes doivent être des variations de ce type de plat` : 'Chaque recette doit être TRÈS DIFFÉRENTE des autres'}
- Adaptée au type de repas: ${mealType}
- Valeurs nutritionnelles EXACTES selon les objectifs${restrictionsText}${allergiesText}

STYLES RECHERCHÉS:
${recipeType ? 
    `1. VERSION TRADITIONNELLE de "${recipeType}": Approche classique et authentique
2. VERSION MODERNE de "${recipeType}": Techniques contemporaines et créatives  
3. VERSION SANTÉ de "${recipeType}": Focus nutrition optimale et ingrédients sains`
    :
    `1. RECETTE TRADITIONNELLE: Cuisine française classique, techniques traditionnelles
2. RECETTE MODERNE: Approche créative, techniques contemporaines, présentation moderne
3. RECETTE SANTÉ: Focus sur la nutrition optimale, cuisson saine, légumes mis en valeur`
}

Retournez un JSON avec exactement cette structure:
{
  "recipes": [
    {
      "recipeName": "nom appétissant de la recette 1",
      "description": "description courte style traditionnel",
      "style": "traditional",
      "ingredients": [
        {
          "name": "nom de l'ingrédient",
          "quantity": "quantité précise",
          "unit": "unité",
          "notes": "notes optionnelles"
        }
      ],
      "instructions": [
        "Étape 1 détaillée",
        "Étape 2 détaillée"
      ],
      "nutritionalInfo": {
        "calories": 500,
        "protein": 30,
        "carbs": 50,
        "fats": 20,
        "fiber": 5,
        "sodium": 800
      },
      "cookingInfo": {
        "prepTime": 15,
        "cookTime": 25,
        "servings": 1,
        "difficulty": "medium"
      },
      "tips": [
        "conseil 1",
        "conseil 2"
      ]
    },
    {
      "recipeName": "nom de la recette 2 (DIFFÉRENTE)",
      "description": "description style moderne",
      "style": "modern",
      // même structure...
    },
    {
      "recipeName": "nom de la recette 3 (TRÈS DIFFÉRENTE)", 
      "description": "description style santé",
      "style": "healthy",
      // même structure...
    }
  ]
}

IMPORTANT:
- Les 3 recettes doivent être VRAIMENT différentes (techniques, saveurs, présentation)
- Quantités précises pour chaque ingrédient
- Instructions claires et détaillées
- Respecter les valeurs nutritionnelles cibles
- JSON valide sans formatage markdown`;

        try {
            const result = await model.generateContent([prompt]);
            const response = await result.response;
            const text = response.text();

            const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();

            try {
                const parsedResponse = JSON.parse(cleanedText);

                if (!parsedResponse.recipes || !Array.isArray(parsedResponse.recipes)) {
                    throw new Error('Invalid response structure: missing recipes array');
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
                details: 'Unable to generate recipes with available ingredients'
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