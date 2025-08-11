"use client";

import { Hero } from './Hero';
import { FeaturesSection } from './FeaturesSection';
import { Button } from './ui/button';
import { Camera, BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import { Card } from './ui/card';

interface HomePageProps {
    onNavigateToAnalyzer: () => void;
    onNavigateToJournal: () => void;
}

export function HomePage({ onNavigateToAnalyzer, onNavigateToJournal }: HomePageProps) {
    const handleNavigateToAnalyzer = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        onNavigateToAnalyzer();
    };

    const handleNavigateToJournal = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        onNavigateToJournal();
    };

    return (
        <div className="flex flex-col">
            <Hero />
            
            {/* Quick Actions Section */}
            <section className="py-16 bg-muted/30">
                <div className="container px-4 max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">
                            Get Started with AI-Powered Nutrition
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Choose how you want to begin your healthy eating journey
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="p-8 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={handleNavigateToAnalyzer}>
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                                    <Camera className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">Analyze Your Food</h3>
                                <p className="text-muted-foreground">
                                    Take a photo or describe your meal to get instant nutritional analysis
                                </p>
                                <Button className="w-full group-hover:scale-105 transition-transform">
                                    Start Analyzing
                                    <Sparkles className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </Card>
                        
                        <Card className="p-8 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={handleNavigateToJournal}>
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-secondary/20 transition-colors">
                                    <BookOpen className="w-8 h-8 text-secondary-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold">Food Journal</h3>
                                <p className="text-muted-foreground">
                                    Track your daily nutrition goals and monitor your eating habits
                                </p>
                                <Button variant="outline" className="w-full group-hover:scale-105 transition-transform">
                                    View Journal
                                    <TrendingUp className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>
            
            <FeaturesSection />
            
            {/* CTA Section */}
            <section className="py-16 bg-primary/5">
                <div className="container px-4 max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Nutrition?</h2>
                    <p className="text-muted-foreground">
                        Join thousands of users who have improved their eating habits with AI-powered insights
                    </p>
                </div>
            </section>
        </div>
    );
}