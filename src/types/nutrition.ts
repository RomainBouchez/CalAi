export interface NutritionalInfo {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portion: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  source?: 'web_search' | 'ai_generated';
  confidence?: number;
  url?: string;
  searchResult?: string;
}

export interface WebSearchResult {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  url: string;
  source: string;
  searchResult?: string;
}

export interface SearchResponse {
  success: boolean;
  data: NutritionalInfo[];
  source?: string;
  error?: string;
  details?: string;
  translation?: {
    original: string;
    translated: string;
  };
}

export interface GeminiResponse {
  foods: Omit<NutritionalInfo, 'source' | 'confidence'>[];
}
