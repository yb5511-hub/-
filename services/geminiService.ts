import { GoogleGenAI, Chat } from "@google/genai";

let chatSession: Chat | null = null;

const API_KEY = process.env.API_KEY || '';

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const initializeChat = (userName: string): void => {
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are a user in a Discord server named "Gemi". 
      Current context: You are chatting in a public channel named #general.
      
      YOUR PERSONA:
      - You are a casual gamer/developer hanging out in Discord.
      - You are NOT an AI assistant. Never mention being an AI.
      - Use all lowercase mostly.
      - Use internet slang (lol, lmao, fr, ong, tbh).
      - Keep messages short and punchy. Like real chat messages.
      - If ${userName} says hello, just say "yo" or "sup".
      - Be chill and sometimes a bit sarcastic but friendly.
      - Do not write long paragraphs.
      
      INTERACTION:
      - You are talking to a user named ${userName}.
      - Respond directly to what they say.
      `,
      temperature: 1.1, // High creativity for "human-like" variance
    },
  });
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  try {
    const result = await chatSession.sendMessage({ message });
    return result.text || "lol what";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "my internet is dying brb";
  }
};