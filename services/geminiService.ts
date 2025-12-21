
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Slide, Presentation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generatePresentationContent(topic: string): Promise<Presentation> {
  const prompt = `Create a professional 8-slide presentation structure about "${topic}" (Intangible Cultural Heritage). 
  Return a JSON object matching the following structure.
  Each slide should have a clear title, bullet points (content), and a suggested layout ('split', 'centered', or 'full-image').
  Focus on history, significance, specific examples, and conservation efforts.
  Output in Chinese (Simplified).`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          theme: { type: Type.STRING },
          slides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                content: { type: Type.ARRAY, items: { type: Type.STRING } },
                layout: { type: Type.STRING, enum: ['split', 'centered', 'full-image'] },
              },
              required: ['id', 'title', 'content', 'layout']
            }
          }
        },
        required: ['topic', 'theme', 'slides']
      },
    },
  });

  const rawJson = response.text || '{}';
  const data = JSON.parse(rawJson);
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    topic: data.topic,
    theme: 'classical',
    slides: data.slides
  };
}

export async function generateSlideImage(slideTitle: string, topic: string): Promise<string | undefined> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A beautiful, high-quality, professional photography style artistic illustration representing ${slideTitle} in the context of ${topic} (Chinese Intangible Cultural Heritage). Elegant lighting, detailed textures, cultural essence.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image generation failed:", error);
  }
  return undefined;
}
