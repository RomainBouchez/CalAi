import { type Metadata } from 'next';
import './globals.css';
import { GeistSans } from 'geist/font/sans';
import Image from 'next/image';
import Link from 'next/link';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
    title: 'AiCal - AI Calorie Calculator',
    description: 'Smart nutritional analysis with AI',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={GeistSans.className}>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <meta name="apple-mobile-web-app-title" content="AiCal" />
            <meta name="theme-color" content="#000000" />
            <link rel="apple-touch-icon" href="/images/Logo_light.png" />
            <link rel="icon" href="/images/Logo_light.png" />
            <link rel="manifest" href="/manifest.json" />
            <title>AiCal - AI Calorie Calculator</title>
        </head>
        <body className="min-h-screen bg-background antialiased">
        <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
            <div className="flex h-16 items-center justify-between px-4 max-w-full">
                <div className="flex items-center gap-2 no-select">
                    <Image
                        src="/images/Logo_Black.png"
                        alt="AiCal Logo"
                        width={40}
                        height={40}
                        className="rounded-md"
                    />
                    <span className="font-bold tracking-tight text-lg">
                        <span className="text-primary">ai</span>cal
                    </span>
                </div>

                <nav className="hidden sm:flex gap-4 lg:gap-6">
                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors touch-manipulation">
                        Home
                    </Link>
                    <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors touch-manipulation">
                        Features
                    </Link>
                    <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors touch-manipulation">
                        About
                    </Link>
                    <Link href="#contact" className="text-sm font-medium hover:text-primary transition-colors touch-manipulation">
                        Contact
                    </Link>
                </nav>

                <button className="sm:hidden p-2 touch-manipulation rounded-lg active:bg-secondary no-select" aria-label="Menu">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </header>

        <main className="flex-1 w-full max-w-full overflow-hidden">
            <ErrorBoundary>
                <div className="w-full max-w-full px-4">
                    {children}
                </div>
            </ErrorBoundary>
        </main>
        <Toaster richColors position="top-right" />

        <footer className="border-t py-6 md:py-10 w-full max-w-full">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 text-center md:text-left max-w-full">
                <div>
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <div className="p-1.5 rounded-md">
                            <Image
                                src="/images/Logo_Black.png"
                                alt="AiCal Logo"
                                width={40}
                                height={40}
                                className="rounded-md"
                            />
                        </div>
                        <span className="font-bold tracking-tight text-sm">
                            <span className="text-primary">ai</span>cal
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        © 2025 aical. All rights reserved.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 text-xs text-muted-foreground">
                    <div className="space-y-2">
                        <p className="font-medium text-foreground">Product</p>
                        <p>Features</p>
                        <p>Pricing</p>
                        <p>FAQ</p>
                    </div>

                    <div className="space-y-2">
                        <p className="font-medium text-foreground">Legal</p>
                        <p>Terms of Service</p>
                        <p>Privacy Policy</p>
                        <p>Cookies</p>
                    </div>
                </div>
            </div>
        </footer>
        </body>
        </html>
    );
}