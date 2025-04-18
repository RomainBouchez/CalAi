"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function NutritionCard({ analysis }: { analysis: any }) {
  const dailyValues = {
    calories: 2000,
    protein: 50,
    carbs: 300,
    fats: 70
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">{analysis.food_name}</h2>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Calories</span>
          <span>{analysis.calories} / {dailyValues.calories}</span>
        </div>
        <Progress value={(analysis.calories / dailyValues.calories) * 100} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <NutritionItem label="Protéines" value={analysis.protein} unit="g" />
        <NutritionItem label="Glucides" value={analysis.carbs} unit="g" />
        <NutritionItem label="Lipides" value={analysis.fats} unit="g" />
      </div>

      {analysis.vitamins?.length > 0 && (
        <div className="pt-4">
          <h3 className="font-semibold">Vitamines :</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {analysis.vitamins.map((v: string) => (
              <span key={v} className="bg-secondary px-2 py-1 rounded-md text-sm">
                {v}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function NutritionItem({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="text-center p-3 bg-muted rounded-lg">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-xl font-bold">{value}<span className="text-sm ml-1">{unit}</span></div>
    </div>
  );
}