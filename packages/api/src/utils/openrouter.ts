import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModelV1 } from "ai";
import { getOpenRouterApiKey, OPENROUTER_BASE_URL, OPENROUTER_CHAT_MODEL } from "./ai-config";

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
  return getOpenRouterClient()(model) as LanguageModelV1;
}
