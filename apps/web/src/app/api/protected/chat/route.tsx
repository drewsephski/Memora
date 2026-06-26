import { type Message, createDataStreamResponse, streamText } from "ai";

import { getMostRecentUserMessage } from "@/lib/utils";
import { getChatModel } from "@/lib/openrouter";
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

  const searchResponse = await fetch(`${MEMORA_API_URL}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({
      query: userMessage.content,
      file_ids: [selectedFile],
    }),
  });

  if (!searchResponse.ok) {
    const errorText = await searchResponse.text();
    console.error("Search API error:", errorText);
    return new Response(errorText || "Failed to search documents", {
      status: searchResponse.status,
    });
  }

  const searchResults = (await searchResponse.json()) as {
    documents: { content: string }[];
  };

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: getChatModel(),
        system:
          "You are a helpful assistant that can answer questions and help with tasks.\n\nRelevant context from the document:\n" +
          searchResults.documents
            .map((doc) => doc.content)
            .join("\n"),
        messages,
      });

      result.consumeStream();

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    onError: () => {
      return "An error occurred while generating the response.";
    },
  });
}
