"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MealEntry {
    id: string;
    date: Date;
    mealType: MealType;
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    image?: string;
}

export interface DailyGoals {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface MealGoals {
    breakfast: { calories: number; protein: number; carbs: number; fats: number };
    lunch: { calories: number; protein: number; carbs: number; fats: number };
    dinner: { calories: number; protein: number; carbs: number; fats: number };
    snack: { calories: number; protein: number; carbs: number; fats: number };
}

interface MealsContextType {
    meals: MealEntry[];
    addMeal: (meal: Omit<MealEntry, "id">) => void;
    removeMeal: (id: string) => void;
    dailyGoals: DailyGoals;
    mealGoals: MealGoals;
    updateDailyGoals: (goals: Partial<DailyGoals>) => void;
    updateMealGoals: (mealType: MealType, goals: Partial<DailyGoals>) => void;
    getDailyMeals: (date: Date) => MealEntry[];
    getDailyTotals: (date: Date) => {
        calories: number;
        protein: number;
        carbs: number;
        fats: number
    };
    getMealTotals: (date: Date, mealType: MealType) => {
        calories: number;
        protein: number;
        carbs: number;
        fats: number
    };
}

const defaultDailyGoals: DailyGoals = {
    calories: 2000,
    protein: 60,
    carbs: 250,
    fats: 70
};

const defaultMealGoals: MealGoals = {
    breakfast: { calories: 500, protein: 15, carbs: 65, fats: 15 },
    lunch: { calories: 700, protein: 25, carbs: 90, fats: 25 },
    dinner: { calories: 600, protein: 20, carbs: 75, fats: 20 },
    snack: { calories: 200, protein: 5, carbs: 25, fats: 10 }
};

const MealsContext = createContext<MealsContextType | undefined>(undefined);

export function MealsProvider({ children }: { children: React.ReactNode }) {
    const [meals, setMeals] = useState<MealEntry[]>([]);
    const [dailyGoals, setDailyGoals] = useState<DailyGoals>(defaultDailyGoals);
    const [mealGoals, setMealGoals] = useState<MealGoals>(defaultMealGoals);

    // Load saved data from localStorage on mount
    useEffect(() => {
        const savedMeals = localStorage.getItem('meals');
        const savedDailyGoals = localStorage.getItem('dailyGoals');
        const savedMealGoals = localStorage.getItem('mealGoals');

        if (savedMeals) {
            try {
                const parsedMeals = JSON.parse(savedMeals);
                // Convert string dates back to Date objects
                const processedMeals = parsedMeals.map((meal: any) => ({
                    ...meal,
                    date: new Date(meal.date)
                }));
                setMeals(processedMeals);
            } catch (error) {
                console.error('Error parsing saved meals:', error);
            }
        }

        if (savedDailyGoals) {
            try {
                setDailyGoals(JSON.parse(savedDailyGoals));
            } catch (error) {
                console.error('Error parsing saved daily goals:', error);
            }
        }

        if (savedMealGoals) {
            try {
                setMealGoals(JSON.parse(savedMealGoals));
            } catch (error) {
                console.error('Error parsing saved meal goals:', error);
            }
        }
    }, []);

    // Save to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('meals', JSON.stringify(meals));
    }, [meals]);

    useEffect(() => {
        localStorage.setItem('dailyGoals', JSON.stringify(dailyGoals));
    }, [dailyGoals]);

    useEffect(() => {
        localStorage.setItem('mealGoals', JSON.stringify(mealGoals));
    }, [mealGoals]);

    const addMeal = (meal: Omit<MealEntry, "id">) => {
        const newMeal: MealEntry = {
            ...meal,
            id: Date.now().toString() // Simple unique ID
        };
        setMeals((prevMeals) => [...prevMeals, newMeal]);
    };

    const removeMeal = (id: string) => {
        setMeals((prevMeals) => prevMeals.filter(meal => meal.id !== id));
    };

    const updateDailyGoals = (goals: Partial<DailyGoals>) => {
        setDailyGoals((prev) => ({ ...prev, ...goals }));
    };

    const updateMealGoals = (mealType: MealType, goals: Partial<DailyGoals>) => {
        setMealGoals((prev) => ({
            ...prev,
            [mealType]: { ...prev[mealType], ...goals }
        }));
    };

    const isSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    const getDailyMeals = (date: Date) => {
        return meals.filter(meal => isSameDay(meal.date, date));
    };

    const getDailyTotals = (date: Date) => {
        const dailyMeals = getDailyMeals(date);

        return dailyMeals.reduce(
            (totals, meal) => ({
                calories: totals.calories + meal.calories,
                protein: totals.protein + meal.protein,
                carbs: totals.carbs + meal.carbs,
                fats: totals.fats + meal.fats
            }),
            { calories: 0, protein: 0, carbs: 0, fats: 0 }
        );
    };

    const getMealTotals = (date: Date, mealType: MealType) => {
        const filteredMeals = meals.filter(
            meal => isSameDay(meal.date, date) && meal.mealType === mealType
        );

        return filteredMeals.reduce(
            (totals, meal) => ({
                calories: totals.calories + meal.calories,
                protein: totals.protein + meal.protein,
                carbs: totals.carbs + meal.carbs,
                fats: totals.fats + meal.fats
            }),
            { calories: 0, protein: 0, carbs: 0, fats: 0 }
        );
    };

    return (
        <MealsContext.Provider
            value={{
                meals,
                addMeal,
                removeMeal,
                dailyGoals,
                mealGoals,
                updateDailyGoals,
                updateMealGoals,
                getDailyMeals,
                getDailyTotals,
                getMealTotals
            }}
        >
            {children}
        </MealsContext.Provider>
    );
}

export function useMeals() {
    const context = useContext(MealsContext);
    if (context === undefined) {
        throw new Error('useMeals must be used within a MealsProvider');
    }
    return context;
}