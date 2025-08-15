"use client";

import { ImageUploader } from '@/components/ImageUploader'
import { HomePage } from '@/components/HomePage'
import { DailyDashboard } from '@/components/DailyDashboard'
import { AiFoodChat } from '@/components/AiFoodChat'
import { MealsProvider } from '@/context/MealsContext'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Dock, { type DockItemData } from '@/components/ui/Dock'
import { Camera, BookOpen, Home as HomeIcon, User, LogIn, UserPlus } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function Home() {
    const { isSignedIn, user } = useUser()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<string>("home");
    const [analysisMethod, setAnalysisMethod] = useState<"photo" | "text">("photo");

    const dockItems: DockItemData[] = [
        {
            icon: <Camera className="w-6 h-6" />,
            label: "Analyze Food",
            onClick: () => setActiveTab("analyser"),
            className: activeTab === "analyser" ? "active" : ""
        },
        {
            icon: <HomeIcon className="w-6 h-6" />,
            label: "Home",
            onClick: () => setActiveTab("home"),
            className: activeTab === "home" ? "active" : ""
        },
        {
            icon: <BookOpen className="w-6 h-6" />,
            label: "Food Journal",
            onClick: () => setActiveTab("journal"),
            className: activeTab === "journal" ? "active" : ""
        },
        // Ajouter les boutons d'authentification selon l'état de connexion
        ...(!isSignedIn ? [
            {
                icon: <LogIn className="w-6 h-6" />,
                label: "Sign In",
                onClick: () => router.push('/auth/signin'),
                className: ""
            },
            {
                icon: <UserPlus className="w-6 h-6" />,
                label: "Sign Up", 
                onClick: () => router.push('/auth/signup'),
                className: ""
            }
        ] : [
            {
                icon: <User className="w-6 h-6" />,
                label: "Compte",
                onClick: () => router.push('/profile'),
                className: ""
            }
        ])
    ];

    return (
        <MealsProvider>
            <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-12">
                <div className="w-full pb-24">
                    {/* Home Page */}
                    {activeTab === "home" && (
                        <HomePage 
                            onNavigateToAnalyzer={() => setActiveTab("analyser")}
                            onNavigateToJournal={() => setActiveTab("journal")}
                        />
                    )}

                    {/* Food Analysis Page */}
                    {activeTab === "analyser" && (
                        <div className="max-w-5xl mx-auto w-full px-4 mt-8">
                            <section className="relative py-8">
                                {/* Background decorations */}
                                <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

                                <div className="max-w-2xl mx-auto">
                                    <div className="flex flex-col gap-8">
                                        <div className="text-center">
                                            <h2 className="text-3xl font-bold tracking-tight">
                                                Analyze your meal instantly
                                            </h2>
                                            <p className="mt-3 text-muted-foreground">
                                                Take a photo of your meal or describe it, and our AI will analyze its nutritional content.
                                                Discover the composition of the food you eat for more informed choices.
                                            </p>

                                            <div className="mt-6">
                                                <Tabs
                                                    value={analysisMethod}
                                                    onValueChange={(value) => setAnalysisMethod(value as "photo" | "text")}
                                                    className="w-full max-w-md mx-auto"
                                                >
                                                    <TabsList>
                                                        <TabsTrigger value="photo">
                                                            By photo
                                                        </TabsTrigger>
                                                        <TabsTrigger value="text">
                                                            By text
                                                        </TabsTrigger>
                                                    </TabsList>
                                                </Tabs>
                                            </div>
                                        </div>

                                        {analysisMethod === "photo" ? (
                                            <ImageUploader />
                                        ) : (
                                            <AiFoodChat />
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Food Journal Page */}
                    {activeTab === "journal" && (
                        <div className="max-w-5xl mx-auto w-full px-4 mt-8">
                            <DailyDashboard />
                        </div>
                    )}
                </div>
                
                {/* Floating Dock Navigation */}
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                    <Dock
                        items={dockItems}
                        magnification={30}
                        distance={150}
                        panelHeight={68}
                        baseItemSize={52}
                    />
                </div>
            </div>
        </MealsProvider>
    )
}