export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export const OPENROUTER_EMBEDDING_MODEL =
  process.env.OPENROUTER_EMBEDDING_MODEL ?? "openai/text-embedding-3-small";

export const OPENROUTER_CHAT_MODEL =
  process.env.OPENROUTER_CHAT_MODEL ?? "google/gemini-2.5-flash-lite";

export function getOpenRouterApiKey(): string {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing required environment variable: OPENROUTER_API_KEY");
  }
  return apiKey;
}
