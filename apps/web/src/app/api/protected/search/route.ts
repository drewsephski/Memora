import { getMemoraApiUrl } from "@/lib/memora-env";

const MEMORA_API_URL = getMemoraApiUrl();

export async function POST(request: Request) {
  const {
    query,
    selectedFile,
    apiKey,
    includeEmbeddings = false,
  }: {
    query?: string;
    selectedFile?: string;
    apiKey?: string;
    includeEmbeddings?: boolean;
  } = await request.json();

  if (!query?.trim()) {
    return new Response("Query is required", { status: 400 });
  }

  if (!selectedFile) {
    return new Response("No file selected", { status: 400 });
  }

  if (!apiKey) {
    return new Response("API key is required", { status: 401 });
  }

  const searchResponse = await fetch(`${MEMORA_API_URL}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({
      query,
      file_ids: [selectedFile],
      include_embeddings: includeEmbeddings,
    }),
  });

  return new Response(searchResponse.body, {
    status: searchResponse.status,
    headers: {
      "Content-Type":
        searchResponse.headers.get("content-type") ??
        "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
