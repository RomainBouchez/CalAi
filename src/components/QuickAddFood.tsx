"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Plus, Search, Camera, X, ArrowLeft } from "lucide-react";
import { useMeals, MealType } from "@/context/MealsContext";
import { motion, AnimatePresence } from "framer-motion";
import { Modal, ModalProvider, ModalBody, ModalContent, ModalTrigger, useModal } from "./ui/animated-modal";
import { ProductScanner } from "./ProductScanner";

interface QuickAddFoodProps {
    mealType: MealType;
    onClose?: () => void;
    onScannerClick?: () => void;
    children?: React.ReactNode;
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

const commonFoods: QuickFoodItem[] = [
    // Breakfast
    { name: "Whole wheat bread", calories: 247, protein: 13, carbs: 41, fats: 4, portion: "100g", category: "breakfast" },
    { name: "Butter", calories: 717, protein: 1, carbs: 1, fats: 81, portion: "100g", category: "breakfast" },
    { name: "Jam", calories: 278, protein: 0, carbs: 68, fats: 0, portion: "100g", category: "breakfast" },
    { name: "Plain yogurt", calories: 59, protein: 10, carbs: 4, fats: 0, portion: "100g", category: "breakfast" },
    { name: "Muesli", calories: 375, protein: 10, carbs: 68, fats: 6, portion: "100g", category: "breakfast" },
    { name: "Banana", calories: 89, protein: 1, carbs: 23, fats: 0, portion: "100g", category: "breakfast" },
    { name: "Coffee", calories: 2, protein: 0, carbs: 0, fats: 0, portion: "100ml", category: "breakfast" },
    { name: "Low-fat milk", calories: 46, protein: 3, carbs: 5, fats: 2, portion: "100ml", category: "breakfast" },
    
    // Lunch
    { name: "Cooked white rice", calories: 130, protein: 3, carbs: 28, fats: 0, portion: "100g", category: "lunch" },
    { name: "Cooked pasta", calories: 131, protein: 5, carbs: 25, fats: 1, portion: "100g", category: "lunch" },
    { name: "Grilled chicken", calories: 165, protein: 31, carbs: 0, fats: 4, portion: "100g", category: "lunch" },
    { name: "Grilled salmon", calories: 206, protein: 22, carbs: 0, fats: 12, portion: "100g", category: "lunch" },
    { name: "Broccoli", calories: 34, protein: 3, carbs: 7, fats: 0, portion: "100g", category: "lunch" },
    { name: "Green salad", calories: 15, protein: 1, carbs: 3, fats: 0, portion: "100g", category: "lunch" },
    { name: "Tomato", calories: 18, protein: 1, carbs: 4, fats: 0, portion: "100g", category: "lunch" },
    { name: "Olive oil", calories: 884, protein: 0, carbs: 0, fats: 100, portion: "100ml", category: "lunch" },
    
    // Dinner
    { name: "White fish", calories: 82, protein: 18, carbs: 0, fats: 1, portion: "100g", category: "dinner" },
    { name: "Steamed vegetables", calories: 35, protein: 2, carbs: 7, fats: 0, portion: "100g", category: "dinner" },
    { name: "Potato", calories: 77, protein: 2, carbs: 17, fats: 0, portion: "100g", category: "dinner" },
    { name: "Cooked quinoa", calories: 120, protein: 4, carbs: 22, fats: 2, portion: "100g", category: "dinner" },
    { name: "Vegetable soup", calories: 44, protein: 2, carbs: 9, fats: 0, portion: "100ml", category: "dinner" },
    
    // Snacks
    { name: "Apple", calories: 52, protein: 0, carbs: 14, fats: 0, portion: "100g", category: "snack" },
    { name: "Almonds", calories: 579, protein: 21, carbs: 22, fats: 50, portion: "100g", category: "snack" },
    { name: "Greek yogurt", calories: 59, protein: 10, carbs: 4, fats: 0, portion: "100g", category: "snack" },
    { name: "Carrot", calories: 41, protein: 1, carbs: 10, fats: 0, portion: "100g", category: "snack" },
    { name: "Cottage cheese", calories: 75, protein: 8, carbs: 3, fats: 3, portion: "100g", category: "snack" }
];

const QuickAddFoodContent = ({ mealType, onClose, onScannerClick }: Omit<QuickAddFoodProps, 'children'>) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFood, setSelectedFood] = useState<QuickFoodItem | null>(null);
    const [weight, setWeight] = useState(100);
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customFood, setCustomFood] = useState({
        name: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0
    });
    const [searchResults, setSearchResults] = useState<QuickFoodItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [translationInfo, setTranslationInfo] = useState<{ original: string; translated: string } | null>(null);

    // Reset function to clear all state
    const resetState = () => {
        setSearchTerm("");
        setSelectedFood(null);
        setWeight(100);
        setShowCustomForm(false);
        setCustomFood({
            name: "",
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0
        });
        setSearchResults([]);
        setIsSearching(false);
        setSearchError(null);
        setTranslationInfo(null);
    };

    const { addMeal } = useMeals();
    const { setOpen, open } = useModal();

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            resetState();
        }
    }, [open]);

    const mealTypeLabels = {
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
        snack: "Snack"
    };

    // Search with API
    const searchFoods = async (query: string) => {
        if (!query.trim() || query.length < 2) {
            setSearchResults([]);
            setSearchError(null);
            return;
        }

        setIsSearching(true);
        setSearchError(null);

        try {
            const response = await fetch('/api/search-food', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query.trim() }),
            });

            const result = await response.json();

            if (result.success && result.data) {
                setSearchResults(result.data);
                // Capturer les informations de traduction si disponibles
                if (result.translation) {
                    setTranslationInfo(result.translation);
                } else {
                    setTranslationInfo(null);
                }
            } else {
                setSearchError("Search error occurred");
                setSearchResults([]);
                setTranslationInfo(null);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchError("Connection error");
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) {
                searchFoods(searchTerm);
            } else {
                setSearchResults([]);
                setSearchError(null);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const filteredFoods = searchTerm 
        ? searchResults 
        : commonFoods.filter(food => {
            const matchesMealType = food.category === mealType || food.category === "common";
            return matchesMealType;
        }).slice(0, 8);

    const calculateNutrients = (baseFood: QuickFoodItem, newWeight: number) => {
        const ratio = newWeight / 100;
        return {
            calories: Math.round(baseFood.calories * ratio),
            protein: Math.round(baseFood.protein * ratio * 10) / 10,
            carbs: Math.round(baseFood.carbs * ratio * 10) / 10,
            fats: Math.round(baseFood.fats * ratio * 10) / 10
        };
    };
    
    const handleSelectFood = (food: QuickFoodItem) => {
        setWeight(100); 
        setSelectedFood(food);
    }

    const handleAddFood = (food: QuickFoodItem, finalWeight: number) => {
        const nutrients = calculateNutrients(food, finalWeight);

        addMeal({
            date: new Date(),
            mealType,
            foodName: food.name,
            calories: nutrients.calories,
            protein: nutrients.protein,
            carbs: nutrients.carbs,
            fats: nutrients.fats,
            weight: finalWeight
        });

        // Reset the state and close the modal
        resetState();
        setOpen(false);
        onClose?.();
    };

    const handleAddCustomFood = () => {
        if (!customFood.name) return;

        const nutrients = calculateNutrients(customFood as QuickFoodItem, weight);
        
        addMeal({
            date: new Date(),
            mealType,
            foodName: customFood.name,
            calories: nutrients.calories,
            protein: nutrients.protein,
            carbs: nutrients.carbs,
            fats: nutrients.fats,
            weight
        });

        // Reset the state and close the modal
        resetState();
        setOpen(false);
        onClose?.();
    };

    const handleProductFound = (product: any) => {
        // Convert scanned product to QuickFoodItem format
        const scannedFood: QuickFoodItem = {
            name: product.brand ? `${product.brand} - ${product.name}` : product.name,
            calories: product.calories,
            protein: product.protein,
            carbs: product.carbs,
            fats: product.fats,
            portion: "100g",
            category: product.category
        };
        
        // Directly select the scanned product
        setSelectedFood(scannedFood);
        setWeight(100);
    };

    return (
        <ModalContent className="w-full max-w-md max-h-[90vh] max-h-[calc(100vh-2rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center p-4 border-b border-border/30 bg-background/80 backdrop-blur-sm flex-shrink-0 w-full">
                <AnimatePresence>
                    {selectedFood && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedFood(null)} className="h-8 w-8 p-0 rounded-lg mr-2">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
                <h2 className="text-lg font-semibold text-foreground text-center flex-1">
                    {selectedFood ? selectedFood.name : `Add - ${mealTypeLabels[mealType]}`}
                </h2>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 min-h-0 w-full max-w-sm mx-auto px-4">
                <AnimatePresence mode="wait">
                    {/* View 2: Adjust Quantity */}
                    {selectedFood ? (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ type: 'spring', duration: 0.4 }}
                            className="w-full py-6"
                        >
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="font-semibold">{selectedFood.name}</h3>
                                    <p className="text-sm text-muted-foreground">Adjust quantity</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Weight (g)</label>
                                    <Input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} min="1" autoFocus/>
                                </div>
                                <div className="bg-muted p-3 rounded-lg">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>Calories: {calculateNutrients(selectedFood, weight).calories}</div>
                                        <div>Protein: {calculateNutrients(selectedFood, weight).protein}g</div>
                                        <div>Carbs: {calculateNutrients(selectedFood, weight).carbs}g</div>
                                        <div>Fats: {calculateNutrients(selectedFood, weight).fats}g</div>
                                    </div>
                                </div>
                                <Button onClick={() => handleAddFood(selectedFood, weight)} className="w-full h-11">
                                    Add to journal
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        /* View 1: Search & List */
                        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full py-6">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input 
                                    placeholder="Search for a food..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className="pl-10"
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <Button variant="outline" onClick={() => setShowCustomForm(true)} className="w-full h-11">
                                    <Plus className="h-4 w-4 mr-2" /> Manual entry
                                </Button>
                                <ProductScanner onProductFound={handleProductFound}>
                                    <Button variant="outline" className="w-full h-11">
                                        <Camera className="h-4 w-4 mr-2" /> Scanner
                                    </Button>
                                </ProductScanner>
                            </div>
                            
                            {showCustomForm && (
                                <Card className="p-4 mb-4">
                                    <h3 className="font-medium mb-3">Manual entry</h3>
                                    <div className="space-y-3">
                                        <Input
                                            placeholder="Food name"
                                            value={customFood.name}
                                            onChange={(e) => setCustomFood(prev => ({ ...prev, name: e.target.value }))}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                type="number"
                                                placeholder="Calories"
                                                value={customFood.calories || ""}
                                                onChange={(e) => setCustomFood(prev => ({ ...prev, calories: Number(e.target.value) }))}
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Weight (g)"
                                                value={weight}
                                                onChange={(e) => setWeight(Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Input
                                                type="number"
                                                placeholder="Protein (g)"
                                                value={customFood.protein || ""}
                                                onChange={(e) => setCustomFood(prev => ({ ...prev, protein: Number(e.target.value) }))}
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Carbs (g)"
                                                value={customFood.carbs || ""}
                                                onChange={(e) => setCustomFood(prev => ({ ...prev, carbs: Number(e.target.value) }))}
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Fats (g)"
                                                value={customFood.fats || ""}
                                                onChange={(e) => setCustomFood(prev => ({ ...prev, fats: Number(e.target.value) }))}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={() => setShowCustomForm(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleAddCustomFood} className="flex-1">
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Translation Info */}
                            {translationInfo && (
                                <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 text-sm p-3 rounded-lg mb-4 border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs">🌐</span>
                                        <span>
                                            Recherche pour "{translationInfo.original}" 
                                            → "{translationInfo.translated}"
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Error Display */}
                            {searchError && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
                                    {searchError}
                                </div>
                            )}

                            <div className="space-y-2">
                                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                                    {searchTerm ? 
                                        (isSearching ? "Searching..." : `Results for "${searchTerm}"`) 
                                        : "Suggested foods"}
                                </h3>
                                
                                {filteredFoods.length === 0 && !isSearching && searchTerm ? (
                                    <div className="text-center py-8">
                                        <div className="text-muted-foreground mb-3">
                                            No results found for "{searchTerm}"
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setShowCustomForm(true)}
                                        >
                                            <Plus className="h-3 w-3 mr-2" />
                                            Add manually
                                        </Button>
                                    </div>
                                ) : (
                                    filteredFoods.map((food, index) => (
                                    <Card
                                        key={index}
                                        className="p-4 cursor-pointer hover:bg-muted/30 hover:border-border/60 transition-all duration-200 border-border/30 rounded-lg shadow-sm"
                                        onClick={() => handleSelectFood(food)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <p className="font-medium text-foreground">{food.name}</p>
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                    {food.calories} kcal • {food.portion}
                                                </p>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                className="h-8 w-8 p-0 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </Card>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ModalContent>
    );
};

export function QuickAddFood({ mealType, onClose, onScannerClick, children }: QuickAddFoodProps) {
    return (
        <Modal>
            {children && (
                <ModalTrigger>
                    {children}
                </ModalTrigger>
            )}
            <ModalBody className="w-full max-w-md max-h-[90vh] max-h-[calc(100vh-2rem)]">
                <QuickAddFoodContent mealType={mealType} onClose={onClose} onScannerClick={onScannerClick} />
            </ModalBody>
        </Modal>
    );
}