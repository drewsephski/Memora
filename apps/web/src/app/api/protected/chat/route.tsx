import { type Message } from "ai";

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

  try {
    const response = await fetch(`${MEMORA_API_URL}/chat`, {
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

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText || "Failed to chat", {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("content-type") ?? "text/plain",
        },
      });
    }

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ??
          "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Chat proxy error:", error);

    return new Response(
      error instanceof Error ? error.message : "Failed to proxy chat request",
      {
        status: 500,
      },
    );
  }
}
