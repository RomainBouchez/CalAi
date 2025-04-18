"use client";

import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useMeals, MealType } from "@/context/MealsContext";
import { Settings, Trash2, ChevronRight, ChevronLeft } from "lucide-react";
import { NutritionGoalsDialog } from "./NutritionGoalsDialog";

const mealTypeIcons: Record<MealType, string> = {
    breakfast: "☕",
    lunch: "🍲",
    dinner: "🍽️",
    snack: "🍎"
};

const mealTypeLabels: Record<MealType, string> = {
    breakfast: "Petit-déjeuner",
    lunch: "Déjeuner",
    dinner: "Dîner",
    snack: "Collation"
};

const mealTypeColors: Record<MealType, string> = {
    breakfast: "bg-chart-1",
    lunch: "bg-chart-2",
    dinner: "bg-chart-3",
    snack: "bg-chart-4"
};

export function DailyDashboard() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showGoalsDialog, setShowGoalsDialog] = useState(false);
    const [goalType, setGoalType] = useState<"daily" | MealType>("daily");

    const {
        getDailyMeals,
        getDailyTotals,
        getMealTotals,
        dailyGoals,
        mealGoals,
        removeMeal
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
        return date.toLocaleDateString('fr-FR', {
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

    const dailyTotals = getDailyTotals(selectedDate);
    const meals = getDailyMeals(selectedDate);

    const calculatePercentage = (value: number, target: number) => {
        return Math.min(Math.round((value / target) * 100), 100);
    };

    const getMealTypeEntries = (mealType: MealType) => {
        return meals.filter(meal => meal.mealType === mealType);
    };

    const openGoalsDialog = (type: "daily" | MealType) => {
        setGoalType(type);
        setShowGoalsDialog(true);
    };

    return (
        <div className="mt-8 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Journal Alimentaire</h2>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => openGoalsDialog("daily")}
                >
                    <Settings className="h-4 w-4" />
                    Objectifs
                </Button>
            </div>

            <div className="flex justify-between items-center py-2">
                <Button variant="ghost" size="sm" onClick={handlePrevDay}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <h3 className="text-lg font-medium">
                    {isToday(selectedDate) ? "Aujourd'hui" : formatDate(selectedDate)}
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

            <Card className="p-5">
                <h3 className="text-lg font-medium mb-4">Total journalier</h3>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm">Calories</span>
                            <span className="text-sm font-medium">
                {dailyTotals.calories} / {dailyGoals.calories} kcal
              </span>
                        </div>
                        <Progress
                            value={calculatePercentage(dailyTotals.calories, dailyGoals.calories)}
                            className="h-2"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <NutrientProgress
                            label="Protéines"
                            value={dailyTotals.protein}
                            target={dailyGoals.protein}
                            unit="g"
                            color="bg-chart-2"
                        />
                        <NutrientProgress
                            label="Glucides"
                            value={dailyTotals.carbs}
                            target={dailyGoals.carbs}
                            unit="g"
                            color="bg-chart-3"
                        />
                        <NutrientProgress
                            label="Lipides"
                            value={dailyTotals.fats}
                            target={dailyGoals.fats}
                            unit="g"
                            color="bg-chart-4"
                        />
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
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openGoalsDialog(mealType)}
                                >
                                    <Settings className="h-4 w-4" />
                                </Button>
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
                                        label="Protéines"
                                        value={mealTotals.protein}
                                        target={mealTypeGoals.protein}
                                        unit="g"
                                        color={mealTypeColors[mealType]}
                                    />
                                    <NutrientBadge
                                        label="Glucides"
                                        value={mealTotals.carbs}
                                        target={mealTypeGoals.carbs}
                                        unit="g"
                                        color={mealTypeColors[mealType]}
                                    />
                                    <NutrientBadge
                                        label="Lipides"
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
                                            className="flex justify-between items-center p-3 rounded-lg bg-muted"
                                        >
                                            <div className="flex items-center gap-3">
                                                {meal.image && (
                                                    <div className="w-10 h-10 rounded-md overflow-hidden">
                                                        <img
                                                            src={meal.image}
                                                            alt={meal.foodName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium">{meal.foodName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {meal.calories} kcal · {meal.protein}g P · {meal.carbs}g G · {meal.fats}g L
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeMeal(meal.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    Aucun repas enregistré
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {showGoalsDialog && (
                <NutritionGoalsDialog
                    goalType={goalType}
                    onClose={() => setShowGoalsDialog(false)}
                />
            )}
        </div>
    );
}

function NutrientProgress({
                              label,
                              value,
                              target,
                              unit,
                              color
                          }: {
    label: string;
    value: number;
    target: number;
    unit: string;
    color: string;
}) {
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

function NutrientBadge({
                           label,
                           value,
                           target,
                           unit,
                           color
                       }: {
    label: string;
    value: number;
    target: number;
    unit: string;
    color: string;
}) {
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