import { EnvSchema } from './schemas';

function validateEnv() {
    const env = {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    };

    try {
        return EnvSchema.parse(env);
    } catch (error) {
        console.error('❌ Environment validation failed:');
        
        if (error instanceof Error) {
            console.error(error.message);
        }
        
        // In development, we want to see the full error
        if (process.env.NODE_ENV === 'development') {
            console.error('Full error details:', error);
        }

        process.exit(1);
    }
}

// Validate environment variables on module load
export const env = validateEnv();

// Export individual environment variables with proper typing
export const {
    NODE_ENV,
    DATABASE_URL,
    GEMINI_API_KEY,
    NEXTAUTH_SECRET,
    NEXTAUTH_URL
} = env;

// Helper function to check if we're in development
export const isDevelopment = NODE_ENV === 'development';
export const isProduction = NODE_ENV === 'production';
export const isTest = NODE_ENV === 'test';

// Helper to safely access environment variables
export function getEnvVar(key: string, fallback?: string): string {
    const value = process.env[key];
    if (!value && !fallback) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value || fallback!;
}