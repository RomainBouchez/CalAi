"use client";

import { useState, useEffect } from "react";
import { useMeals, MealType } from "@/context/MealsContext";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { Modal, ModalProvider, ModalBody, ModalContent, ModalTrigger, useModal } from "./ui/animated-modal";

interface NutritionGoalsDialogProps {
    goalType: "daily" | MealType;
    onClose?: () => void;
    children?: React.ReactNode;
}

const mealTypeLabels: Record<"daily" | MealType, string> = {
    daily: "Daily goals",
    breakfast: "Breakfast goals",
    lunch: "Lunch goals",
    dinner: "Dinner goals",
    snack: "Snack goals"
};

const NutritionGoalsDialogContent = ({ goalType, onClose }: Omit<NutritionGoalsDialogProps, 'children'>) => {
    const { dailyGoals, mealGoals, updateDailyGoals, updateMealGoals } = useMeals();
    const { setOpen } = useModal();

    const [goals, setGoals] = useState({
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0
    });

    // Initialize goals based on type
    useEffect(() => {
        if (goalType === "daily") {
            setGoals(dailyGoals);
        } else {
            setGoals(mealGoals[goalType]);
        }
    }, [goalType, dailyGoals, mealGoals]);

    const handleChange = (nutrient: keyof typeof goals, value: string) => {
        const numValue = parseFloat(value) || 0;
        setGoals(prev => ({ ...prev, [nutrient]: numValue }));
    };

    const handleSave = () => {
        if (goalType === "daily") {
            updateDailyGoals(goals);
        } else {
            updateMealGoals(goalType as MealType, goals);
        }
        setOpen(false);
        onClose?.();
    };

    return (
        <ModalContent className="w-full max-w-md p-0">
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{mealTypeLabels[goalType]}</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Calories (kcal)
                        </label>
                        <input
                            type="number"
                            value={goals.calories}
                            onChange={(e) => handleChange('calories', e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            min="0"
                            step="50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Protein (g)
                        </label>
                        <input
                            type="number"
                            value={goals.protein}
                            onChange={(e) => handleChange('protein', e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            min="0"
                            step="5"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Carbs (g)
                        </label>
                        <input
                            type="number"
                            value={goals.carbs}
                            onChange={(e) => handleChange('carbs', e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            min="0"
                            step="5"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Fats (g)
                        </label>
                        <input
                            type="number"
                            value={goals.fats}
                            onChange={(e) => handleChange('fats', e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            min="0"
                            step="5"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => { setOpen(false); onClose?.(); }}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save
                    </Button>
                </div>
            </div>
        </ModalContent>
    );
};

export function NutritionGoalsDialog({ goalType, onClose, children }: NutritionGoalsDialogProps) {
    return (
        <Modal>
            {children && (
                <ModalTrigger>
                    {children}
                </ModalTrigger>
            )}
            <ModalBody className="w-full max-w-md">
                <NutritionGoalsDialogContent goalType={goalType} onClose={onClose} />
            </ModalBody>
        </Modal>
    );
}