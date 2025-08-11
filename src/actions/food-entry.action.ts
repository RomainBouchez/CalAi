"use server";

import { prisma } from "@/lib/prisma";

export interface FoodAnalysisInput {
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    estimated_weight_grams?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    cholesterol?: number;
    image?: string;
    vitamins?: string[];
    mealType?: string;
}

export async function saveFoodEntry(analysis: FoodAnalysisInput) {
    try {
        const userId = "anonymous-user";
        
        // Ensure user exists
        await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: {
                id: userId,
                name: "Anonymous User"
            }
        });

        const foodEntry = await prisma.foodEntry.create({
            data: {
                userId,
                foodName: analysis.food_name,
                calories: analysis.calories,
                protein: analysis.protein,
                carbs: analysis.carbs,
                fats: analysis.fats,
                fiber: analysis.fiber,
                sugar: analysis.sugar,
                sodium: analysis.sodium,
                cholesterol: analysis.cholesterol,
                portionSize: analysis.estimated_weight_grams,
                mealType: analysis.mealType,
                imageUrl: analysis.image,
                notes: analysis.vitamins || []
            }
        });

        return { success: true, data: foodEntry };
    } catch (error) {
        console.error("Error saving food entry:", error);
        return { error: "Failed to save food entry" };
    }
}

export async function getFoodEntries(userId: string = "anonymous-user") {
    try {
        const entries = await prisma.foodEntry.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to last 50 entries
        });

        return { success: true, data: entries };
    } catch (error) {
        console.error("Error fetching food entries:", error);
        return { error: "Failed to fetch food entries" };
    }
}

export async function deleteFoodEntry(id: string) {
    try {
        await prisma.foodEntry.delete({
            where: { id }
        });

        return { success: true };
    } catch (error) {
        console.error("Error deleting food entry:", error);
        return { error: "Failed to delete food entry" };
    }
}