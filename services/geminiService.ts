import { GoogleGenAI, Type } from "@google/genai";
import { Keyword, KeywordDetails, TimeRange } from '../types';

const timeRangeTextMap: Record<TimeRange, string> = {
  '24hours': 'last 24 hours',
  'week': 'last week',
  'month': 'last month',
  '3months': 'last 3 months',
};

export const fetchTopKeywords = async (timeRange: TimeRange): Promise<Keyword[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const timeText = timeRangeTextMap[timeRange];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `List the top 12 book-related search keywords on Amazon in the ${timeText}. For each keyword, provide an estimated monthly search volume as a number, and the estimated monthly revenue potential as a string (e.g., '$5k - $10k').`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keywords: {
              type: Type.ARRAY,
              description: "A list of top book-related keywords.",
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: {
                    type: Type.STRING,
                    description: "The search keyword.",
                  },
                  volume: {
                    type: Type.NUMBER,
                    description: "Estimated monthly search volume.",
                  },
                  revenue: {
                    type: Type.STRING,
                    description: "Estimated monthly revenue potential.",
                  },
                },
                required: ["keyword", "volume", "revenue"],
              },
            },
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    
    if (data && Array.isArray(data.keywords)) {
        return data.keywords;
    } else {
        console.error("Unexpected response structure:", data);
        return [];
    }

  } catch (error) {
    console.error("Error fetching top keywords from Gemini API:", error);
    throw new Error("Failed to fetch keyword data from the Gemini API.");
  }
};


export const fetchKeywordDetails = async (keyword: string): Promise<KeywordDetails> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `For the book keyword "${keyword}" on Amazon, provide detailed insights for an author. The response should be a JSON object containing: 1. 'relatedKeywords': an array of objects, each with 'keyword' (string), 'volume' (number), and 'type' ('short' or 'long'). 2. 'profitableTopics': an array of strings with topic recommendations. 3. 'authorTips': an array of strings with other tips for authors researching this niche.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            relatedKeywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  volume: { type: Type.NUMBER },
                  type: { type: Type.STRING, enum: ['short', 'long'] },
                },
                required: ['keyword', 'volume', 'type'],
              },
            },
            profitableTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            authorTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['relatedKeywords', 'profitableTopics', 'authorTips'],
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error(`Error fetching details for keyword "${keyword}":`, error);
    throw new Error(`Failed to fetch detailed insights for "${keyword}".`);
  }
};