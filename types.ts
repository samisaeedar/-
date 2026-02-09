
export interface Note {
  id: string;
  content: string;
  ai_title: string;
  ai_category: string;
  created_at: string;
}

export interface GeminiResponse {
  title: string;
  category: string;
}

export interface AppStats {
  total: number;
  categories: { [key: string]: number };
}
