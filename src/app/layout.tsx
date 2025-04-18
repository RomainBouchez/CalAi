import { type Metadata } from 'next';
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
    title: 'aical - AI Calorie Calculator',
    description: 'Analyse nutritionnelle intelligente avec AI',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider>
            <html lang="en">
            <body className="min-h-screen bg-background antialiased">
            <header className="flex justify-end items-center p-4 border-b">
                <SignedOut>
                    <a href="/sign-in" className="mr-4 text-primary hover:underline">Connexion</a>
                    <a href="/sign-up" className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90">
                        Inscription
                    </a>
                </SignedOut>
                <SignedIn>
                    <div className="flex items-center gap-4">
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </SignedIn>
            </header>
            <main className="container mx-auto p-4">{children}</main>
            </body>
            </html>
        </ClerkProvider>
    );
}