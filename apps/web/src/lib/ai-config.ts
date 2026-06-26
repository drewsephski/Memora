export const OPENROUTER_CHAT_MODEL =
  process.env.OPENROUTER_CHAT_MODEL ?? "google/gemini-2.5-flash-lite";

export function getOpenRouterApiKey(): string {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing required environment variable: OPENROUTER_API_KEY");
  }
  return apiKey;
}
