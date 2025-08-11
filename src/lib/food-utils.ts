import { FoodAnalysis, GeminiAnalysisData, FoodEntry, MealEntry } from '@/types/food';

export function convertGeminiToFoodAnalysis(geminiData: GeminiAnalysisData): FoodAnalysis {
    return {
        food_name: geminiData.identifiedFood,
        estimated_weight_grams: parseFloat(geminiData.portionSize) || 100,
        calories: parseFloat(geminiData.nutritionFactsPerPortion.calories) || 0,
        protein: parseFloat(geminiData.nutritionFactsPerPortion.protein) || 0,
        carbs: parseFloat(geminiData.nutritionFactsPerPortion.carbs) || 0,
        fats: parseFloat(geminiData.nutritionFactsPerPortion.fat) || 0,
        fiber: geminiData.nutritionFactsPerPortion.fiber ? 
            parseFloat(geminiData.nutritionFactsPerPortion.fiber) : undefined,
        sugar: geminiData.nutritionFactsPerPortion.sugar ? 
            parseFloat(geminiData.nutritionFactsPerPortion.sugar) : undefined,
        sodium: geminiData.nutritionFactsPerPortion.sodium ? 
            parseFloat(geminiData.nutritionFactsPerPortion.sodium) : undefined,
        cholesterol: geminiData.nutritionFactsPerPortion.cholesterol ? 
            parseFloat(geminiData.nutritionFactsPerPortion.cholesterol) : undefined,
        vitamins: geminiData.additionalNotes || []
    };
}

export function convertFoodEntryToMealEntry(foodEntry: FoodEntry): MealEntry {
    return {
        id: foodEntry.id,
        date: foodEntry.createdAt,
        mealType: (foodEntry.mealType as any) || 'snack',
        foodName: foodEntry.foodName,
        calories: foodEntry.calories,
        protein: foodEntry.protein,
        carbs: foodEntry.carbs,
        fats: foodEntry.fats,
        weight: foodEntry.portionSize,
        image: foodEntry.imageUrl
    };
}

export function validateNutritionValues(analysis: Partial<FoodAnalysis>): boolean {
    const { calories, protein, carbs, fats } = analysis;
    
    // Basic validation - all values should be non-negative
    if (calories && calories < 0) return false;
    if (protein && protein < 0) return false;
    if (carbs && carbs < 0) return false;
    if (fats && fats < 0) return false;
    
    // Reasonable upper bounds (per serving)
    if (calories && calories > 5000) return false;
    if (protein && protein > 500) return false;
    if (carbs && carbs > 1000) return false;
    if (fats && fats > 500) return false;
    
    return true;
}

export function calculateCaloriesFromMacros(protein: number, carbs: number, fats: number): number {
    // 4 kcal/g for protein and carbs, 9 kcal/g for fats
    return (protein * 4) + (carbs * 4) + (fats * 9);
}

export function formatNutritionValue(value?: number, unit: string = 'g', decimals: number = 1): string {
    if (value === undefined || value === null) return '--';
    return `${value.toFixed(decimals)}${unit}`;
}

export function getMealTypeFromTime(date: Date = new Date()): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
    const hour = date.getHours();
    
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 15 && hour < 21) return 'dinner';
    return 'snack';
}

export function groupMealsByDate(meals: MealEntry[]): Record<string, MealEntry[]> {
    return meals.reduce((groups, meal) => {
        const dateKey = meal.date.toISOString().split('T')[0];
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(meal);
        return groups;
    }, {} as Record<string, MealEntry[]>);
}

export function calculateDailyTotals(meals: MealEntry[]) {
    return meals.reduce(
        (totals, meal) => ({
            calories: totals.calories + meal.calories,
            protein: totals.protein + meal.protein,
            carbs: totals.carbs + meal.carbs,
            fats: totals.fats + meal.fats
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
}