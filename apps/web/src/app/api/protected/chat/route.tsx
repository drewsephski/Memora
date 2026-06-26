import type { Message } from "ai";

import { getMostRecentUserMessage } from "@/lib/utils";
import { getMemoraApiUrl } from "@/lib/memora-env";

const MEMORA_API_URL = getMemoraApiUrl();

export async function POST(request: Request) {
  const {
    messages,
    selectedFile,
    apiKey,
  }: {
    messages: Array<Message>;
    selectedFile: string;
    apiKey: string;
  } = await request.json();

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  if (!selectedFile) {
    return new Response("No file selected", { status: 400 });
  }

  const chatResponse = await fetch(`${MEMORA_API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({
      query: userMessage.content,
      file_ids: [selectedFile],
      stream: true,
    }),
  });

  if (!chatResponse.ok) {
    const errorText = await chatResponse.text();
    console.error("Chat API error:", errorText);
    return new Response(errorText || "Failed to chat with documents", {
      status: chatResponse.status,
    });
  }

  if (!chatResponse.body) {
    return new Response("Chat API returned an empty response", { status: 502 });
  }

  return new Response(chatResponse.body, {
    status: chatResponse.status,
    headers: {
      "Content-Type":
        chatResponse.headers.get("content-type") ??
        "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
