'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Ingredient, UserInventory } from '@/types/food';

export async function saveUserInventory(
    userId: string,
    ingredients: Ingredient[]
): Promise<{ success: boolean; error?: string }> {
    try {
        // Clear existing non-staple inventory
        await prisma.userInventory.deleteMany({
            where: {
                user_id: userId,
                is_staple: false
            }
        });

        // Add new ingredients
        if (ingredients.length > 0) {
            await prisma.userInventory.createMany({
                data: ingredients.map(ingredient => ({
                    user_id: userId,
                    name: ingredient.name,
                    category: ingredient.category,
                    is_staple: ingredient.isStaple || false,
                    quantity: ingredient.quantity,
                    unit: ingredient.unit,
                    expiry_date: ingredient.expiryDate || null,
                }))
            });
        }

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error saving inventory:', error);
        return { success: false, error: 'Failed to save inventory' };
    }
}

export async function addStapleIngredient(
    userId: string,
    name: string,
    category: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.userInventory.create({
            data: {
                user_id: userId,
                name: name,
                category: category,
                is_staple: true,
                quantity: 'toujours disponible',
            }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error adding staple ingredient:', error);
        return { success: false, error: 'Failed to add staple ingredient' };
    }
}

export async function removeInventoryItem(
    itemId: string,
    userId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.userInventory.deleteMany({
            where: {
                id: itemId,
                user_id: userId
            }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error removing inventory item:', error);
        return { success: false, error: 'Failed to remove inventory item' };
    }
}

export async function getUserInventory(userId: string): Promise<UserInventory[]> {
    try {
        const inventory = await prisma.userInventory.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });

        return inventory.map(item => ({
            id: item.id,
            userId: item.user_id,
            name: item.name,
            category: item.category || undefined,
            isStaple: item.is_staple,
            quantity: item.quantity || undefined,
            unit: item.unit || undefined,
            expiryDate: item.expiry_date || undefined,
            imageUrl: item.image_url || undefined,
            createdAt: item.created_at || new Date(),
            updatedAt: item.updated_at || new Date(),
        }));
    } catch (error) {
        console.error('Error fetching inventory:', error);
        return [];
    }
}

export async function updateInventoryItem(
    itemId: string,
    userId: string,
    updates: {
        name?: string;
        category?: string;
        quantity?: string;
        unit?: string;
        expiryDate?: Date;
    }
): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.userInventory.updateMany({
            where: {
                id: itemId,
                user_id: userId
            },
            data: {
                name: updates.name,
                category: updates.category,
                quantity: updates.quantity,
                unit: updates.unit,
                expiry_date: updates.expiryDate,
                updated_at: new Date()
            }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error updating inventory item:', error);
        return { success: false, error: 'Failed to update inventory item' };
    }
}