import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from './LoadingSpinner';
import { Brain, Image, Zap } from 'lucide-react';

interface AnalysisLoadingProps {
    type: 'image' | 'text';
    onComplete?: () => void;
}

const loadingSteps = {
    image: [
        { icon: Image, text: 'Traitement de l\'image...', duration: 2000 },
        { icon: Brain, text: 'Analyse par IA...', duration: 3000 },
        { icon: Zap, text: 'Calcul des valeurs nutritionnelles...', duration: 1500 }
    ],
    text: [
        { icon: Brain, text: 'Compréhension de la description...', duration: 1500 },
        { icon: Zap, text: 'Recherche des informations nutritionnelles...', duration: 2500 }
    ]
};

export function AnalysisLoading({ type, onComplete }: AnalysisLoadingProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    
    const steps = loadingSteps[type];

    useEffect(() => {
        if (currentStep >= steps.length) {
            onComplete?.();
            return;
        }

        const step = steps[currentStep];
        const stepDuration = step.duration;
        const interval = 50; // Update every 50ms
        const totalUpdates = stepDuration / interval;
        let updates = 0;

        const timer = setInterval(() => {
            updates++;
            const stepProgress = Math.min((updates / totalUpdates) * 100, 100);
            const overallProgress = ((currentStep + stepProgress / 100) / steps.length) * 100;
            
            setProgress(overallProgress);

            if (stepProgress >= 100) {
                clearInterval(timer);
                setTimeout(() => {
                    setCurrentStep(prev => prev + 1);
                }, 200);
            }
        }, interval);

        return () => clearInterval(timer);
    }, [currentStep, steps, onComplete]);

    if (currentStep >= steps.length) {
        return null;
    }

    const currentStepData = steps[currentStep];
    const Icon = currentStepData.icon;

    return (
        <Card className="p-6 max-w-md mx-auto">
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <Icon className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Analyse en cours</h3>
                    <p className="text-muted-foreground">
                        {currentStepData.text}
                    </p>
                </div>

                <div className="space-y-2">
                    <Progress value={progress} className="w-full" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Étape {currentStep + 1} / {steps.length}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm text-muted-foreground">
                        Cela peut prendre quelques secondes...
                    </span>
                </div>
            </div>
        </Card>
    );
}