import { GoogleGenerativeAI } from '@google/generative-ai';
import { NutritionalInfo, WebSearchResult, SearchResponse, GeminiResponse } from '../../../types/nutrition';

// Dictionnaire de traductions pour les termes courants
const translationMap: { [key: string]: string } = {
    // Pancakes et gaufres
    'pancake': 'crêpe américaine',
    'pancakes': 'crêpes américaines',
    'waffle': 'gaufre',
    'waffles': 'gaufres',
    
    // Autres termes courants
    'burger': 'hamburger',
    'pizza': 'pizza',
    'sandwich': 'sandwich',
    'salad': 'salade',
    'soup': 'soupe',
    'bread': 'pain',
    'cheese': 'fromage',
    'milk': 'lait',
    'egg': 'œuf',
    'eggs': 'œufs',
    'chicken': 'poulet',
    'beef': 'bœuf',
    'fish': 'poisson',
    'rice': 'riz',
    'pasta': 'pâtes',
    'potato': 'pomme de terre',
    'tomato': 'tomate',
    'apple': 'pomme',
    'banana': 'banane',
    'orange': 'orange',
    'coffee': 'café',
    'tea': 'thé',
    'juice': 'jus',
    'water': 'eau',
    'yogurt': 'yaourt',
    'butter': 'beurre',
    'oil': 'huile',
    'sugar': 'sucre',
    'salt': 'sel',
    'pepper': 'poivre'
};

export async function POST(req: Request): Promise<Response> {
    try {
        const geminiApiKey = process.env.GEMINI_API_KEY;
        const searchApiKey = process.env.SEARCH_API_KEY || process.env.GOOGLE_SEARCH_API_KEY;

        if (!geminiApiKey) {
            console.error('GEMINI_API_KEY is not defined in environment variables');
            return Response.json({ error: 'API configuration error' }, { status: 500 });
        }

        const { query } = await req.json();

        if (!query || typeof query !== 'string') {
            return Response.json({ error: 'Search query is required' }, { status: 400 });
        }

        // Traduire la requête si elle est en anglais
        const translatedQuery = translateQuery(query);
        const isTranslated = translatedQuery !== query;

        // Recherche web pour obtenir des informations nutritionnelles précises
        let nutritionalData = null;
        
        if (searchApiKey) {
            try {
                // Essayer d'abord avec la requête originale, puis avec la traduction
                nutritionalData = await searchNutritionalData(query, searchApiKey);
                if (!nutritionalData && isTranslated) {
                    nutritionalData = await searchNutritionalData(translatedQuery, searchApiKey);
                }
            } catch (searchError) {
                console.warn('Web search failed, falling back to Gemini:', searchError);
            }
        }

        // Si pas de données de recherche web, utiliser Gemini avec prompt amélioré
        if (!nutritionalData) {
            nutritionalData = await getGeminiNutritionalData(query, translatedQuery, isTranslated, geminiApiKey);
        }

        const response: SearchResponse = {
            success: true,
            data: nutritionalData,
            source: nutritionalData[0]?.source || 'ai_generated',
            translation: isTranslated ? { original: query, translated: translatedQuery } : undefined
        };
        
        return Response.json(response);

    } catch (error) {
        console.error('General error:', error);
        return Response.json({
            error: 'Request processing error',
            details: 'Unable to process the request'
        }, { status: 500 });
    }
}

// Fonction de traduction des termes courants
function translateQuery(query: string): string {
    const lowerQuery = query.toLowerCase().trim();
    
    // Vérifier les correspondances exactes
    if (translationMap[lowerQuery]) {
        return translationMap[lowerQuery];
    }
    
    // Vérifier les correspondances partielles
    for (const [english, french] of Object.entries(translationMap)) {
        if (lowerQuery.includes(english)) {
            return lowerQuery.replace(new RegExp(english, 'gi'), french);
        }
    }
    
    return query;
}

async function searchNutritionalData(query: string, apiKey: string) {
    try {
        // Recherche sur des sites de nutrition fiables
        const searchQueries = [
            `${query} calories protéines glucides lipides nutrition 100g`,
            `${query} valeurs nutritionnelles composition`,
            `${query} table nutritionnelle Ciqual`
        ];

        const results: WebSearchResult[] = [];
        
        for (const searchQuery of searchQueries) {
            try {
                // Utiliser l'API de recherche Google Custom Search
                const searchResponse = await fetch(
                    `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}&num=3`
                );

                if (searchResponse.ok) {
                    const searchData = await searchResponse.json();
                    
                    if (searchData.items) {
                        for (const item of searchData.items) {
                            const extractedData = await extractNutritionalInfo(item.link, item.snippet);
                            if (extractedData) {
                                results.push({
                                    ...extractedData,
                                    source: 'web_search',
                                    searchResult: item.title
                                });
                            }
                        }
                    }
                }
            } catch (error) {
                console.warn(`Search query failed for: ${searchQuery}`, error);
            }
        }

        // Si on a des résultats, les traiter et les formater
        if (results.length > 0) {
            return processWebSearchResults(results, query);
        }

        return null;
    } catch (error) {
        console.error('Web search error:', error);
        return null;
    }
}

