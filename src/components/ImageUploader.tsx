'use client'

import { useRef, useState } from 'react'
import { Button } from './ui/button'
import { saveFoodEntry } from '@/actions/food-entry.action'

export function ImageUploader() {
    const fileRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setLoading(true)
            setError(null)

            // Convert file to base64
            const base64 = await fileToBase64(file)

            // Send data in the exact same format as your working Expo app
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: {
                        inlineData: {
                            data: base64,
                            mimeType: file.type,
                        },
                    },
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`)
            }

            const data = await response.json()

            // Format the result to match expected structure
            if (data.success && data.data) {
                const foodAnalysis = data.data.foodAnalysis;

                // Create a local object URL for the image preview
                const imageUrl = URL.createObjectURL(file);
                foodAnalysis.image = imageUrl;

                setResult(foodAnalysis);

                // Save the food entry if the analysis was successful
                try {
                    await saveFoodEntry(foodAnalysis);
                } catch (saveError) {
                    console.error('Error saving food entry:', saveError);
                    // Continue anyway - don't show this error to user
                }
            }
        } catch (error) {
            console.error('Error analyzing food image:', error)
            setError(error instanceof Error ? error.message : 'An unknown error occurred')
        } finally {
            setLoading(false)
        }
    }

    // Helper function to convert File to base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => {
                let base64String = reader.result as string
                // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
                base64String = base64String.split(',')[1]
                resolve(base64String)
            }
            reader.onerror = error => reject(error)
        })
    }

    return (
        <div className="space-y-4">
            <input
                type="file"
                ref={fileRef}
                accept="image/*"
                hidden
                onChange={handleUpload}
            />
            <Button
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                className="w-full"
            >
                {loading ? 'Analysing...' : 'Upload Food Image'}
            </Button>

            {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
                    <p className="font-medium">Error:</p>
                    <p>{error}</p>
                </div>
            )}

            {result && (
                <div className="mt-6 space-y-4">
                    <div className="w-full h-64 relative rounded-lg overflow-hidden">
                        <img
                            src={result.image}
                            alt={result.identifiedFood}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-bold mb-2">{result.identifiedFood}</h3>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-gray-700">Portion Information</h4>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div>
                                        <p className="text-sm text-gray-500">Portion Size:</p>
                                        <p className="font-medium">{result.portionSize}g</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Serving Size:</p>
                                        <p className="font-medium">{result.recognizedServingSize}g</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-700">Nutrition Facts (per portion)</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-1">
                                    <div>
                                        <p className="text-sm text-gray-500">Calories:</p>
                                        <p className="font-medium">{result.nutritionFactsPerPortion.calories}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Protein:</p>
                                        <p className="font-medium">{result.nutritionFactsPerPortion.protein}g</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Carbs:</p>
                                        <p className="font-medium">{result.nutritionFactsPerPortion.carbs}g</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Fat:</p>
                                        <p className="font-medium">{result.nutritionFactsPerPortion.fat}g</p>
                                    </div>
                                </div>
                            </div>

                            {result.additionalNotes && result.additionalNotes.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-gray-700">Additional Notes</h4>
                                    <ul className="list-disc pl-5 mt-1 space-y-1">
                                        {result.additionalNotes.map((note: string, index: number) => (
                                            <li key={index} className="text-gray-600">{note}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}