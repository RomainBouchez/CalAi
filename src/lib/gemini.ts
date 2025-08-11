import { GoogleGenerativeAI } from "@google/generative-ai";

// Access the environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not defined in environment variables");
}

// Initialize the API client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY as string);

interface FoodAnalysisResponse {
    food_name: string;
    estimated_weight_grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    vitamins?: string[];
}

export const analyzeFoodImage = async (imageBuffer: Buffer, mimeType: string): Promise<FoodAnalysisResponse> => {
    try {
        // Use the gemini-pro-vision model for image analysis
        const model = genAI.getGenerativeModel({
            model: "gemini-pro-vision",
            generationConfig: {
                temperature: 0.4,
            }
        });

        const prompt = `Analyse cette image de nourriture et retourne un JSON avec :
    - food_name (string)
    - estimated_weight_grams (number)
    - calories (number)
    - protein (number)
    - carbs (number)
    - fats (number)
    - vitamins (string[])
    Format de réponse : {"food_name": "...", ...}`;

        const imageData = {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType
            }
        };

        console.log("Sending request to Gemini API...");
        const result = await model.generateContent([prompt, imageData]);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(text) as FoodAnalysisResponse;
        } catch {
            console.error("Failed to parse JSON response:", text);
            throw new Error("Failed to parse response from Gemini API");
        }
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to analyze food image");
    }
};