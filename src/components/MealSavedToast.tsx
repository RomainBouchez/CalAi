"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { MealType } from "@/context/MealsContext";

interface MealSavedToastProps {
    show: boolean;
    mealType: MealType;
    foodName: string;
    onClose: () => void;
}

const mealTypeLabels: Record<MealType, string> = {
    breakfast: "Petit-déjeuner",
    lunch: "Déjeuner",
    dinner: "Dîner",
    snack: "Collation"
};

export function MealSavedToast({ show, mealType, foodName, onClose }: MealSavedToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Allow animation to complete before fully removing
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show && !isVisible) return null;

    return (
        <div
            className={`fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
        >
            <div className="bg-primary text-primary-foreground shadow-lg rounded-lg px-4 py-3 flex items-center gap-3 max-w-sm">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <div>
                    <p className="font-medium">Repas enregistré</p>
                    <p className="text-sm opacity-90">
                        <span className="font-medium">{foodName}</span> ajouté à votre {mealTypeLabels[mealType].toLowerCase()}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onClose, 300);
                    }}
                    className="ml-auto p-1 rounded-full hover:bg-primary-foreground/10 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    );
}