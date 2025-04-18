import { type Metadata } from 'next';
import './globals.css';
import { GeistSans } from 'geist/font/sans';
import { Camera } from 'lucide-react';

export const metadata: Metadata = {
    title: 'aical - AI Calorie Calculator',
    description: 'Analyse nutritionnelle intelligente avec IA',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="fr" className={GeistSans.className}>
        <body className="min-h-screen bg-background antialiased">
        <header className="border-b">
            <div className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-1.5 rounded-md">
                        <Camera className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-bold tracking-tight">
                                <span className="text-primary">ai</span>cal
                            </span>
                </div>

                <nav className="hidden md:flex gap-6">
                    <a href="/" className="text-sm font-medium hover:text-primary transition-colors">
                        Accueil
                    </a>
                    <a href="#fonctionnalites" className="text-sm font-medium hover:text-primary transition-colors">
                        Fonctionnalités
                    </a>
                    <a href="#a-propos" className="text-sm font-medium hover:text-primary transition-colors">
                        À propos
                    </a>
                    <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
                        Contact
                    </a>
                </nav>
            </div>
        </header>

        <main>{children}</main>

        <footer className="border-t py-6 md:py-10">
            <div className="container flex flex-col md:flex-row justify-between items-center gap-4 px-4 text-center md:text-left">
                <div>
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <div className="bg-primary/10 p-1.5 rounded-md">
                            <Camera className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-bold tracking-tight text-sm">
                                    <span className="text-primary">ai</span>cal
                                </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        © 2025 aical. Tous droits réservés.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 text-xs text-muted-foreground">
                    <div className="space-y-2">
                        <p className="font-medium text-foreground">Produit</p>
                        <p>Fonctionnalités</p>
                        <p>Tarifs</p>
                        <p>FAQ</p>
                    </div>

                    <div className="space-y-2">
                        <p className="font-medium text-foreground">Légal</p>
                        <p>Conditions d'utilisation</p>
                        <p>Politique de confidentialité</p>
                        <p>Cookies</p>
                    </div>
                </div>
            </div>
        </footer>
        </body>
        </html>
    );
}