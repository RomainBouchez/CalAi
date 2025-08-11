// Unified food analysis types
export interface NutritionFacts {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    cholesterol?: number;
}

export interface FoodAnalysis {
    id?: string;
    food_name: string;
    estimated_weight_grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    cholesterol?: number;
    vitamins?: string[];
    image?: string;
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    createdAt?: Date;
}

// API Response types
export interface GeminiNutritionResponse {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber?: string;
    sugar?: string;
    sodium?: string;
    cholesterol?: string;
}

export interface GeminiAnalysisData {
    identifiedFood: string;
    portionSize: string;
    recognizedServingSize?: string;
    nutritionFactsPerPortion: GeminiNutritionResponse;
    nutritionFactsPer100g?: GeminiNutritionResponse;
    additionalNotes?: string[];
}

export interface ApiResponse {
    success: boolean;
    data: {
        foodAnalysis: GeminiAnalysisData;
    };
    note?: string;
}

// Database types (matching Prisma schema)
export interface FoodEntry {
    id: string;
    userId: string;
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    cholesterol?: number;
    portionSize?: number;
    mealType?: string;
    imageUrl?: string;
    notes: string[];
    createdAt: Date;
    updatedAt: Date;
}

// Utility type for converting Gemini response to our format
export type GeminiToFoodAnalysis = (geminiData: GeminiAnalysisData) => FoodAnalysis;

// Meal context types
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MealEntry {
    id: string;
    date: Date;
    mealType: MealType;
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    weight?: number;
    image?: string;
}

export interface DailyGoals {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sodium?: number;
}

export interface MealGoals {
    breakfast: DailyGoals;
    lunch: DailyGoals;
    dinner: DailyGoals;
    snack: DailyGoals;
}