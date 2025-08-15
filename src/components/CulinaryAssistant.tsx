'use client';

import React, { useState, useEffect } from 'react';
import { ChefHat, Calendar, Clock, Users, Utensils, Star, BookOpen } from 'lucide-react';
import InventoryManager from './InventoryManager';
import { 
    Ingredient, 
    NutritionalNeeds, 
    UserPreferences, 
    MealType, 
    GeneratedRecipe, 
    RecipeApiResponse 
} from '@/types/food';
import { saveGeneratedRecipe, createMealPlan } from '@/actions/recipe.action';

interface CulinaryAssistantProps {
    userId: string;
    currentCalories: number;
    currentProtein: number;
    currentCarbs: number;
    currentFats: number;
    dailyGoals: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    };
}

export default function CulinaryAssistant({
    userId,
    currentCalories,
    currentProtein,
    currentCarbs,
    currentFats,
    dailyGoals
}: CulinaryAssistantProps) {
    const [activeTab, setActiveTab] = useState<'inventory' | 'assistant' | 'recipes'>('inventory');
    const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
    const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState<MealType>('dinner');
    const [userPreferences, setUserPreferences] = useState<UserPreferences>({
        difficultyLevel: 'easy',
        maxCookTime: 30
    });
    const [isSaving, setIsSaving] = useState(false);

    const calculateNutritionalNeeds = (): NutritionalNeeds => {
        return {
            remainingCalories: Math.max(0, dailyGoals.calories - currentCalories),
            remainingProtein: Math.max(0, dailyGoals.protein - currentProtein),
            remainingCarbs: Math.max(0, dailyGoals.carbs - currentCarbs),
            remainingFats: Math.max(0, dailyGoals.fats - currentFats),
        };
    };

    const generateRecipe = async () => {
        if (availableIngredients.length === 0) {
            alert('Veuillez d\'abord scanner vos ingrédients disponibles.');
            return;
        }

        setIsGenerating(true);
        try {
            const nutritionalNeeds = calculateNutritionalNeeds();
            
            const response = await fetch('/api/generate-recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    availableIngredients,
                    nutritionalNeeds,
                    userPreferences,
                    mealType: selectedMealType,
                }),
            });

            if (response.ok) {
                const data: RecipeApiResponse = await response.json();
                setGeneratedRecipe(data.data.recipeGeneration);
                setActiveTab('recipes');
            } else {
                console.error('Failed to generate recipe');
                alert('Erreur lors de la génération de la recette. Veuillez réessayer.');
            }
        } catch (error) {
            console.error('Error generating recipe:', error);
            alert('Erreur lors de la génération de la recette.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveRecipe = async () => {
        if (!generatedRecipe) return;

        setIsSaving(true);
        try {
            const result = await saveGeneratedRecipe(userId, generatedRecipe);
            if (result.success) {
                alert('Recette sauvegardée avec succès !');
            } else {
                alert('Erreur lors de la sauvegarde de la recette.');
            }
        } catch (error) {
            console.error('Error saving recipe:', error);
            alert('Erreur lors de la sauvegarde de la recette.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleMarkAsPrepared = async () => {
        if (!generatedRecipe) return;

        try {
            // First save the recipe if not already saved
            const saveResult = await saveGeneratedRecipe(userId, generatedRecipe);
            if (saveResult.success && saveResult.recipeId) {
                // Then add to meal plan for today
                const planResult = await createMealPlan(
                    userId,
                    saveResult.recipeId,
                    new Date(),
                    selectedMealType
                );
                
                if (planResult.success) {
                    alert('Recette marquée comme préparée et ajoutée à votre journal !');
                    // TODO: Trigger a refresh of the dashboard to show the new meal
                } else {
                    alert('Recette sauvegardée mais erreur lors de l\'ajout au journal.');
                }
            }
        } catch (error) {
            console.error('Error marking recipe as prepared:', error);
            alert('Erreur lors du marquage de la recette comme préparée.');
        }
    };

    const nutritionalNeeds = calculateNutritionalNeeds();
    const canGenerateRecipe = availableIngredients.length > 0 && (
        nutritionalNeeds.remainingCalories > 50 ||
        nutritionalNeeds.remainingProtein > 5 ||
        nutritionalNeeds.remainingCarbs > 10 ||
        nutritionalNeeds.remainingFats > 5
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <ChefHat className="w-8 h-8" />
                    <div>
                        <h1 className="text-2xl font-bold">Assistant Culinaire Intelligent</h1>
                        <p className="opacity-90">Que dois-je cuisiner maintenant ?</p>
                    </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/20 rounded-lg p-3">
                        <div className="text-sm opacity-90">Calories restantes</div>
                        <div className="text-xl font-bold">{nutritionalNeeds.remainingCalories}</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                        <div className="text-sm opacity-90">Protéines restantes</div>
                        <div className="text-xl font-bold">{nutritionalNeeds.remainingProtein}g</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                        <div className="text-sm opacity-90">Glucides restants</div>
                        <div className="text-xl font-bold">{nutritionalNeeds.remainingCarbs}g</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                        <div className="text-sm opacity-90">Lipides restants</div>
                        <div className="text-xl font-bold">{nutritionalNeeds.remainingFats}g</div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`flex-1 py-3 px-4 text-center font-medium ${
                            activeTab === 'inventory' 
                                ? 'border-b-2 border-blue-500 text-blue-600' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        📦 Mon Inventaire
                    </button>
                    <button
                        onClick={() => setActiveTab('assistant')}
                        className={`flex-1 py-3 px-4 text-center font-medium ${
                            activeTab === 'assistant' 
                                ? 'border-b-2 border-blue-500 text-blue-600' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        🤖 Assistant
                    </button>
                    <button
                        onClick={() => setActiveTab('recipes')}
                        className={`flex-1 py-3 px-4 text-center font-medium ${
                            activeTab === 'recipes' 
                                ? 'border-b-2 border-blue-500 text-blue-600' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        📖 Recettes
                    </button>
                </div>

                <div className="p-6">
                    {/* Inventory Tab */}
                    {activeTab === 'inventory' && (
                        <InventoryManager
                            userId={userId}
                            onInventoryUpdate={setAvailableIngredients}
                        />
                    )}

                    {/* Assistant Tab */}
                    {activeTab === 'assistant' && (
                        <div className="space-y-6">
                            {/* Meal Type Selection */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Type de repas</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedMealType(type)}
                                            className={`p-3 rounded-lg border text-center ${
                                                selectedMealType === type
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            {type === 'breakfast' && '🥐 Petit-déjeuner'}
                                            {type === 'lunch' && '🥗 Déjeuner'}
                                            {type === 'dinner' && '🍽️ Dîner'}
                                            {type === 'snack' && '🍎 Collation'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* User Preferences */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Niveau de difficulté</label>
                                    <select
                                        value={userPreferences.difficultyLevel}
                                        onChange={(e) => setUserPreferences({
                                            ...userPreferences,
                                            difficultyLevel: e.target.value as 'easy' | 'medium' | 'hard'
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="easy">Facile</option>
                                        <option value="medium">Moyen</option>
                                        <option value="hard">Difficile</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Temps de cuisson max (min)</label>
                                    <input
                                        type="number"
                                        value={userPreferences.maxCookTime}
                                        onChange={(e) => setUserPreferences({
                                            ...userPreferences,
                                            maxCookTime: parseInt(e.target.value)
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        min="5"
                                        max="180"
                                    />
                                </div>
                            </div>

                            {/* Generate Recipe Button */}
                            <div className="text-center">
                                <button
                                    onClick={generateRecipe}
                                    disabled={!canGenerateRecipe || isGenerating}
                                    className={`px-8 py-4 rounded-lg font-semibold text-lg ${
                                        canGenerateRecipe && !isGenerating
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {isGenerating ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                            Génération en cours...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <ChefHat className="w-5 h-5" />
                                            Générer une recette parfaite !
                                        </div>
                                    )}
                                </button>
                                
                                {!canGenerateRecipe && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        {availableIngredients.length === 0 
                                            ? 'Scannez d\'abord vos ingrédients'
                                            : 'Vos objectifs nutritionnels sont déjà atteints !'
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Recipes Tab */}
                    {activeTab === 'recipes' && (
                        <div>
                            {generatedRecipe ? (
                                <div className="space-y-6">
                                    {/* Recipe Header */}
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                            {generatedRecipe.recipeName}
                                        </h2>
                                        <p className="text-gray-600">{generatedRecipe.description}</p>
                                        
                                        <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {generatedRecipe.cookingInfo.prepTime + generatedRecipe.cookingInfo.cookTime} min
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {generatedRecipe.cookingInfo.servings} portion(s)
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4" />
                                                {generatedRecipe.cookingInfo.difficulty}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nutrition Info */}
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-green-800 mb-3">Informations nutritionnelles</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-700">
                                                    {generatedRecipe.nutritionalInfo.calories}
                                                </div>
                                                <div className="text-sm text-green-600">Calories</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-700">
                                                    {generatedRecipe.nutritionalInfo.protein}g
                                                </div>
                                                <div className="text-sm text-green-600">Protéines</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-700">
                                                    {generatedRecipe.nutritionalInfo.carbs}g
                                                </div>
                                                <div className="text-sm text-green-600">Glucides</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-700">
                                                    {generatedRecipe.nutritionalInfo.fats}g
                                                </div>
                                                <div className="text-sm text-green-600">Lipides</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ingredients */}
                                    <div>
                                        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                            <Utensils className="w-5 h-5" />
                                            Ingrédients
                                        </h3>
                                        <ul className="space-y-2">
                                            {generatedRecipe.ingredients.map((ingredient, index) => (
                                                <li key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                                    <span className="font-medium">{ingredient.quantity} {ingredient.unit}</span>
                                                    <span>{ingredient.name}</span>
                                                    {ingredient.notes && (
                                                        <span className="text-sm text-gray-500 italic">({ingredient.notes})</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Instructions */}
                                    <div>
                                        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                            <BookOpen className="w-5 h-5" />
                                            Instructions
                                        </h3>
                                        <ol className="space-y-3">
                                            {generatedRecipe.instructions.map((step, index) => (
                                                <li key={index} className="flex gap-3">
                                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                        {index + 1}
                                                    </span>
                                                    <span className="pt-0.5">{step}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>

                                    {/* Tips */}
                                    {generatedRecipe.tips.length > 0 && (
                                        <div className="bg-yellow-50 rounded-lg p-4">
                                            <h3 className="font-semibold text-yellow-800 mb-2">💡 Conseils du chef</h3>
                                            <ul className="space-y-1">
                                                {generatedRecipe.tips.map((tip, index) => (
                                                    <li key={index} className="text-yellow-700 text-sm">• {tip}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4">
                                        <button 
                                            onClick={handleSaveRecipe}
                                            disabled={isSaving}
                                            className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                    Sauvegarde...
                                                </div>
                                            ) : (
                                                '💾 Sauvegarder la recette'
                                            )}
                                        </button>
                                        <button 
                                            onClick={handleMarkAsPrepared}
                                            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                        >
                                            🍽️ Marquer comme préparé
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-500 mb-2">Aucune recette générée</h3>
                                    <p className="text-gray-400">Utilisez l'assistant pour générer votre première recette !</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}