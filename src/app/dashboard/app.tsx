import { prisma } from "@/lib/prisma";
import { FoodHistory } from "@/components/FoodHistory";

export default async function Dashboard() {


    const foodEntries = await prisma.foodEntry.findMany({

        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">Historique alimentaire</h2>
            <FoodHistory entries={foodEntries} />
        </div>
    );
}