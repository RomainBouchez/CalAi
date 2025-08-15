'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChefHat, Camera, Plus, ArrowRight, ArrowLeft, Check, X, Search, Target, Utensils, Clock, Users, Bot, Settings, Zap } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './switch-1';

import { motion, AnimatePresence } from 'framer-motion';
import { Ingredient, IngredientApiResponse, RecipeApiResponse, GeneratedRecipe } from '@/types/food';
import { saveGeneratedRecipe, createMealPlan } from '@/actions/recipe.action';

interface ImprovedCulinaryAssistantProps {
    userId: string;
}

type Step = 'nutrition' | 'ingredients' | 'permanent' | 'recipes' | 'final';
type MacroMode = 'auto' | 'manual';

interface MacroControls {
    protein: boolean;
    carbs: boolean;
    fats: boolean;
}

interface NutritionTargets {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

interface QuickFoodItem {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    portion: string;
    category: string;
}

const commonIngredients: QuickFoodItem[] = [
    // Protéines
    { name: "Poulet", calories: 165, protein: 31, carbs: 0, fats: 4, portion: "100g", category: "protein" },
    { name: "Bœuf", calories: 250, protein: 26, carbs: 0, fats: 15, portion: "100g", category: "protein" },
    { name: "Saumon", calories: 206, protein: 22, carbs: 0, fats: 12, portion: "100g", category: "protein" },
    { name: "Œufs", calories: 155, protein: 13, carbs: 1, fats: 11, portion: "100g", category: "protein" },
    { name: "Tofu", calories: 76, protein: 8, carbs: 2, fats: 5, portion: "100g", category: "protein" },
    
    // Légumes
    { name: "Brocolis", calories: 34, protein: 3, carbs: 7, fats: 0, portion: "100g", category: "vegetables" },
    { name: "Courgettes", calories: 17, protein: 1, carbs: 3, fats: 0, portion: "100g", category: "vegetables" },
    { name: "Tomates", calories: 18, protein: 1, carbs: 4, fats: 0, portion: "100g", category: "vegetables" },
    { name: "Épinards", calories: 23, protein: 3, carbs: 4, fats: 0, portion: "100g", category: "vegetables" },
    { name: "Poivrons", calories: 31, protein: 1, carbs: 7, fats: 0, portion: "100g", category: "vegetables" },
    
    // Féculents
    { name: "Riz", calories: 130, protein: 3, carbs: 28, fats: 0, portion: "100g", category: "carbs" },
    { name: "Pâtes", calories: 131, protein: 5, carbs: 25, fats: 1, portion: "100g", category: "carbs" },
    { name: "Pommes de terre", calories: 77, protein: 2, carbs: 17, fats: 0, portion: "100g", category: "carbs" },
    { name: "Quinoa", calories: 120, protein: 4, carbs: 22, fats: 2, portion: "100g", category: "carbs" },
    
    // Condiments & Basiques
    { name: "Huile d'olive", calories: 884, protein: 0, carbs: 0, fats: 100, portion: "100ml", category: "fats" },
    { name: "Beurre", calories: 717, protein: 1, carbs: 1, fats: 81, portion: "100g", category: "fats" },
    { name: "Ail", calories: 149, protein: 6, carbs: 33, fats: 1, portion: "100g", category: "spices" },
    { name: "Oignon", calories: 40, protein: 1, carbs: 9, fats: 0, portion: "100g", category: "spices" },
];

export default function ImprovedCulinaryAssistant({ userId }: ImprovedCulinaryAssistantProps) {
    const [currentStep, setCurrentStep] = useState<Step>('nutrition');
    const [nutritionTargets, setNutritionTargets] = useState<NutritionTargets>({
        calories: 500,
        protein: 30,
        carbs: 50,
        fats: 20
    });
    const [macroMode, setMacroMode] = useState<MacroMode>('auto'); // Mode de gestion des macros
    const [macroControls, setMacroControls] = useState<MacroControls>({
        protein: false,
        carbs: false,
        fats: false
    }); // Contrôles individuels des macros
    const [recipeType, setRecipeType] = useState(''); // Type de plat souhaité (ex: "pancakes au miel")
    
    const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
    const [permanentIngredients, setPermanentIngredients] = useState<Ingredient[]>([]);
    const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResults, setScanResults] = useState<Ingredient[]>([]);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<QuickFoodItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    const [generatedRecipes, setGeneratedRecipes] = useState<GeneratedRecipe[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<GeneratedRecipe | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const multiFileInputRef = useRef<HTMLInputElement>(null);

    // Calculer automatiquement les calories en mode manuel
    const calculateCaloriesFromMacros = (protein: number, carbs: number, fats: number): number => {
        return Math.round((protein * 4) + (carbs * 4) + (fats * 9));
    };

    // Auto-calcul des calories quand les 3 macros sont activés
    useEffect(() => {
        if (macroMode === 'manual' && macroControls.protein && macroControls.carbs && macroControls.fats) {
            const calculatedCalories = calculateCaloriesFromMacros(
                nutritionTargets.protein, 
                nutritionTargets.carbs, 
                nutritionTargets.fats
            );
            setNutritionTargets(prev => ({
                ...prev,
                calories: calculatedCalories
            }));
        }
    }, [nutritionTargets.protein, nutritionTargets.carbs, nutritionTargets.fats, macroMode, macroControls]);

    // Fonction pour toggle un contrôle macro
    const toggleMacroControl = (macro: keyof MacroControls) => {
        setMacroControls(prev => ({
            ...prev,
            [macro]: !prev[macro]
        }));
    };

    // Vérifier qu'au moins un macro est activé en mode manuel
    const hasActiveMacro = macroMode === 'auto' || Object.values(macroControls).some(control => control);

    // Search for ingredients
    const searchIngredients = async (query: string) => {
        if (!query.trim() || query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch('/api/search-food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query.trim() }),
            });

            const result = await response.json();
            if (result.success && result.data) {
                setSearchResults(result.data);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) {
                searchIngredients(searchTerm);
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Handle photo upload
    const handlePhotoUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        setSelectedPhotos(fileArray);
        setIsScanning(true);

        try {
            const allIngredients: Ingredient[] = [];

            for (const file of fileArray) {
                const compressedImage = await compressImage(file);
                
                const response = await fetch('/api/recognize-ingredients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: compressedImage }),
                });

                if (response.ok) {
                    const data: IngredientApiResponse = await response.json();
                    allIngredients.push(...data.data.ingredientAnalysis.identifiedIngredients);
                }
            }

            setScanResults(allIngredients);
        } catch (error) {
            console.error('Error scanning images:', error);
        } finally {
            setIsScanning(false);
        }
    };

    // Compress image
    const compressImage = (file: File, maxWidth: number = 1024, quality: number = 0.7): Promise<string> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                let { width, height } = img;
                
                if (width > height && width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                } else if (height > maxWidth) {
                    width = (width * maxWidth) / height;
                    height = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            
            img.src = URL.createObjectURL(file);
        });
    };

    // Generate multiple recipes
    const generateRecipes = async () => {
        setIsGenerating(true);
        try {
            const allIngredients = [...availableIngredients, ...permanentIngredients];
            
            // Préparer les besoins nutritionnels selon les contrôles activés
            const nutritionalNeeds = macroMode === 'auto' 
                ? { calories: nutritionTargets.calories }
                : {
                    calories: nutritionTargets.calories,
                    ...(macroControls.protein && { protein: nutritionTargets.protein }),
                    ...(macroControls.carbs && { carbs: nutritionTargets.carbs }),
                    ...(macroControls.fats && { fats: nutritionTargets.fats })
                };

            const response = await fetch('/api/generate-multiple-recipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    availableIngredients: allIngredients,
                    nutritionalNeeds,
                    autoMacros: macroMode === 'auto',
                    macroControls: macroMode === 'manual' ? macroControls : undefined,
                    recipeType: recipeType.trim() || undefined,
                    userPreferences: {
                        difficultyLevel: 'medium'
                    },
                    mealType: 'dinner'
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.recipes) {
                    setGeneratedRecipes(data.data.recipes);
                    setCurrentStep('recipes');
                } else {
                    alert('Erreur lors de la génération des recettes.');
                }
            } else {
                alert('Erreur de connexion lors de la génération des recettes.');
            }
        } catch (error) {
            console.error('Error generating recipes:', error);
            alert('Erreur lors de la génération des recettes.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Add ingredient from search
    const addIngredientFromSearch = (food: QuickFoodItem, isPermanent: boolean = false) => {
        const ingredient: Ingredient = {
            name: food.name,
            category: food.category as any,
            quantity: "100g",
            unit: "g",
            confidence: "high",
            isStaple: isPermanent
        };

        if (isPermanent) {
            setPermanentIngredients(prev => [...prev, ingredient]);
        } else {
            setAvailableIngredients(prev => [...prev, ingredient]);
        }
        
        setSearchTerm("");
        setSearchResults([]);
    };

    // Save recipe and mark as prepared
    const handleSaveAndPrepare = async (recipe: GeneratedRecipe) => {
        setIsSaving(true);
        try {
            const result = await saveGeneratedRecipe(userId, recipe);
            if (result.success && result.recipeId) {
                await createMealPlan(userId, result.recipeId, new Date(), 'dinner');
                alert('Recette sauvegardée et ajoutée à votre journal !');
                setCurrentStep('final');
            }
        } catch (error) {
            console.error('Error saving recipe:', error);
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setIsSaving(false);
        }
    };

    const stepTitles = {
        nutrition: 'Objectifs Nutritionnels',
        ingredients: 'Ingrédients Disponibles',
        permanent: 'Ingrédients Permanents',
        recipes: 'Choisir une Recette',
        final: 'Recette Sélectionnée'
    };

    const filteredIngredients = searchTerm 
        ? searchResults 
        : commonIngredients.slice(0, 12);

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header with progress */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
                <div className="flex items-center gap-3 mb-3">
                    <ChefHat className="w-6 h-6" />
                    <h1 className="text-lg font-bold">Assistant Culinaire</h1>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                        className="bg-white h-2 rounded-full transition-all duration-300"
                        style={{ 
                            width: `${
                                currentStep === 'nutrition' ? 20 :
                                currentStep === 'ingredients' ? 40 :
                                currentStep === 'permanent' ? 60 :
                                currentStep === 'recipes' ? 80 :
                                100
                            }%` 
                        }}
                    />
                </div>
                <p className="text-white/90 text-sm mt-2">{stepTitles[currentStep]}</p>
            </div>

            <div className="p-4 min-h-[500px]">
                <AnimatePresence mode="wait">
                    {/* Step 1: Nutrition Targets */}
                    {currentStep === 'nutrition' && (
                        <motion.div
                            key="nutrition"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-4"
                        >
                            <div className="text-center mb-6">
                                <Target className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                                <h2 className="text-xl font-bold">Définir vos objectifs</h2>
                                <p className="text-gray-600 text-sm">
                                    Quel type de plat voulez-vous et pour combien de calories ?
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Type de recette souhaité */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Type de plat souhaité (optionnel)</label>
                                    <Input
                                        placeholder="Ex: pancakes au miel, salade de quinoa, pasta carbonara..."
                                        value={recipeType}
                                        onChange={(e) => setRecipeType(e.target.value)}
                                        className="text-center"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        L'IA adaptera la recette à vos ingrédients disponibles
                                    </p>
                                </div>

                                {/* Calories */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        {macroMode === 'manual' && macroControls.protein && macroControls.carbs && macroControls.fats 
                                            ? 'Calories (auto-calculées)' 
                                            : 'Calories cibles'
                                        }
                                    </label>
                                    <Input
                                        type="number"
                                        value={nutritionTargets.calories}
                                        onChange={(e) => setNutritionTargets(prev => ({
                                            ...prev, 
                                            calories: Number(e.target.value)
                                        }))}
                                        className={`text-center text-lg font-semibold ${
                                            macroMode === 'manual' && macroControls.protein && macroControls.carbs && macroControls.fats
                                                ? 'bg-gray-100 text-gray-600'
                                                : ''
                                        }`}
                                        disabled={macroMode === 'manual' && macroControls.protein && macroControls.carbs && macroControls.fats}
                                    />
                                </div>

                                {/* Modes pour les macros */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-medium">Macronutriments</h3>
                                        <div className="flex gap-1">
                                            <Button
                                                variant={macroMode === 'auto' ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setMacroMode('auto')}
                                                className="h-8 text-xs flex items-center gap-1"
                                            >
                                                <Bot className="w-3 h-3" />
                                                IA Auto
                                            </Button>
                                            <Button
                                                variant={macroMode === 'manual' ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setMacroMode('manual')}
                                                className="h-8 text-xs flex items-center gap-1"
                                            >
                                                <Settings className="w-3 h-3" />
                                                Manuel
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {macroMode === 'auto' && (
                                        <div className="text-center py-4">
                                            <Bot className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600">
                                                L'IA calculera automatiquement les macros optimaux 
                                                pour votre type de plat et vos calories cibles
                                            </p>
                                        </div>
                                    )}

                                    {macroMode === 'manual' && (
                                        <div className="space-y-4">
                                            <div className="text-center py-2">
                                                <Settings className="w-6 h-6 text-green-500 mx-auto mb-1" />
                                                <p className="text-xs text-gray-600">
                                                    Activez les macros à contrôler - Les autres seront gérés par l'IA
                                                </p>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {/* Protéines */}
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                                            Protéines (g)
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            value={macroControls.protein ? nutritionTargets.protein : ''}
                                                            placeholder="Auto"
                                                            onChange={(e) => setNutritionTargets(prev => ({
                                                                ...prev, 
                                                                protein: Number(e.target.value)
                                                            }))}
                                                            disabled={!macroControls.protein}
                                                            className={`text-center ${
                                                                !macroControls.protein ? 'bg-gray-100 text-gray-500' : ''
                                                            }`}
                                                        />
                                                    </div>
                                                    <Switch
                                                        isSelected={macroControls.protein}
                                                        onChange={() => toggleMacroControl('protein')}
                                                        className="mt-5"
                                                    >
                                                        <span className="text-xs font-medium text-gray-600">
                                                            {macroControls.protein ? 'ON' : 'OFF'}
                                                        </span>
                                                    </Switch>
                                                </div>

                                                {/* Glucides */}
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                                            Glucides (g)
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            value={macroControls.carbs ? nutritionTargets.carbs : ''}
                                                            placeholder="Auto"
                                                            onChange={(e) => setNutritionTargets(prev => ({
                                                                ...prev, 
                                                                carbs: Number(e.target.value)
                                                            }))}
                                                            disabled={!macroControls.carbs}
                                                            className={`text-center ${
                                                                !macroControls.carbs ? 'bg-gray-100 text-gray-500' : ''
                                                            }`}
                                                        />
                                                    </div>
                                                    <Switch
                                                        isSelected={macroControls.carbs}
                                                        onChange={() => toggleMacroControl('carbs')}
                                                        className="mt-5"
                                                    >
                                                        <span className="text-xs font-medium text-gray-600">
                                                            {macroControls.carbs ? 'ON' : 'OFF'}
                                                        </span>
                                                    </Switch>
                                                </div>

                                                {/* Lipides */}
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                                            Lipides (g)
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            value={macroControls.fats ? nutritionTargets.fats : ''}
                                                            placeholder="Auto"
                                                            onChange={(e) => setNutritionTargets(prev => ({
                                                                ...prev, 
                                                                fats: Number(e.target.value)
                                                            }))}
                                                            disabled={!macroControls.fats}
                                                            className={`text-center ${
                                                                !macroControls.fats ? 'bg-gray-100 text-gray-500' : ''
                                                            }`}
                                                        />
                                                    </div>
                                                    <Switch
                                                        isSelected={macroControls.fats}
                                                        onChange={() => toggleMacroControl('fats')}
                                                        className="mt-5"
                                                    >
                                                        <span className="text-xs font-medium text-gray-600">
                                                            {macroControls.fats ? 'ON' : 'OFF'}
                                                        </span>
                                                    </Switch>
                                                </div>
                                            </div>

                                            {/* Warning si aucun macro activé */}
                                            {!hasActiveMacro && (
                                                <div className="text-center text-xs text-amber-600 bg-amber-50 p-2 rounded">
                                                    ⚠️ Activez au moins un macronutriment pour le mode manuel
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Quick presets */}
                                <div className="mt-6">
                                    <p className="text-sm text-gray-600 mb-3">Presets calories rapides:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (macroMode === 'auto') {
                                                    setNutritionTargets(prev => ({ ...prev, calories: 400 }));
                                                } else {
                                                    // Mode manuel: définir les macros et les calories seront auto-calculées
                                                    setNutritionTargets(prev => ({
                                                        ...prev, protein: 25, carbs: 30, fats: 20
                                                    }));
                                                }
                                            }}
                                            className="text-xs"
                                        >
                                            Léger (400 kcal)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (macroMode === 'auto') {
                                                    setNutritionTargets(prev => ({ ...prev, calories: 600 }));
                                                } else {
                                                    // Mode manuel: définir les macros et les calories seront auto-calculées
                                                    setNutritionTargets(prev => ({
                                                        ...prev, protein: 40, carbs: 50, fats: 25
                                                    }));
                                                }
                                            }}
                                            className="text-xs"
                                        >
                                            Standard (600 kcal)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (macroMode === 'auto') {
                                                    setNutritionTargets(prev => ({ ...prev, calories: 800 }));
                                                } else {
                                                    // Mode manuel: définir les macros et les calories seront auto-calculées
                                                    setNutritionTargets(prev => ({
                                                        ...prev, protein: 50, carbs: 70, fats: 35
                                                    }));
                                                }
                                            }}
                                            className="text-xs"
                                        >
                                            Consistant (800 kcal)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (macroMode === 'auto') {
                                                    setNutritionTargets(prev => ({ ...prev, calories: 350 }));
                                                } else {
                                                    // Mode manuel: définir les macros et les calories seront auto-calculées
                                                    setNutritionTargets(prev => ({
                                                        ...prev, protein: 35, carbs: 10, fats: 20
                                                    }));
                                                }
                                            }}
                                            className="text-xs"
                                        >
                                            Protéiné (350 kcal)
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <Button 
                                onClick={() => setCurrentStep('ingredients')}
                                className="w-full mt-6"
                            >
                                Continuer
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </motion.div>
                    )}

                    {/* Step 2: Available Ingredients */}
                    {currentStep === 'ingredients' && (
                        <motion.div
                            key="ingredients"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentStep('nutrition')}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Retour
                                </Button>
                                <Button
                                    onClick={() => setCurrentStep('permanent')}
                                    disabled={availableIngredients.length === 0 && scanResults.length === 0}
                                >
                                    Continuer
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>

                            <div className="text-center mb-4">
                                <h2 className="text-xl font-bold">Vos ingrédients</h2>
                                <p className="text-gray-600 text-sm">
                                    Photos de votre frigo ou recherche manuelle
                                </p>
                            </div>

                            {/* Photo upload buttons */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <Button
                                    variant="outline"
                                    onClick={() => multiFileInputRef.current?.click()}
                                    disabled={isScanning}
                                    className="h-12"
                                >
                                    <Camera className="w-4 h-4 mr-2" />
                                    {isScanning ? 'Analyse...' : 'Photos'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setAvailableIngredients(prev => [...prev, ...scanResults]);
                                        setScanResults([]);
                                    }}
                                    disabled={scanResults.length === 0}
                                    className="h-12"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Valider scan
                                </Button>
                            </div>

                            <input
                                ref={multiFileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handlePhotoUpload(e.target.files)}
                                className="hidden"
                            />

                            {/* Scan results */}
                            {scanResults.length > 0 && (
                                <div className="bg-green-50 p-3 rounded-lg mb-4">
                                    <h4 className="font-medium text-green-800 mb-2">
                                        Ingrédients détectés ({scanResults.length})
                                    </h4>
                                    <div className="space-y-1 max-h-24 overflow-y-auto">
                                        {scanResults.map((ingredient, index) => (
                                            <div key={index} className="text-sm text-green-700 flex justify-between">
                                                <span>{ingredient.name}</span>
                                                <span className="text-xs">{ingredient.confidence}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Search */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Rechercher un ingrédient..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Ingredient list */}
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {filteredIngredients.map((food, index) => (
                                    <Card
                                        key={index}
                                        className="p-3 cursor-pointer hover:bg-gray-50 border-gray-200"
                                        onClick={() => addIngredientFromSearch(food, false)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-sm">{food.name}</p>
                                                <p className="text-xs text-gray-500">{food.category}</p>
                                            </div>
                                            <Plus className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {/* Selected ingredients */}
                            {availableIngredients.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-medium mb-2">Sélectionnés ({availableIngredients.length})</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {availableIngredients.map((ingredient, index) => (
                                            <span
                                                key={index}
                                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                                            >
                                                {ingredient.name}
                                                <X
                                                    className="w-3 h-3 cursor-pointer"
                                                    onClick={() => {
                                                        setAvailableIngredients(prev => 
                                                            prev.filter((_, i) => i !== index)
                                                        );
                                                    }}
                                                />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 3: Permanent Ingredients */}
                    {currentStep === 'permanent' && (
                        <motion.div
                            key="permanent"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentStep('ingredients')}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Retour
                                </Button>
                                <Button
                                    onClick={generateRecipes}
                                    disabled={isGenerating || (availableIngredients.length === 0 && permanentIngredients.length === 0)}
                                >
                                    {isGenerating ? 'Génération...' : 'Générer recettes'}
                                </Button>
                            </div>

                            <div className="text-center mb-4">
                                <h2 className="text-xl font-bold">Ingrédients de base</h2>
                                <p className="text-gray-600 text-sm">
                                    Huile, épices, condiments toujours disponibles
                                </p>
                            </div>

                            {/* Search for permanent ingredients */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Rechercher un ingrédient de base..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Common permanent ingredients */}
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {filteredIngredients
                                    .filter(food => ['fats', 'spices'].includes(food.category))
                                    .map((food, index) => (
                                    <Card
                                        key={index}
                                        className="p-3 cursor-pointer hover:bg-gray-50 border-gray-200"
                                        onClick={() => addIngredientFromSearch(food, true)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-sm">{food.name}</p>
                                                <p className="text-xs text-gray-500">Permanent</p>
                                            </div>
                                            <Plus className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {/* Selected permanent ingredients */}
                            {permanentIngredients.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-medium mb-2">Permanents ({permanentIngredients.length})</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {permanentIngredients.map((ingredient, index) => (
                                            <span
                                                key={index}
                                                className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                                            >
                                                {ingredient.name}
                                                <X
                                                    className="w-3 h-3 cursor-pointer"
                                                    onClick={() => {
                                                        setPermanentIngredients(prev => 
                                                            prev.filter((_, i) => i !== index)
                                                        );
                                                    }}
                                                />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isGenerating && (
                                <div className="text-center py-8">
                                    <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                    <p className="text-gray-600">Génération de 3 recettes personnalisées...</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 4: Recipe Selection */}
                    {currentStep === 'recipes' && (
                        <motion.div
                            key="recipes"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentStep('permanent')}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Retour
                                </Button>
                            </div>

                            <div className="text-center mb-4">
                                <h2 className="text-xl font-bold">Choisir une recette</h2>
                                {recipeType ? (
                                    <div className="bg-blue-50 p-2 rounded-lg mt-2 mb-1">
                                        <p className="text-blue-800 text-sm font-medium">
                                            🎯 Type demandé: {recipeType}
                                        </p>
                                    </div>
                                ) : null}
                                <p className="text-gray-600 text-sm">
                                    {generatedRecipes.length} variations pour {nutritionTargets.calories} kcal
                                    {macroMode === 'auto' ? ' (macros auto)' : ' (macros contrôlés)'}
                                </p>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {generatedRecipes.map((recipe, index) => (
                                    <Card
                                        key={index}
                                        className="p-4 cursor-pointer hover:bg-blue-50 border-2 transition-colors"
                                        onClick={() => {
                                            setSelectedRecipe(recipe);
                                            setCurrentStep('final');
                                        }}
                                    >
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-lg">{recipe.recipeName}</h3>
                                            <p className="text-gray-600 text-sm">{recipe.description}</p>
                                            
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {recipe.cookingInfo.prepTime + recipe.cookingInfo.cookTime}min
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {recipe.cookingInfo.servings} pers.
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Utensils className="w-3 h-3" />
                                                    {recipe.cookingInfo.difficulty}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
                                                <div className="bg-gray-100 p-2 rounded text-center">
                                                    <div className="font-bold">{recipe.nutritionalInfo.calories}</div>
                                                    <div className="text-gray-500">kcal</div>
                                                </div>
                                                <div className="bg-gray-100 p-2 rounded text-center">
                                                    <div className="font-bold">{recipe.nutritionalInfo.protein}g</div>
                                                    <div className="text-gray-500">Prot.</div>
                                                </div>
                                                <div className="bg-gray-100 p-2 rounded text-center">
                                                    <div className="font-bold">{recipe.nutritionalInfo.carbs}g</div>
                                                    <div className="text-gray-500">Gluc.</div>
                                                </div>
                                                <div className="bg-gray-100 p-2 rounded text-center">
                                                    <div className="font-bold">{recipe.nutritionalInfo.fats}g</div>
                                                    <div className="text-gray-500">Lip.</div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 5: Final Recipe */}
                    {currentStep === 'final' && selectedRecipe && (
                        <motion.div
                            key="final"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentStep('recipes')}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Autres recettes
                                </Button>
                            </div>

                            <div className="text-center mb-4">
                                <h2 className="text-xl font-bold">{selectedRecipe.recipeName}</h2>
                                <p className="text-gray-600 text-sm">{selectedRecipe.description}</p>
                            </div>

                            <div className="space-y-4 max-h-72 overflow-y-auto">
                                {/* Ingredients with quantities */}
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <Utensils className="w-4 h-4" />
                                        Ingrédients
                                    </h3>
                                    <ul className="space-y-1">
                                        {selectedRecipe.ingredients.map((ingredient, index) => (
                                            <li key={index} className="text-sm bg-gray-50 p-2 rounded flex justify-between">
                                                <span className="font-medium">{ingredient.name}</span>
                                                <span className="text-gray-600">{ingredient.quantity} {ingredient.unit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Instructions */}
                                <div>
                                    <h3 className="font-semibold mb-2">Instructions</h3>
                                    <ol className="space-y-2">
                                        {selectedRecipe.instructions.map((step, index) => (
                                            <li key={index} className="text-sm flex gap-3">
                                                <span className="flex-shrink-0 w-5 h-5 bg-orange-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                                                    {index + 1}
                                                </span>
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                {/* Tips */}
                                {selectedRecipe.tips.length > 0 && (
                                    <div className="bg-yellow-50 p-3 rounded-lg">
                                        <h4 className="font-semibold text-yellow-800 mb-2">💡 Conseils</h4>
                                        <ul className="space-y-1">
                                            {selectedRecipe.tips.map((tip, index) => (
                                                <li key={index} className="text-yellow-700 text-sm">• {tip}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        // Reset for new recipe
                                        setCurrentStep('nutrition');
                                        setGeneratedRecipes([]);
                                        setSelectedRecipe(null);
                                        setAvailableIngredients([]);
                                        setScanResults([]);
                                    }}
                                    className="flex-1"
                                >
                                    Nouvelle recette
                                </Button>
                                <Button
                                    onClick={() => handleSaveAndPrepare(selectedRecipe)}
                                    disabled={isSaving}
                                    className="flex-1"
                                >
                                    {isSaving ? 'Sauvegarde...' : 'Marquer préparé'}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}