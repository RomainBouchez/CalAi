import { z } from "zod";

export const FoodAnalysisSchema = z.object({
    food_name: z.string(),
    estimated_weight_grams: z.number(),
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fats: z.number(),
    vitamins: z.array(z.string()).optional()
});
