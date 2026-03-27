import { GoogleGenAI } from "@google/genai";

export const GISTMATA_GEMINI_MODEL = "gemini-2.5-flash";

let cachedClient: GoogleGenAI | null = null;

export class GeminiConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiConfigurationError";
  }
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new GeminiConfigurationError(
      "GEMINI_API_KEY is missing on the server. AI hints stay off until it is configured.",
    );
  }

  cachedClient ??= new GoogleGenAI({ apiKey });
  return cachedClient;
}
