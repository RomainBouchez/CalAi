'use client'

import { useRef, useState } from 'react'
import { Button } from './ui/button'
import { Camera, Upload, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { NutritionCard } from './NutritionCard'
import { saveFoodEntry } from '@/actions/food-entry.action'

// Define type for analysis results
interface AnalysisResult {
    food_name: string;
    estimated_weight_grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    vitamins?: string[];
    image?: string;
}

export function ImageUploader() {
    const fileRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        processUpload(file)
    }

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            processUpload(file)
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
    }

    const processUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image')
            return
        }

        try {
            setLoading(true)
            setError(null)

            // Convert file to base64
            const base64 = await fileToBase64(file)

            // Display a console message
            console.log('Analyse en cours...')

            // Send data to the analyze endpoint
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
                const foodAnalysis = data.data.foodAnalysis

                // Convert to our simple schema format
                const formattedAnalysis: AnalysisResult = {
                    food_name: foodAnalysis.identifiedFood,
                    estimated_weight_grams: parseFloat(foodAnalysis.portionSize),
                    calories: parseFloat(foodAnalysis.nutritionFactsPerPortion.calories),
                    protein: parseFloat(foodAnalysis.nutritionFactsPerPortion.protein),
                    carbs: parseFloat(foodAnalysis.nutritionFactsPerPortion.carbs),
                    fats: parseFloat(foodAnalysis.nutritionFactsPerPortion.fat),
                    vitamins: foodAnalysis.additionalNotes || []
                }

                // Create a local object URL for the image preview
                const imageUrl = URL.createObjectURL(file)
                formattedAnalysis.image = imageUrl

                setResult(formattedAnalysis)
                console.log('Analyse terminée !')

                // Save the food entry if the analysis was successful
                try {
                    await saveFoodEntry(formattedAnalysis)
                } catch (saveError) {
                    console.error('Error saving food entry:', saveError)
                    // Continue anyway - don't show this error to user
                }
            } else {
                throw new Error('Analyse échouée')
            }
        } catch (error) {
            console.error('Error analyzing food image:', error)
            setError(error instanceof Error ? error.message : 'Une erreur est survenue')
            alert('Impossible d\'analyser l\'image')
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

    const resetAnalysis = () => {
        setResult(null)
        setError(null)
    }

    return (
        <AnimatePresence mode="wait">
            {!result ? (
                <motion.div
                    key="uploader"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-xl mx-auto"
                >
                    <input
                        type="file"
                        ref={fileRef}
                        accept="image/*"
                        hidden
                        onChange={handleUpload}
                    />

                    <div
                        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-10 transition-colors touch-manipulation
                            ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-col items-center justify-center gap-4 text-center">
                            <div className="p-6 bg-primary/10 rounded-full">
                                <Camera className="h-10 w-10 text-primary" />
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold">Analysez votre repas</h3>
                                <p className="text-muted-foreground mt-1">
                                    Prenez une photo ou glissez-déposez une image de votre aliment
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 w-full sm:w-auto">
                                <Button
                                    onClick={() => fileRef.current?.click()}
                                    disabled={loading}
                                    variant="outline"
                                    className="gap-2 min-h-12 text-sm sm:text-base touch-manipulation w-full sm:w-auto"
                                >
                                    <Upload className="h-4 w-4" />
                                    Choisir une image
                                </Button>

                                <Button
                                    onClick={() => fileRef.current?.click()}
                                    disabled={loading}
                                    className="gap-2 min-h-12 text-sm sm:text-base touch-manipulation w-full sm:w-auto"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Analyse en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="h-4 w-4" />
                                            Prendre une photo
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg"
                        >
                            <p className="font-medium">Erreur :</p>
                            <p>{error}</p>
                        </motion.div>
                    )}
                </motion.div>
            ) : (
                <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-xl mx-auto"
                >
                    <NutritionCard analysis={result} />

                    <div className="flex justify-center mt-6">
                        <Button
                            variant="outline"
                            onClick={resetAnalysis}
                            className="gap-2"
                        >
                            <Camera className="h-4 w-4" />
                            Analyser un autre aliment
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}