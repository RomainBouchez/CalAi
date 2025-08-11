"use client";

import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { useMeals, MealType, MealEntry } from "@/context/MealsContext";
import { Settings, Trash2, ChevronRight, ChevronLeft, Edit2, Save, X, Plus } from "lucide-react";
import { NutritionGoalsDialog } from "./NutritionGoalsDialog";
import { QuickAddFood } from "./QuickAddFood";
import Image from "next/image";

const mealTypeIcons: Record<MealType, string> = {
    breakfast: "☕",
    lunch: "🍲",
    dinner: "🍽️",
    snack: "🍎"
};

const mealTypeLabels: Record<MealType, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack"
};

const mealTypeColors: Record<MealType, string> = {
    breakfast: "bg-chart-1",
    lunch: "bg-chart-2",
    dinner: "bg-chart-3",
    snack: "bg-chart-4"
};

interface MealUpdateData {
    id: string;
    originalWeight: number;
    originalCalories: number;
    originalProtein: number;
    originalCarbs: number;
    originalFats: number;
}

export function DailyDashboard() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [editingMealId, setEditingMealId] = useState<string | null>(null);
    const [editWeight, setEditWeight] = useState<number>(0);

    const {
        getDailyMeals,
        getDailyTotals,
        getMealTotals,
        dailyGoals,
        mealGoals,
        removeMeal,
        updateMeal
    } = useMeals();

    const handlePrevDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + 1);
        setSelectedDate(newDate);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const startEditingMeal = (mealId: string, currentWeight: number) => {
        setEditingMealId(mealId);
        setEditWeight(currentWeight);
    };

    const cancelEditingMeal = () => {
        setEditingMealId(null);
        setEditWeight(0);
    };

    const saveEditedMeal = (meal: MealUpdateData) => {
        if (editWeight <= 0) {
            cancelEditingMeal();
            return;
        }

        // Calculate ratio for nutritional values
        const ratio = editWeight / meal.originalWeight;

        // Update meal with new values
        updateMeal(meal.id, {
            calories: Math.round(meal.originalCalories * ratio),
            protein: Math.round(meal.originalProtein * ratio * 10) / 10,
            carbs: Math.round(meal.originalCarbs * ratio * 10) / 10,
            fats: Math.round(meal.originalFats * ratio * 10) / 10,
            weight: editWeight
        });

        cancelEditingMeal();
    };

    const dailyTotals = getDailyTotals(selectedDate);
    const meals = getDailyMeals(selectedDate);

    const calculatePercentage = (value: number, target: number) => {
        return Math.min(Math.round((value / target) * 100), 100);
    };

    const getMealTypeEntries = (mealType: MealType) => {
        return meals.filter(meal => meal.mealType === mealType);
    };


    return (
        <div className="mt-8 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Food Journal</h2>
                <NutritionGoalsDialog goalType="daily">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <Settings className="h-4 w-4" />
                        Goals
                    </Button>
                </NutritionGoalsDialog>
            </div>



            <div className="flex justify-between items-center py-2">
                <Button variant="ghost" size="sm" onClick={handlePrevDay}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <h3 className="text-lg font-medium">
                    {isToday(selectedDate) ? "Today" : formatDate(selectedDate)}
                </h3>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextDay}
                    disabled={isToday(selectedDate)}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <Card className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Daily goal</h3>
                    <div className="text-sm text-muted-foreground">
                        {dailyTotals.calories} / {dailyGoals.calories} kcal
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Calories principales */}
                    <div className="space-y-2">
                        <Progress
                            value={calculatePercentage(dailyTotals.calories, dailyGoals.calories)}
                            className="h-3"
                        />
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Remaining</span>
                            <span className="font-medium text-primary">
                                {Math.max(0, dailyGoals.calories - dailyTotals.calories)} kcal
                            </span>
                        </div>
                    </div>

                    {/* Macronutriments */}
                    <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="text-center p-3 rounded-lg bg-background border">
                            <div className="text-xs text-muted-foreground mb-1">Protein</div>
                            <div className="font-semibold text-sm">{dailyTotals.protein}g</div>
                            <div className="w-full bg-secondary rounded-full h-1 mt-1">
                                <div 
                                    className="bg-chart-2 h-1 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, (dailyTotals.protein / dailyGoals.protein) * 100)}%` }}
                                />
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {Math.round((dailyTotals.protein / dailyGoals.protein) * 100)}%
                            </div>
                        </div>

                        <div className="text-center p-3 rounded-lg bg-background border">
                            <div className="text-xs text-muted-foreground mb-1">Carbs</div>
                            <div className="font-semibold text-sm">{dailyTotals.carbs}g</div>
                            <div className="w-full bg-secondary rounded-full h-1 mt-1">
                                <div 
                                    className="bg-chart-3 h-1 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, (dailyTotals.carbs / dailyGoals.carbs) * 100)}%` }}
                                />
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {Math.round((dailyTotals.carbs / dailyGoals.carbs) * 100)}%
                            </div>
                        </div>

                        <div className="text-center p-3 rounded-lg bg-background border">
                            <div className="text-xs text-muted-foreground mb-1">Fats</div>
                            <div className="font-semibold text-sm">{dailyTotals.fats}g</div>
                            <div className="w-full bg-secondary rounded-full h-1 mt-1">
                                <div 
                                    className="bg-chart-4 h-1 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, (dailyTotals.fats / dailyGoals.fats) * 100)}%` }}
                                />
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {Math.round((dailyTotals.fats / dailyGoals.fats) * 100)}%
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="space-y-6">
                {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map(mealType => {
                    const mealEntries = getMealTypeEntries(mealType);
                    const mealTotals = getMealTotals(selectedDate, mealType);
                    const mealTypeGoals = mealGoals[mealType];

                    return (
                        <Card key={mealType} className="p-5">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{mealTypeIcons[mealType]}</span>
                                    <h3 className="text-lg font-medium">
                                        {mealTypeLabels[mealType]}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <QuickAddFood
                                        mealType={mealType}
                                        onScannerClick={() => {
                                            // Switch to the "Analyze food" tab and photo mode
                                            if (typeof window !== 'undefined') {
                                                const tabButton = document.querySelector('[value="analyser"]') as HTMLElement;
                                                if (tabButton) {
                                                    tabButton.click();
                                                }
                                            }
                                        }}
                                    >
                                        <Button
                                            size="sm"
                                            className="gap-1 h-7 px-2 text-xs"
                                        >
                                            <Plus className="h-3 w-3" />
                                            Add
                                        </Button>
                                    </QuickAddFood>
                                    <NutritionGoalsDialog goalType={mealType}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                        >
                                            <Settings className="h-3 w-3" />
                                        </Button>
                                    </NutritionGoalsDialog>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="grid grid-cols-4 gap-2">
                                    <NutrientBadge
                                        label="Calories"
                                        value={mealTotals.calories}
                                        target={mealTypeGoals.calories}
                                        unit="kcal"
                                        color={mealTypeColors[mealType]}
                                    />
                                    <NutrientBadge
                                        label="Protein"
                                        value={mealTotals.protein}
                                        target={mealTypeGoals.protein}
                                        unit="g"
                                        color={mealTypeColors[mealType]}
                                    />
                                    <NutrientBadge
                                        label="Carbs"
                                        value={mealTotals.carbs}
                                        target={mealTypeGoals.carbs}
                                        unit="g"
                                        color={mealTypeColors[mealType]}
                                    />
                                    <NutrientBadge
                                        label="Fats"
                                        value={mealTotals.fats}
                                        target={mealTypeGoals.fats}
                                        unit="g"
                                        color={mealTypeColors[mealType]}
                                    />
                                </div>
                            </div>

                            {mealEntries.length > 0 ? (
                                <div className="space-y-3 mt-4">
                                    {mealEntries.map(meal => (
                                        <div
                                            key={meal.id}
                                            className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border hover:bg-muted transition-colors"
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                {meal.image && (
                                                    <div className="w-10 h-10 rounded-md overflow-hidden relative">
                                                        <Image
                                                            src={meal.image}
                                                            alt={meal.foodName}
                                                            width={40}
                                                            height={40}
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-medium">{meal.foodName}</p>
                                                    <div className="flex items-center text-xs text-muted-foreground flex-wrap">
                                                        {editingMealId === meal.id ? (
                                                            <div className="flex items-center space-x-2">
                                                                <Input
                                                                    type="number"
                                                                    value={editWeight}
                                                                    onChange={(e) => setEditWeight(Number(e.target.value))}
                                                                    className="w-16 h-7 text-xs p-1"
                                                                    min="1"
                                                                />
                                                                <span>g</span>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-7 w-7"
                                                                    onClick={() => saveEditedMeal({
                                                                        id: meal.id,
                                                                        originalWeight: meal.weight || 100,
                                                                        originalCalories: meal.calories,
                                                                        originalProtein: meal.protein,
                                                                        originalCarbs: meal.carbs,
                                                                        originalFats: meal.fats
                                                                    })}
                                                                >
                                                                    <Save className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-7 w-7"
                                                                    onClick={cancelEditingMeal}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center flex-wrap gap-1">
                                                                <span>{meal.weight || 100}g</span>
                                                                <span>•</span>
                                                                <span className="font-medium text-primary">{meal.calories} kcal</span>
                                                                <span>•</span>
                                                                <span>{meal.protein}g P</span>
                                                                <span>•</span>
                                                                <span>{meal.carbs}g G</span>
                                                                <span>•</span>
                                                                <span>{meal.fats}g L</span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-5 w-5 ml-1"
                                                                    onClick={() => startEditingMeal(meal.id, meal.weight || 100)}
                                                                >
                                                                    <Edit2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeMeal(meal.id)}
                                                className="ml-2 text-destructive hover:text-destructive"
                                                disabled={editingMealId === meal.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-muted-foreground mb-3">
                                        No food added
                                    </div>
                                    <QuickAddFood
                                        mealType={mealType}
                                        onScannerClick={() => {
                                            // Switch to the "Analyze food" tab and photo mode
                                            if (typeof window !== 'undefined') {
                                                const tabButton = document.querySelector('[value="analyser"]') as HTMLElement;
                                                if (tabButton) {
                                                    tabButton.click();
                                                }
                                            }
                                        }}
                                    >
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="gap-1 h-7 px-2 text-xs"
                                        >
                                            <Plus className="h-3 w-3" />
                                            Add food
                                        </Button>
                                    </QuickAddFood>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

interface NutrientProgressProps {
    label: string;
    value: number;
    target: number;
    unit: string;
    color: string;
}

function NutrientProgress({
                              label,
                              value,
                              target,
                              unit,
                              color
                          }: NutrientProgressProps) {
    const percentage = Math.min(Math.round((value / target) * 100), 100);

    return (
        <div className="space-y-1">
            <div className="text-xs flex justify-between">
                <span>{label}</span>
                <span>{value}/{target} {unit}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                <div
                    className={`h-full ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

interface NutrientBadgeProps {
    label: string;
    value: number;
    target: number;
    unit: string;
    color: string;
}

function NutrientBadge({
                           label,
                           value,
                           target,
                           unit,
                           color
                       }: NutrientBadgeProps) {
    const percentage = Math.min(Math.round((value / target) * 100), 100);

    return (
        <div className="text-center p-2 rounded-lg bg-background border">
            <div className="text-xs text-muted-foreground mb-1">{label}</div>
            <div className="font-medium">{value} {unit}</div>
            <div className="w-full bg-secondary rounded-full h-1 mt-1 overflow-hidden">
                <div
                    className={`h-full ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}