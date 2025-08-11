import { toast as sonnerToast } from 'sonner';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
    title?: string;
    description?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const toastIcons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
};

const toastStyles = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
};

function createToast(type: ToastType, message: string, options: ToastOptions = {}) {
    const Icon = toastIcons[type];
    const iconClass = toastStyles[type];

    return sonnerToast(message, {
        duration: options.duration || 4000,
        description: options.description,
        icon: <Icon className={`h-4 w-4 ${iconClass}`} />,
        action: options.action ? {
            label: options.action.label,
            onClick: options.action.onClick,
        } : undefined,
    });
}

export const toast = {
    success: (message: string, options?: ToastOptions) => 
        createToast('success', message, options),
    
    error: (message: string, options?: ToastOptions) => 
        createToast('error', message, options),
    
    warning: (message: string, options?: ToastOptions) => 
        createToast('warning', message, options),
    
    info: (message: string, options?: ToastOptions) => 
        createToast('info', message, options),

    // Specialized toasts for common use cases
    foodSaved: (foodName: string) => 
        toast.success(`${foodName} ajouté à votre journal`, {
            description: 'Les informations nutritionnelles ont été sauvegardées.',
        }),

    analysisComplete: (foodName: string) => 
        toast.success('Analyse terminée!', {
            description: `Informations nutritionnelles pour ${foodName} récupérées.`,
        }),

    analysisError: () => 
        toast.error('Erreur d\'analyse', {
            description: 'Impossible d\'analyser l\'aliment. Veuillez réessayer.',
        }),

    networkError: () => 
        toast.error('Erreur de connexion', {
            description: 'Vérifiez votre connexion internet et réessayez.',
            action: {
                label: 'Réessayer',
                onClick: () => window.location.reload()
            }
        }),

    validationError: (message: string) => 
        toast.warning('Données invalides', {
            description: message,
        }),

    loading: (message: string) => 
        sonnerToast.loading(message, {
            duration: Infinity, // Will be dismissed manually
        }),

    promise: <T,>(
        promise: Promise<T>,
        {
            loading,
            success,
            error,
        }: {
            loading: string;
            success: (data: T) => string;
            error: (error: any) => string;
        }
    ) => sonnerToast.promise(promise, {
        loading,
        success,
        error,
    }),

    dismiss: (toastId?: string | number) => 
        sonnerToast.dismiss(toastId),

    dismissAll: () => 
        sonnerToast.dismiss(),
};