"use client";

import { DailyDashboard } from "@/components/DailyDashboard";
import { MealsProvider } from "@/context/MealsContext";

export default function Dashboard() {
    return (
        <div className="container mx-auto p-4">
            <MealsProvider>
                <h1 className="text-3xl font-bold mb-8">Votre journal alimentaire</h1>
                <DailyDashboard />
            </MealsProvider>
        </div>
    );
}