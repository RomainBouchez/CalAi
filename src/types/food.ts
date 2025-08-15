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

// Culinary Assistant Types
export interface Ingredient {
    id?: string;
    name: string;
    category: 'vegetables' | 'fruits' | 'meat' | 'dairy' | 'grains' | 'spices' | 'condiments' | 'beverages' | 'other';
    quantity: string;
    unit?: string;
    condition?: 'fresh' | 'near expiry' | 'expired' | 'canned' | 'frozen' | 'dried';
    confidence?: 'high' | 'medium' | 'low';
    location?: string;
    isStaple?: boolean;
    expiryDate?: Date;
}

export interface IngredientRecognitionResponse {
    identifiedIngredients: Ingredient[];
    totalItemsFound: number;
    imageQuality: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
}

export interface IngredientApiResponse {
    success: boolean;
    data: {
        ingredientAnalysis: IngredientRecognitionResponse;
    };
    note?: string;
}

export interface UserInventory {
    id: string;
    userId: string;
    name: string;
    category?: string;
    isStaple: boolean;
    quantity?: string;
    unit?: string;
    expiryDate?: Date;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RecipeIngredient {
    id: string;
    recipeId: string;
    inventoryId?: string;
    name: string;
    quantity: string;
    unit?: string;
    notes?: string;
}

export interface Recipe {
    id: string;
    userId: string;
    name: string;
    description?: string;
    instructions: string[];
    prepTime?: number;
    cookTime?: number;
    servings: number;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sodium?: number;
    sugar?: number;
    imageUrl?: string;
    isAiGenerated: boolean;
    createdAt: Date;
    updatedAt: Date;
    ingredients: RecipeIngredient[];
}

export interface NutritionalNeeds {
    remainingCalories: number;
    remainingProtein: number;
    remainingCarbs: number;
    remainingFats: number;
    remainingFiber?: number;
    remainingSodium?: number;
}

export interface UserPreferences {
    dietaryRestrictions?: string[];
    allergies?: string[];
    cuisinePreferences?: string[];
    difficultyLevel?: 'easy' | 'medium' | 'hard';
    maxCookTime?: number;
}

export interface RecipeGenerationRequest {
    availableIngredients: Ingredient[];
    nutritionalNeeds: NutritionalNeeds;
    userPreferences?: UserPreferences;
    mealType: MealType;
}

export interface GeneratedRecipe {
    recipeName: string;
    description: string;
    ingredients: RecipeIngredient[];
    instructions: string[];
    nutritionalInfo: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
        fiber?: number;
        sodium?: number;
        sugar?: number;
    };
    cookingInfo: {
        prepTime: number;
        cookTime: number;
        servings: number;
        difficulty: 'easy' | 'medium' | 'hard';
    };
    tips: string[];
    unusedIngredients: string[];
}

export interface RecipeApiResponse {
    success: boolean;
    data: {
        recipeGeneration: GeneratedRecipe;
    };
    note?: string;
}

export interface MealPlan {
    id: string;
    userId: string;
    recipeId: string;
    plannedDate: Date;
    mealType: string;
    servings: number;
    status: 'planned' | 'cooking' | 'completed' | 'skipped';
    createdAt: Date;
}