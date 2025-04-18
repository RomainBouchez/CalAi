"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function saveFoodEntry(analysis: any) {
    const { userId } = await auth();

    if (!userId) throw new Error("Utilisateur non authentifié");

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
}