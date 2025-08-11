"use client";

import { Camera, BarChart3, Leaf, Zap } from "lucide-react";

export function FeaturesSection() {
    const features = [
        {
            icon: <Camera className="h-6 w-6" />,
            title: "AI Image Analysis",
            description:
                "Simply take a photo of your meal and our AI precisely identifies the foods."
        },
        {
            icon: <BarChart3 className="h-6 w-6" />,
            title: "Detailed Nutritional Data",
            description:
                "Get calories, protein, carbs, fats and vitamins for each food."
        },
        {
            icon: <Leaf className="h-6 w-6" />,
            title: "Food Suggestions",
            description:
                "Receive personalized recommendations based on your health goals."
        },
        {
            icon: <Zap className="h-6 w-6" />,
            title: "Fast and Accurate",
            description:
                "Results in seconds with precision based on the best nutritional databases."
        }
    ];

    return (
        <section id="features" className="py-16 md:py-24">
            <div className="container px-4">
                <div className="text-center mb-16">
                    <h2
                        className="text-3xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-5 duration-700"
                    >
                        Main Features
                    </h2>
                    <p
                        className="mt-4 text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100"
                    >
                        aical combines advanced AI technology and nutrition science to offer you
                        an unparalleled food analysis experience.
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