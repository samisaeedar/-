
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse } from "./types";

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const enhanceNote = async (content: string, lang: 'ar' | 'en'): Promise<GeminiResponse> => {
  try {
    const ai = getAiClient();
    
    const prompt = lang === 'ar' 
      ? `حلل هذه الملاحظة باللغة العربية: "${content}". اعطني عنواناً مختصراً (كلمتين) وتصنيفاً.`
      : `Analyze this note in English: "${content}". Give me a short title (2 words) and a category.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        role: "user",
        parts: [{ text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
          },
          required: ["title", "category"],
        },
      },
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) throw new Error("Empty response");

    return JSON.parse(jsonStr) as GeminiResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    return lang === 'ar' 
      ? { title: "ملاحظة جديدة", category: "عام" }
      : { title: "New Note", category: "General" };
  }
};
