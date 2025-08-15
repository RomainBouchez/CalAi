'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { GeneratedRecipe, Recipe, RecipeIngredient } from '@/types/food';

export async function saveGeneratedRecipe(
    userId: string,
    generatedRecipe: GeneratedRecipe
): Promise<{ success: boolean; recipeId?: string; error?: string }> {
    try {
        const recipe = await prisma.recipe.create({
            data: {
                user_id: userId,
                name: generatedRecipe.recipeName,
                description: generatedRecipe.description,
                instructions: generatedRecipe.instructions,
                prep_time: generatedRecipe.cookingInfo.prepTime,
                cook_time: generatedRecipe.cookingInfo.cookTime,
                servings: generatedRecipe.cookingInfo.servings,
                calories: generatedRecipe.nutritionalInfo.calories,
                protein: generatedRecipe.nutritionalInfo.protein,
                carbs: generatedRecipe.nutritionalInfo.carbs,
                fats: generatedRecipe.nutritionalInfo.fats,
                fiber: generatedRecipe.nutritionalInfo.fiber || 0,
                sodium: generatedRecipe.nutritionalInfo.sodium || 0,
                sugar: generatedRecipe.nutritionalInfo.sugar || 0,
                is_ai_generated: true,
                ingredients: {
                    create: generatedRecipe.ingredients.map(ingredient => ({
                        name: ingredient.name,
                        quantity: ingredient.quantity,
                        unit: ingredient.unit,
                        notes: ingredient.notes,
                    }))
                }
            },
            include: {
                ingredients: true
            }
        });

        revalidatePath('/dashboard');
        return { success: true, recipeId: recipe.id };
    } catch (error) {
        console.error('Error saving recipe:', error);
        return { success: false, error: 'Failed to save recipe' };
    }
}

export async function getUserRecipes(userId: string): Promise<Recipe[]> {
    try {
        const recipes = await prisma.recipe.findMany({
            where: { user_id: userId },
            include: { ingredients: true },
            orderBy: { created_at: 'desc' }
        });

        return recipes.map(recipe => ({
            id: recipe.id,
            userId: recipe.user_id,
            name: recipe.name,
            description: recipe.description || undefined,
            instructions: recipe.instructions,
            prepTime: recipe.prep_time || undefined,
            cookTime: recipe.cook_time || undefined,
            servings: recipe.servings,
            calories: recipe.calories,
            protein: Number(recipe.protein),
            carbs: Number(recipe.carbs),
            fats: Number(recipe.fats),
            fiber: recipe.fiber ? Number(recipe.fiber) : undefined,
            sodium: recipe.sodium ? Number(recipe.sodium) : undefined,
            sugar: recipe.sugar ? Number(recipe.sugar) : undefined,
            imageUrl: recipe.image_url || undefined,
            isAiGenerated: recipe.is_ai_generated,
            createdAt: recipe.created_at || new Date(),
            updatedAt: recipe.updated_at || new Date(),
            ingredients: recipe.ingredients.map(ingredient => ({
                id: ingredient.id,
                recipeId: ingredient.recipe_id,
                inventoryId: ingredient.inventory_id || undefined,
                name: ingredient.name,
                quantity: ingredient.quantity,
                unit: ingredient.unit || undefined,
                notes: ingredient.notes || undefined,
            }))
        }));
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return [];
    }
}

export async function deleteRecipe(recipeId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.recipe.deleteMany({
            where: {
                id: recipeId,
                user_id: userId
            }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error deleting recipe:', error);
        return { success: false, error: 'Failed to delete recipe' };
    }
}

export async function createMealPlan(
    userId: string,
    recipeId: string,
    plannedDate: Date,
    mealType: string,
    servings: number = 1
): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.mealPlan.create({
            data: {
                user_id: userId,
                recipe_id: recipeId,
                planned_date: plannedDate,
                meal_type: mealType,
                servings: servings,
                status: 'planned'
            }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error creating meal plan:', error);
        return { success: false, error: 'Failed to create meal plan' };
    }
}