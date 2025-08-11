import { toast } from "sonner";

export interface ApiError {
    message: string;
    status?: number;
    code?: string;
}

export class AppError extends Error {
    public readonly status: number;
    public readonly code?: string;
    public readonly isOperational: boolean;

    constructor(message: string, status: number = 500, code?: string, isOperational: boolean = true) {
        super(message);
        this.status = status;
        this.code = code;
        this.isOperational = isOperational;
        this.name = 'AppError';

        Error.captureStackTrace(this, this.constructor);
    }
}

export const ErrorCodes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    API_ERROR: 'API_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    NOT_FOUND: 'NOT_FOUND',
    SERVER_ERROR: 'SERVER_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export function createApiError(message: string, status: number, code?: ErrorCode): AppError {
    return new AppError(message, status, code);
}

export function handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const status = response.status;
        let code: ErrorCode;
        let message: string;

        switch (status) {
            case 400:
                code = ErrorCodes.VALIDATION_ERROR;
                message = 'Données invalides';
                break;
            case 401:
                code = ErrorCodes.UNAUTHORIZED;
                message = 'Accès non autorisé';
                break;
            case 404:
                code = ErrorCodes.NOT_FOUND;
                message = 'Ressource non trouvée';
                break;
            case 500:
            default:
                code = ErrorCodes.SERVER_ERROR;
                message = 'Erreur serveur';
                break;
        }

        throw createApiError(message, status, code);
    }

    return response.json();
}

export function handleError(error: unknown, context?: string): void {
    console.error(`Error ${context ? `in ${context}` : ''}:`, error);

    let message = 'Une erreur inattendue est survenue';

    if (error instanceof AppError) {
        message = error.message;
    } else if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }

    toast.error(message);
}

export function logError(error: unknown, context?: string): void {
    console.error(`Error ${context ? `in ${context}` : ''}:`, error);

    // In production, you would send this to your error tracking service
    // e.g., Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
        // Send to error tracking service
    }
}

export async function safeApiCall<T>(
    apiCall: () => Promise<T>,
    context?: string,
    showToast: boolean = true
): Promise<{ data?: T; error?: string }> {
    try {
        const data = await apiCall();
        return { data };
    } catch (error) {
        logError(error, context);
        
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        
        if (showToast) {
            handleError(error, context);
        }

        return { error: errorMessage };
    }
}