"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpCircle, ChevronDown, Info, Edit2 } from "lucide-react";
import { SaveMealForm } from "./SaveMealForm";
import { useMeals, MealType } from "@/context/MealsContext";
import { MealSavedToast } from "./MealSavedToast";
import { FoodAnalysis } from "@/types/food";
import Image from "next/image";

interface NutritionCardProps {
    analysis: FoodAnalysis;
}

export function NutritionCard({ analysis }: NutritionCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [savedMealType, setSavedMealType] = useState<MealType>("breakfast");
    const [editing, setEditing] = useState(false);
    const [weight, setWeight] = useState(analysis.estimated_weight_grams || 100);
    const [adjustedAnalysis, setAdjustedAnalysis] = useState<FoodAnalysis>({...analysis});
    const { addMeal } = useMeals();

    const dailyValues = {
        calories: 2000,
        protein: 50,
        carbs: 300,
        fats: 70
    };

    // Update adjusted analysis when weight changes
    useEffect(() => {
        if (!analysis.estimated_weight_grams || analysis.estimated_weight_grams === 0) return;

        const ratio = weight / analysis.estimated_weight_grams;
        setAdjustedAnalysis({
            ...analysis,
            estimated_weight_grams: weight,
            calories: Math.round(analysis.calories * ratio),
            protein: Math.round(analysis.protein * ratio * 10) / 10,
            carbs: Math.round(analysis.carbs * ratio * 10) / 10,
            fats: Math.round(analysis.fats * ratio * 10) / 10,
        });
    }, [weight, analysis]);

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
            foodName: adjustedAnalysis.food_name,
            calories: adjustedAnalysis.calories,
            protein: adjustedAnalysis.protein,
            carbs: adjustedAnalysis.carbs,
            fats: adjustedAnalysis.fats,
            weight: adjustedAnalysis.estimated_weight_grams,
            image: adjustedAnalysis.image
        });

        // Show confirmation toast
        setSavedMealType(mealData.mealType);
        setShowToast(true);
    };

    const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newWeight = parseInt(e.target.value) || 0;
        setWeight(newWeight);
    };

    return (
        <div className="opacity-100 transition-opacity duration-300">
            <Card className="overflow-hidden">
                <div className="relative">
                    {analysis.image && (
                        <div className="w-full h-48 relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                            <div className="w-full h-full relative">
                                <Image
                                    src={analysis.image}
                                    alt={analysis.food_name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}

                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                            <h2 className="text-xl sm:text-2xl font-bold">{analysis.food_name}</h2>
                            {editing ? (
                                <div className="flex items-center bg-primary/10 px-3 py-1 rounded-full">
                                    <Input
                                        type="number"
                                        value={weight}
                                        onChange={handleWeightChange}
                                        className="w-16 h-7 text-sm p-1"
                                        min="1"
                                    />
                                    <span className="ml-1 text-sm font-medium">g</span>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                                        {adjustedAnalysis.estimated_weight_grams}g
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-1 h-8 w-8 p-0"
                                        onClick={() => setEditing(true)}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {editing && (
                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setWeight(analysis.estimated_weight_grams || 100);
                                        setEditing(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setEditing(false)}
                                >
                                    Apply
                                </Button>
                            </div>
                        )}

                        <div className="space-y-5">
                            <NutritionMeter
                                label="Calories"
                                value={adjustedAnalysis.calories}
                                total={dailyValues.calories}
                                unit="kcal"
                                color="bg-chart-1"
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
                                <NutritionItem
                                    label="Protéines"
                                    value={adjustedAnalysis.protein}
                                    unit="g"
                                    percent={formatPercent(adjustedAnalysis.protein, dailyValues.protein)}
                                    color="bg-chart-2"
                                />
                                <NutritionItem
                                    label="Glucides"
                                    value={adjustedAnalysis.carbs}
                                    unit="g"
                                    percent={formatPercent(adjustedAnalysis.carbs, dailyValues.carbs)}
                                    color="bg-chart-3"
                                />
                                <NutritionItem
                                    label="Lipides"
                                    value={adjustedAnalysis.fats}
                                    unit="g"
                                    percent={formatPercent(adjustedAnalysis.fats, dailyValues.fats)}
                                    color="bg-chart-4"
                                />
                            </div>
                        </div>

                        {adjustedAnalysis.vitamins && adjustedAnalysis.vitamins.length > 0 && (
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
                                        {adjustedAnalysis.vitamins.map((v: string, i: number) => (
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

                        <SaveMealForm analysis={adjustedAnalysis} onSave={handleSaveMeal} />
                    </div>
                </div>
            </Card>

            <MealSavedToast
                show={showToast}
                mealType={savedMealType}
                foodName={adjustedAnalysis.food_name}
                onClose={() => setShowToast(false)}
            />
        </div>
    );
}

interface NutritionMeterProps {
    label: string;
    value: number;
    total: number;
    unit: string;
    color: string;
}

function NutritionMeter({
                            label,
                            value,
                            total,
                            unit,
                            color
                        }: NutritionMeterProps) {
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

interface NutritionItemProps {
    label: string;
    value: number;
    unit: string;
    percent: number;
    color: string;
}

function NutritionItem({
                           label,
                           value,
                           unit,
                           percent,
                           color
                       }: NutritionItemProps) {
    return (
        <div className="relative overflow-hidden p-3 sm:p-4 bg-muted rounded-lg touch-manipulation">
            <div
                className={`absolute bottom-0 left-0 w-full ${color} opacity-20 transition-all duration-500 ease-out`}
                style={{ height: `${percent}%` }}
            />
            <div className="relative z-10">
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className="text-lg sm:text-xl font-bold">
                    {value}<span className="text-sm ml-1">{unit}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{percent}% AJR</div>
            </div>
        </div>
    );
}