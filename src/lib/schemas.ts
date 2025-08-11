import { z } from "zod";

// Environment variables validation
export const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
    GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
    NEXTAUTH_SECRET: z.string().optional(),
    NEXTAUTH_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

// Food analysis validation schemas
export const NutritionFactsSchema = z.object({
    calories: z.number().min(0).max(5000),
    protein: z.number().min(0).max(500),
    carbs: z.number().min(0).max(1000),
    fat: z.number().min(0).max(500),
    fiber: z.number().min(0).max(100).optional(),
    sugar: z.number().min(0).max(500).optional(),
    sodium: z.number().min(0).max(10000).optional(),
    cholesterol: z.number().min(0).max(1000).optional(),
});

export const FoodAnalysisSchema = z.object({
    food_name: z.string().min(1, 'Food name is required'),
    estimated_weight_grams: z.number().min(1).max(10000),
    calories: z.number().min(0).max(5000),
    protein: z.number().min(0).max(500),
    carbs: z.number().min(0).max(1000),
    fats: z.number().min(0).max(500),
    fiber: z.number().min(0).max(100).optional(),
    sugar: z.number().min(0).max(500).optional(),
    sodium: z.number().min(0).max(10000).optional(),
    cholesterol: z.number().min(0).max(1000).optional(),
    vitamins: z.array(z.string()).optional(),
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
    image: z.string().optional()
});

// API request/response schemas
export const AnalyzeImageRequestSchema = z.object({
    image: z.object({
        inlineData: z.object({
            data: z.string().min(1, 'Image data is required'),
            mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/, 'Invalid image format')
        })
    })
});

export const AnalyzeTextRequestSchema = z.object({
    text: z.string().min(1, 'Text description is required').max(1000, 'Text too long')
});

// Gemini API response schema
export const GeminiNutritionResponseSchema = z.object({
    calories: z.string(),
    protein: z.string(),
    carbs: z.string(),
    fat: z.string(),
    fiber: z.string().optional(),
    sugar: z.string().optional(),
    sodium: z.string().optional(),
    cholesterol: z.string().optional()
});

export const GeminiAnalysisSchema = z.object({
    identifiedFood: z.string(),
    portionSize: z.string(),
    recognizedServingSize: z.string().optional(),
    nutritionFactsPerPortion: GeminiNutritionResponseSchema,
    nutritionFactsPer100g: GeminiNutritionResponseSchema.optional(),
    additionalNotes: z.array(z.string()).optional()
});

export const ApiResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        foodAnalysis: GeminiAnalysisSchema
    }),
    note: z.string().optional()
});

// Database schemas
export const CreateFoodEntrySchema = z.object({
    foodName: z.string().min(1),
    calories: z.number().min(0),
    protein: z.number().min(0),
    carbs: z.number().min(0),
    fats: z.number().min(0),
    fiber: z.number().min(0).optional(),
    sugar: z.number().min(0).optional(),
    sodium: z.number().min(0).optional(),
    cholesterol: z.number().min(0).optional(),
    portionSize: z.number().min(0).optional(),
    mealType: z.string().optional(),
    imageUrl: z.string().optional(),
    notes: z.array(z.string()).default([])
});

export type FoodAnalysisInput = z.infer<typeof FoodAnalysisSchema>;
export type AnalyzeImageRequest = z.infer<typeof AnalyzeImageRequestSchema>;
export type AnalyzeTextRequest = z.infer<typeof AnalyzeTextRequestSchema>;
export type CreateFoodEntryInput = z.infer<typeof CreateFoodEntrySchema>;
