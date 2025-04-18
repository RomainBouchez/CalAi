"use client";

import { Camera, BarChart3, Leaf, Zap } from "lucide-react";

export function FeaturesSection() {
    const features = [
        {
            icon: <Camera className="h-6 w-6" />,
            title: "Analyse d'image IA",
            description:
                "Prenez simplement une photo de votre repas et notre IA identifie précisément les aliments."
        },
        {
            icon: <BarChart3 className="h-6 w-6" />,
            title: "Données nutritionnelles détaillées",
            description:
                "Obtenez les calories, protéines, glucides, lipides et vitamines de chaque aliment."
        },
        {
            icon: <Leaf className="h-6 w-6" />,
            title: "Suggestions alimentaires",
            description:
                "Recevez des recommandations personnalisées basées sur vos objectifs de santé."
        },
        {
            icon: <Zap className="h-6 w-6" />,
            title: "Rapide et précis",
            description:
                "Résultats en quelques secondes avec une précision basée sur les meilleures bases de données nutritionnelles."
        }
    ];

    return (
        <section id="fonctionnalites" className="py-16 md:py-24">
            <div className="container px-4">
                <div className="text-center mb-16">
                    <h2
                        className="text-3xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-5 duration-700"
                    >
                        Fonctionnalités principales
                    </h2>
                    <p
                        className="mt-4 text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100"
                    >
                        aical combine la technologie d'IA avancée et la science de la nutrition pour vous offrir
                        une expérience d'analyse alimentaire inégalée.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-lg bg-card border shadow-sm animate-in fade-in slide-in-from-bottom-5 duration-700"
                            style={{ animationDelay: `${(index + 1) * 100}ms` }}
                        >
                            <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}