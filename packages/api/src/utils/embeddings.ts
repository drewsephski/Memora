import { OpenAIEmbeddings } from "@langchain/openai";
import {
  getOpenRouterApiKey,
  OPENROUTER_BASE_URL,
  OPENROUTER_EMBEDDING_MODEL,
} from "./ai-config";

export function createEmbeddings() {
  return new OpenAIEmbeddings({
    model: OPENROUTER_EMBEDDING_MODEL,
    apiKey: getOpenRouterApiKey(),
    configuration: {
      baseURL: OPENROUTER_BASE_URL,
    },
  });
}