async function extractNutritionalInfo(url: string, snippet: string): Promise<WebSearchResult | null> {
    try {
        // Extraire les informations nutritionnelles du snippet et de l'URL
        const nutritionPattern = /(\d+(?:[.,]\d+)?)\s*(?:kcal|calories?|cal)/i;
        const proteinPattern = /(\d+(?:[.,]\d+)?)\s*(?:g|grammes?)\s*(?:protéines?|protein)/i;
        const carbsPattern = /(\d+(?:[.,]\d+)?)\s*(?:g|grammes?)\s*(?:glucides?|carbs|glucides?)/i;
        const fatsPattern = /(\d+(?:[.,]\d+)?)\s*(?:g|grammes?)\s*(?:lipides?|fats|graisses?)/i;

        const calories = snippet.match(nutritionPattern)?.[1];
        const protein = snippet.match(proteinPattern)?.[1];
        const carbs = snippet.match(carbsPattern)?.[1];
        const fats = snippet.match(fatsPattern)?.[1];

        if (calories || protein || carbs || fats) {
            return {
                calories: calories ? parseFloat(calories.replace(',', '.')) : null,
                protein: protein ? parseFloat(protein.replace(',', '.')) : null,
                carbs: carbs ? parseFloat(carbs.replace(',', '.')) : null,
                fats: fats ? parseFloat(fats.replace(',', '.')) : null,
                url: url,
                source: 'web_search'
            };
        }

        return null;
    } catch (error) {
        console.warn('Failed to extract nutritional info:', error);
        return null;
    }
}

function processWebSearchResults(results: WebSearchResult[], originalQuery: string): NutritionalInfo[] {
    // Dédupliquer et valider les résultats
    const uniqueResults = [];
    const seen = new Set();

    for (const result of results) {
        const key = `${result.calories}-${result.protein}-${result.carbs}-${result.fats}`;
        if (!seen.has(key) && isValidNutritionalData(result)) {
            seen.add(key);
            uniqueResults.push(result);
        }
    }

    // Formater les résultats selon le format attendu
    return uniqueResults.slice(0, 5).map(result => ({
        name: originalQuery,
        calories: result.calories || 0,
        protein: result.protein || 0,
        carbs: result.carbs || 0,
        fats: result.fats || 0,
        portion: "100g",
        category: determineCategory(originalQuery),
        source: result.source as 'web_search',
        confidence: calculateConfidence(result)
    }));
}

function isValidNutritionalData(data: any): boolean {
    return data.calories > 0 && data.calories < 1000 && 
           data.protein >= 0 && data.protein < 100 &&
           data.carbs >= 0 && data.carbs < 100 &&
           data.fats >= 0 && data.fats < 100;
}

function calculateConfidence(data: any): number {
    let confidence = 0;
    if (data.calories) confidence += 25;
    if (data.protein) confidence += 25;
    if (data.carbs) confidence += 25;
    if (data.fats) confidence += 25;
    return confidence;
}

function determineCategory(foodName: string): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
    const breakfastFoods = ['céréales', 'pain', 'beurre', 'confiture', 'lait', 'yaourt', 'œuf', 'fromage'];
    const lunchFoods = ['poulet', 'poisson', 'viande', 'légumes', 'riz', 'pâtes', 'salade'];
    const dinnerFoods = ['soupe', 'grillade', 'plat', 'entrée'];
    const snackFoods = ['fruit', 'noix', 'chocolat', 'biscuit', 'gâteau'];

    const lowerName = foodName.toLowerCase();
    
    if (breakfastFoods.some(food => lowerName.includes(food))) return 'breakfast';
    if (lunchFoods.some(food => lowerName.includes(food))) return 'lunch';
    if (dinnerFoods.some(food => lowerName.includes(food))) return 'dinner';
    if (snackFoods.some(food => lowerName.includes(food))) return 'snack';
    
    return 'lunch'; // Par défaut
}

async function getGeminiNutritionalData(query: string, translatedQuery: string, isTranslated: boolean, apiKey: string) {
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
            temperature: 0.1, // Plus bas pour plus de précision
            topP: 0.8,
            topK: 20
        }
    });

    const prompt = `Recherche les informations nutritionnelles PRÉCISES et ACTUELLES pour "${query}" en France.

${isTranslated ? `NOTE: La requête originale était "${query}" et a été traduite en "${translatedQuery}". Recherche avec les deux termes pour plus de précision.` : ''}

Utilise les données officielles françaises (Ciqual, ANSES) et les sources fiables.

Retourne UNIQUEMENT un JSON valide avec cette structure exacte:

{
  "foods": [
    {
      "name": "Nom exact en français",
      "calories": nombre uniquement (kcal/100g),
      "protein": nombre uniquement (g/100g),
      "carbs": nombre uniquement (g/100g), 
      "fats": nombre uniquement (g/100g),
      "portion": "100g",
      "category": "breakfast/lunch/dinner/snack"
    }
  ]
}

RÈGLES STRICTES:
- Données par 100g uniquement
- Valeurs numériques précises (pas d'approximations)
- Sources officielles françaises prioritaires
- Maximum 5 aliments pertinents
- Catégorisation basée sur l'usage typique
- JSON valide sans formatage markdown
- Si la requête est en anglais, inclure aussi les équivalents français

Recherche: "${query}"${isTranslated ? ` (traduit: "${translatedQuery}")` : ''}`;

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

            return parsedResponse.foods.map((food: any) => ({
                ...food,
                source: 'ai_generated',
                confidence: 70
            }));

        } catch (parseError) {
            console.error('Failed to parse Gemini response as JSON:', parseError);
            
            // Tentative d'extraction de JSON partiel
            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const extractedJson = JSON.parse(jsonMatch[0]);
                    if (extractedJson.foods && Array.isArray(extractedJson.foods)) {
                        return extractedJson.foods.map((food: any) => ({
                            ...food,
                            source: 'ai_generated',
                            confidence: 60
                        }));
                    }
                } catch (extractError) {
                    console.error('Extract error:', extractError);
                }
            }

            throw new Error('Could not parse response as JSON');
        }
    } catch (apiError) {
        console.error('Gemini API Error:', apiError);
        throw apiError;
    }
}