"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface FoodEntry {
    id: string;
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    createdAt: Date | string;
}

export function FoodHistory({ entries }: { entries: FoodEntry[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Aliment</TableHead>
                    <TableHead>Calories</TableHead>
                    <TableHead>Protéines</TableHead>
                    <TableHead>Glucides</TableHead>
                    <TableHead>Lipides</TableHead>
                    <TableHead>Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {entries.map((entry) => (
                    <TableRow key={entry.id}>
                        <TableCell>{entry.foodName}</TableCell>
                        <TableCell>{entry.calories}</TableCell>
                        <TableCell>{entry.protein}g</TableCell>
                        <TableCell>{entry.carbs}g</TableCell>
                        <TableCell>{entry.fats}g</TableCell>
                        <TableCell>
                            {new Date(entry.createdAt).toLocaleDateString()}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}