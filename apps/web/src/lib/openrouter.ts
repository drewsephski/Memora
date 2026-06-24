import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModelV1 } from "ai";
import { getOpenRouterApiKey, OPENROUTER_CHAT_MODEL } from "./ai-config";

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

let openrouter: ReturnType<typeof createOpenAI> | null = null;

function getOpenRouterClient() {
  if (!openrouter) {
    openrouter = createOpenAI({
      baseURL: OPENROUTER_BASE_URL,
      apiKey: getOpenRouterApiKey(),
    });
  }
  return openrouter;
}

export function getChatModel(model = OPENROUTER_CHAT_MODEL): LanguageModelV1 {
  return getOpenRouterClient()(model) as unknown as LanguageModelV1;
}
