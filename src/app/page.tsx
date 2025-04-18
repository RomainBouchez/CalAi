"use client";

import { ImageUploader } from '@/components/ImageUploader'
import { Hero } from '@/components/Hero'
import { FeaturesSection } from '@/components/FeaturesSection'
import { DailyDashboard } from '@/components/DailyDashboard'
import { MealsProvider } from '@/context/MealsContext'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Home() {
    const [activeTab, setActiveTab] = useState<string>("analyser");

    return (
        <MealsProvider>
            <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-12">
                {activeTab === "analyser" && <Hero />}

                <div className="max-w-5xl mx-auto w-full px-4 mt-8">
                    <Tabs
                        defaultValue="analyser"
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="analyser">Analyser un aliment</TabsTrigger>
                            <TabsTrigger value="journal">Journal alimentaire</TabsTrigger>
                        </TabsList>

                        <TabsContent value="analyser" className="mt-6">
                            <section className="relative py-8">
                                {/* Background decorations */}
                                <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

                                <div className="max-w-2xl mx-auto">
                                    <div className="flex flex-col gap-8">
                                        <div className="text-center">
                                            <h2 className="text-3xl font-bold tracking-tight">
                                                Analysez votre repas en un instant
                                            </h2>
                                            <p className="mt-3 text-muted-foreground">
                                                Prenez une photo de votre repas et notre IA analysera son contenu nutritionnel.
                                                Découvrez la composition des aliments que vous consommez pour des choix plus éclairés.
                                            </p>
                                        </div>

                                        <ImageUploader />
                                    </div>
                                </div>
                            </section>

                            {activeTab === "analyser" && <FeaturesSection />}
                        </TabsContent>

                        <TabsContent value="journal">
                            <DailyDashboard />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </MealsProvider>
    )
}