"use client";

import Image from "next/image";

export function Hero() {
    return (
        <div className="flex flex-col items-center justify-center py-12 md:py-24">
            {/* Background circle decoration */}
            <div className="absolute -z-10 opacity-70 blur-3xl bg-gradient-to-r from-primary/20 to-primary/10 rounded-full w-96 h-96 -top-20 -right-20" />

            <div className="max-w-3xl mx-auto text-center px-4">
                <h1
                    className="text-4xl md:text-6xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-5 duration-700"
                >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            aical
          </span> - Analyse nutritionnelle intelligente
                </h1>

                <p
                    className="mt-6 text-lg md:text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100"
                >
                    Prenez une photo de votre repas et découvrez instantanément sa valeur nutritionnelle complète.
                    Calories, protéines, glucides et lipides analysés en quelques secondes grâce à l'IA.
                </p>

                <div
                    className="mt-10 flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200"
                >
                    <div className="relative w-full max-w-2xl h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-secondary/5 z-10 rounded-2xl" />
                        <Image
                            src="https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                            alt="Analyse d'aliments"
                            fill
                            style={{ objectFit: 'cover' }}
                            className="rounded-2xl"
                            priority
                        />
                    </div>
                </div>
            </div>

            {/* Background circle decoration */}
            <div className="absolute -z-10 opacity-50 blur-3xl bg-gradient-to-r from-secondary/10 to-primary/5 rounded-full w-80 h-80 -bottom-20 -left-20" />
        </div>
    );
}