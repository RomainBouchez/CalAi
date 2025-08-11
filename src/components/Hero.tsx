"use client";

import Image from "next/image";

export function Hero() {
    return (
        <div className="relative flex flex-col items-center justify-center py-8 sm:py-12 md:py-24 w-full max-w-full overflow-hidden">
            {/* Background circle decoration */}
            <div className="absolute -z-10 opacity-70 blur-3xl bg-gradient-to-r from-primary/20 to-primary/10 rounded-full w-64 h-64 sm:w-96 sm:h-96 -top-10 sm:-top-20 -right-10 sm:-right-20" />

            <div className="w-full max-w-4xl mx-auto text-center px-0">
                <h1
                    className="text-2xl sm:text-4xl md:text-6xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-5 duration-700 no-select"
                >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            aical
          </span> - Smart nutritional analysis
                </h1>

                <p
                    className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100"
                >
                    Take a photo of your meal and instantly discover its complete nutritional value.
                    Calories, protein, carbs and fats analyzed in seconds thanks to AI.
                </p>

                <div
                    className="mt-6 sm:mt-10 w-full animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200"
                >
                    <div className="relative w-full max-w-2xl mx-auto h-48 sm:h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-secondary/5 z-10 rounded-2xl" />
                        <Image
                            src="https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                            alt="Food analysis"
                            fill
                            style={{ objectFit: 'cover' }}
                            className="rounded-2xl"
                            priority
                        />
                    </div>
                </div>
            </div>

            {/* Background circle decoration */}
            <div className="absolute -z-10 opacity-50 blur-3xl bg-gradient-to-r from-secondary/10 to-primary/5 rounded-full w-64 h-64 sm:w-80 sm:h-80 -bottom-10 sm:-bottom-20 -left-10 sm:-left-20" />
        </div>
    );
}