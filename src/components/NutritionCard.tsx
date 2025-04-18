"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUpCircle, ChevronDown, Info } from "lucide-react";
import { SaveMealForm } from "./SaveMealForm";
import { useMeals, MealType } from "@/context/MealsContext";
import { MealSavedToast } from "./MealSavedToast";

export function NutritionCard({ analysis }: { analysis: any }) {
    const [expanded, setExpanded] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [savedMealType, setSavedMealType] = useState<MealType>("breakfast");
    const { addMeal } = useMeals();

    const dailyValues = {
        calories: 2000,
        protein: 50,
        carbs: 300,
        fats: 70
    };

    // Format percentage with proper rounding
    const formatPercent = (value: number, total: number) => {
        const percent = (value / total) * 100;
        return Math.min(Math.round(percent), 100);
    };

    const handleSaveMeal = (mealData: any) => {
        // Create meal entry from analysis data
        addMeal({
            date: mealData.date,
            mealType: mealData.mealType,
            foodName: analysis.food_name,
            calories: analysis.calories,
            protein: analysis.protein,
            carbs: analysis.carbs,
            fats: analysis.fats,
            image: analysis.image
        });

        // Show confirmation toast
        setSavedMealType(mealData.mealType);
        setShowToast(true);
    };

    return (
        <div className="opacity-100 transition-opacity duration-300">
            <Card className="overflow-hidden">
                <div className="relative">
                    {analysis.image && (
                        <div className="w-full h-48 relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                            <img
                                src={analysis.image}
                                alt={analysis.food_name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-6 space-y-6">
                        <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-bold">{analysis.food_name}</h2>
                            {analysis.estimated_weight_grams && (
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {analysis.estimated_weight_grams}g
                </span>
                            )}
                        </div>

                        <div className="space-y-5">
                            <NutritionMeter
                                label="Calories"
                                value={analysis.calories}
                                total={dailyValues.calories}
                                unit="kcal"
                                color="bg-chart-1"
                            />

                            <div className="grid grid-cols-3 gap-4 pt-2">
                                <NutritionItem
                                    label="Protéines"
                                    value={analysis.protein}
                                    unit="g"
                                    percent={formatPercent(analysis.protein, dailyValues.protein)}
                                    color="bg-chart-2"
                                />
                                <NutritionItem
                                    label="Glucides"
                                    value={analysis.carbs}
                                    unit="g"
                                    percent={formatPercent(analysis.carbs, dailyValues.carbs)}
                                    color="bg-chart-3"
                                />
                                <NutritionItem
                                    label="Lipides"
                                    value={analysis.fats}
                                    unit="g"
                                    percent={formatPercent(analysis.fats, dailyValues.fats)}
                                    color="bg-chart-4"
                                />
                            </div>
                        </div>

                        {analysis.vitamins?.length > 0 && (
                            <div className="pt-4">
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <span className="font-semibold">Vitamines et minéraux</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                                </button>

                                {expanded && (
                                    <div
                                        className="flex flex-wrap gap-2 mt-3 animate-in fade-in"
                                    >
                                        {analysis.vitamins.map((v: string, i: number) => (
                                            <span key={i} className="bg-secondary px-2 py-1 rounded-md text-sm">
                        {v}
                      </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-between items-center text-xs text-muted-foreground pt-4">
                            <div className="flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                <span>Valeurs approximatives basées sur analyse IA</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <ArrowUpCircle className="h-3 w-3" />
                                <span>Données sauvegardées</span>
                            </div>
                        </div>

                        <SaveMealForm analysis={analysis} onSave={handleSaveMeal} />
                    </div>
                </div>
            </Card>

            <MealSavedToast
                show={showToast}
                mealType={savedMealType}
                foodName={analysis.food_name}
                onClose={() => setShowToast(false)}
            />
        </div>
    );
}

function NutritionMeter({
                            label,
                            value,
                            total,
                            unit,
                            color
                        }: {
    label: string;
    value: number;
    total: number;
    unit: string;
    color: string;
}) {
    const percent = Math.min(Math.round((value / total) * 100), 100);

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span>{label}</span>
                <span className="font-medium">{value} {unit} <span className="text-muted-foreground text-xs">/ {total} {unit}</span></span>
            </div>
            <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                    className={`absolute left-0 top-0 h-full ${color} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

function NutritionItem({
                           label,
                           value,
                           unit,
                           percent,
                           color
                       }: {
    label: string;
    value: number;
    unit: string;
    percent: number;
    color: string;
}) {
    return (
        <div className="relative overflow-hidden p-4 bg-muted rounded-lg">
            <div
                className={`absolute bottom-0 left-0 w-full ${color} opacity-20 transition-all duration-500 ease-out`}
                style={{ height: `${percent}%` }}
            />
            <div className="relative z-10">
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className="text-xl font-bold">
                    {value}<span className="text-sm ml-1">{unit}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{percent}% AJR</div>
            </div>
        </div>
    );
}