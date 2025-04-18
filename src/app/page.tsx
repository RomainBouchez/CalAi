import { ImageUploader } from '@/components/ImageUploader'
import { NutritionCard } from '@/components/NutritionCard'
import { auth } from '@clerk/nextjs/server'

export default async function Home() {
    const { userId } = await auth()

    return (
        <main className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8">aical - AI Calorie Calculator</h1>
            <ImageUploader />
            {/* Ajouter le composant NutritionCard plus tard */}
        </main>
    )
}