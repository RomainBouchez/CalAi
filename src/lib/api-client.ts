import { ApiResponse, FoodAnalysis } from '@/types/food';
import { handleApiResponse, safeApiCall } from './error-handler';
import { AnalyzeImageRequestSchema, AnalyzeTextRequestSchema } from './schemas';

class ApiClient {
    private baseUrl: string;
    private cache = new Map<string, { data: any; timestamp: number }>();
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    constructor(baseUrl: string = '/api') {
        this.baseUrl = baseUrl;
    }

    private getCacheKey(url: string, params?: any): string {
        return `${url}_${JSON.stringify(params)}`;
    }

    private getCachedData<T>(cacheKey: string): T | null {
        const cached = this.cache.get(cacheKey);
        if (!cached) return null;

        const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
        if (isExpired) {
            this.cache.delete(cacheKey);
            return null;
        }

        return cached.data as T;
    }

    private setCachedData(cacheKey: string, data: any): void {
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
    }

    private async makeRequest<T>(
        url: string,
        options: RequestInit,
        cacheKey?: string,
        useCache = true
    ): Promise<T> {
        // Check cache first
        if (useCache && cacheKey) {
            const cachedData = this.getCachedData<T>(cacheKey);
            if (cachedData) {
                return cachedData;
            }
        }

        const response = await fetch(`${this.baseUrl}${url}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        const data = await handleApiResponse<T>(response);

        // Cache successful responses
        if (useCache && cacheKey && response.ok) {
            this.setCachedData(cacheKey, data);
        }

        return data;
    }

    // Optimize image before sending
    private async optimizeImage(file: File): Promise<{ data: string; mimeType: string; size: number }> {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions (max 1024px on longest side)
                const maxSize = 1024;
                let { width, height } = img;

                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }

                // Set canvas size
                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx?.drawImage(img, 0, 0, width, height);
                
                // Convert to JPEG with 0.8 quality for better compression
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                const base64Data = dataUrl.split(',')[1];
                
                resolve({
                    data: base64Data,
                    mimeType: 'image/jpeg',
                    size: base64Data.length
                });
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }

    async analyzeImage(file: File): Promise<{ data?: FoodAnalysis; error?: string }> {
        return safeApiCall(async () => {
            // Optimize image first
            const { data, mimeType } = await this.optimizeImage(file);
            
            const requestData = {
                image: {
                    inlineData: {
                        data,
                        mimeType
                    }
                }
            };

            // Validate request
            AnalyzeImageRequestSchema.parse(requestData);

            const response = await this.makeRequest<ApiResponse>(
                '/analyze',
                {
                    method: 'POST',
                    body: JSON.stringify(requestData),
                },
                undefined, // Don't cache image analysis
                false
            );

            if (response.success && response.data) {
                return this.convertApiResponseToFoodAnalysis(response);
            }

            throw new Error('Failed to analyze image');
        }, 'image analysis');
    }

    async analyzeText(text: string): Promise<{ data?: FoodAnalysis; error?: string }> {
        return safeApiCall(async () => {
            const requestData = { text: text.trim() };
            
            // Validate request
            AnalyzeTextRequestSchema.parse(requestData);

            // Create cache key for text analysis
            const cacheKey = this.getCacheKey('/analyze-text', requestData);

            const response = await this.makeRequest<ApiResponse>(
                '/analyze-text',
                {
                    method: 'POST',
                    body: JSON.stringify(requestData),
                },
                cacheKey,
                true // Use cache for text analysis
            );

            if (response.success && response.data) {
                return this.convertApiResponseToFoodAnalysis(response);
            }

            throw new Error('Failed to analyze text');
        }, 'text analysis');
    }

    private convertApiResponseToFoodAnalysis(response: ApiResponse): FoodAnalysis {
        const { foodAnalysis } = response.data;
        
        return {
            food_name: foodAnalysis.identifiedFood,
            estimated_weight_grams: parseFloat(foodAnalysis.portionSize) || 100,
            calories: parseFloat(foodAnalysis.nutritionFactsPerPortion.calories) || 0,
            protein: parseFloat(foodAnalysis.nutritionFactsPerPortion.protein) || 0,
            carbs: parseFloat(foodAnalysis.nutritionFactsPerPortion.carbs) || 0,
            fats: parseFloat(foodAnalysis.nutritionFactsPerPortion.fat) || 0,
            fiber: foodAnalysis.nutritionFactsPerPortion.fiber ? 
                parseFloat(foodAnalysis.nutritionFactsPerPortion.fiber) : undefined,
            sugar: foodAnalysis.nutritionFactsPerPortion.sugar ? 
                parseFloat(foodAnalysis.nutritionFactsPerPortion.sugar) : undefined,
            sodium: foodAnalysis.nutritionFactsPerPortion.sodium ? 
                parseFloat(foodAnalysis.nutritionFactsPerPortion.sodium) : undefined,
            cholesterol: foodAnalysis.nutritionFactsPerPortion.cholesterol ? 
                parseFloat(foodAnalysis.nutritionFactsPerPortion.cholesterol) : undefined,
            vitamins: foodAnalysis.additionalNotes || []
        };
    }

    // Clear cache method
    clearCache(): void {
        this.cache.clear();
    }

    // Get cache statistics
    getCacheStats() {
        const entries = Array.from(this.cache.entries());
        const validEntries = entries.filter(([_, { timestamp }]) => 
            Date.now() - timestamp <= this.CACHE_TTL
        );

        return {
            totalEntries: this.cache.size,
            validEntries: validEntries.length,
            expiredEntries: this.cache.size - validEntries.length
        };
    }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or custom instances
export { ApiClient };