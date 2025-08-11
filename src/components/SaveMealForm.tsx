"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { SaveIcon, CalendarIcon, Clock } from "lucide-react";
import { MealType } from "@/context/MealsContext";

interface AnalysisData {
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    estimated_weight_grams?: number;
    image?: string;
    vitamins?: string[];
}

interface SaveMealFormProps {
    analysis: AnalysisData;
    onSave: (mealData: {
        date: Date;
        mealType: MealType;
    }) => void;
}

// Utilisation de l'opérateur rest pour omettre proprement analysis des props
export function SaveMealForm({ onSave}: SaveMealFormProps) {
    const [date, setDate] = useState<Date>(new Date());
    const [mealType, setMealType] = useState<MealType>("breakfast");
    const [showForm, setShowForm] = useState(false);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(e.target.value);
        // Keep the time from current date selection
        newDate.setHours(date.getHours());
        newDate.setMinutes(date.getMinutes());
        setDate(newDate);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [hours, minutes] = e.target.value.split(':');
        const newDate = new Date(date);
        newDate.setHours(parseInt(hours));
        newDate.setMinutes(parseInt(minutes));
        setDate(newDate);
    };

    const handleSave = () => {
        onSave({
            date,
            mealType,
        });
        setShowForm(false);
    };

    const formatDateForInput = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const formatTimeForInput = (date: Date) => {
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    const getMealTypeLabel = (type: MealType): string => {
        const labels = {
            breakfast: "Petit-déjeuner",
            lunch: "Déjeuner",
            dinner: "Dîner",
            snack: "Collation"
        };
        return labels[type];
    };

    if (!showForm) {
        return (
            <div className="mt-6">
                <Button
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => setShowForm(true)}
                >
                    <SaveIcon className="h-4 w-4" />
                    Enregistrer ce repas
                </Button>
            </div>
        );
    }

    return (
        <Card className="mt-6 p-4">
            <h3 className="text-lg font-medium mb-4">Enregistrer ce repas</h3>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium mb-1 block">Type de repas</label>
                    <div className="grid grid-cols-2 gap-2">
                        {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((type) => (
                            <Button
                                key={type}
                                variant={mealType === type ? "default" : "outline"}
                                className="justify-start"
                                onClick={() => setMealType(type)}
                            >
                                {getMealTypeLabel(type)}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Date</label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="date"
                                value={formatDateForInput(date)}
                                onChange={handleDateChange}
                                className="pl-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Heure</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="time"
                                value={formatTimeForInput(date)}
                                onChange={handleTimeChange}
                                className="pl-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowForm(false)}>
                        Annuler
                    </Button>
                    <Button onClick={handleSave}>
                        Enregistrer
                    </Button>
                </div>
            </div>
        </Card>
    );
}