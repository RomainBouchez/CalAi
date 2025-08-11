"use client";

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: any) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Card className="p-6 m-4 border-destructive/50">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <AlertTriangle className="h-12 w-12 text-destructive" />
                        <div>
                            <h2 className="text-xl font-semibold">Une erreur est survenue</h2>
                            <p className="text-muted-foreground mt-2">
                                Désolé, quelque chose s'est mal passé. Veuillez réessayer.
                            </p>
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mt-4 text-sm text-left">
                                    <summary className="cursor-pointer">Détails de l'erreur</summary>
                                    <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto">
                                        {this.state.error.stack}
                                    </pre>
                                </details>
                            )}
                        </div>
                        <Button
                            onClick={() => {
                                this.setState({ hasError: false, error: undefined });
                                window.location.reload();
                            }}
                            className="gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Recharger la page
                        </Button>
                    </div>
                </Card>
            );
        }

        return this.props.children;
    }
}