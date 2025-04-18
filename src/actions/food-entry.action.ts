"use server";

import { prisma } from "@/lib/prisma";

// Simplified version without authentication
export async function saveFoodEntry(analysis: any) {
    try {
        // Define a fixed userId for all entries as we're not using authentication
        const userId = "anonymous-user";

        return prisma.foodEntry.create({
            data: {
                userId,
                foodName: analysis.food_name,
                calories: analysis.calories,
                protein: analysis.protein,
                carbs: analysis.carbs,
                fats: analysis.fats
            }
        });
    } catch (error) {
        console.error("Error saving food entry:", error);
        // Return a simple error object that can be serialized
        return { error: "Failed to save food entry" };
    }
}