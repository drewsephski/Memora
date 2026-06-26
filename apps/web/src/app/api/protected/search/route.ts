import { getMemoraApiUrl } from "@/lib/memora-env";

const MEMORA_API_URL = getMemoraApiUrl();

type RawSearchDocument = {
  id?: unknown;
  chunk_id?: unknown;
  file_id?: unknown;
  file_name?: unknown;
  content?: unknown;
  score?: unknown;
  similarity?: unknown;
  metadata?: unknown;
  embedding?: unknown;
};

type RawSearchResponse = {
  success?: unknown;
  documents?: unknown;
  latency_ms?: unknown;
  error?: unknown;
  message?: unknown;
};

function jsonResponse(body: unknown, status: number) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function getErrorMessage(payload: RawSearchResponse | null, fallback: string) {
  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  return fallback;
}

function parseJsonPayload(text: string): RawSearchResponse | null {
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as RawSearchResponse;
  } catch {
    return null;
  }
}

function normalizeTopK(value: unknown) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 3;
  }

  return Math.min(Math.max(Math.trunc(parsed), 1), 20);
}

function normalizeDocument(
  document: RawSearchDocument,
  index: number,
  fallbackFileId: string,
) {
  const metadata =
    document.metadata &&
    typeof document.metadata === "object" &&
    !Array.isArray(document.metadata)
      ? document.metadata
      : {};
  const score = Number(document.score ?? document.similarity ?? 0);
  const normalized = {
    chunk_id: String(document.chunk_id ?? document.id ?? index + 1),
    file_id: String(document.file_id ?? fallbackFileId),
    file_name:
      typeof document.file_name === "string" ? document.file_name : null,
    content: typeof document.content === "string" ? document.content : "",
    score: Number.isFinite(score) ? score : 0,
    metadata,
  };

  if (document.embedding !== undefined) {
    return {
      ...normalized,
      embedding: document.embedding,
    };
  }

  return normalized;
}

export async function POST(request: Request) {
  let body: {
    query?: string;
    selectedFile?: string;
    fileIds?: string[];
    topK?: unknown;
    apiKey?: string;
    includeEmbeddings?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { success: false, error: "Invalid JSON request body" },
      400,
    );
  }

  const {
    query,
    selectedFile,
    fileIds,
    topK = 3,
    apiKey,
    includeEmbeddings = false,
  } = body;

  if (!query?.trim()) {
    return jsonResponse({ success: false, error: "Query is required" }, 400);
  }

  const selectedFileIds = Array.from(
    new Set(
      (Array.isArray(fileIds) && fileIds.length > 0
        ? fileIds
        : selectedFile
          ? [selectedFile]
          : []
      ).filter(Boolean),
    ),
  );

  if (selectedFileIds.length === 0) {
    return jsonResponse({ success: false, error: "No file selected" }, 400);
  }

  if (!apiKey) {
    return jsonResponse({ success: false, error: "API key is required" }, 401);
  }

  let searchResponse: Response;

  try {
    searchResponse = await fetch(`${MEMORA_API_URL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({
        query: query.trim(),
        k: normalizeTopK(topK),
        file_ids: selectedFileIds,
        include_embeddings: includeEmbeddings,
      }),
    });
  } catch (error) {
    console.error("Search proxy request failed:", error);
    return jsonResponse(
      { success: false, error: "Unable to reach the Memora search API" },
      502,
    );
  }

  const responseText = await searchResponse.text();
  const responsePayload = parseJsonPayload(responseText);

  if (!searchResponse.ok) {
    return jsonResponse(
      {
        success: false,
        error: getErrorMessage(
          responsePayload,
          `Search failed with status ${searchResponse.status}`,
        ),
      },
      searchResponse.status,
    );
  }

  if (!responsePayload) {
    return jsonResponse(
      { success: false, error: "Search API returned an empty response" },
      502,
    );
  }

  if (responsePayload.success !== true) {
    return jsonResponse(
      {
        success: false,
        error: getErrorMessage(responsePayload, "Search request failed"),
      },
      502,
    );
  }

  if (!Array.isArray(responsePayload.documents)) {
    return jsonResponse(
      { success: false, error: "Search API returned an invalid response" },
      502,
    );
  }

  const fallbackFileId =
    selectedFileIds.length === 1 ? (selectedFileIds[0] ?? "") : "";

  return jsonResponse(
    {
      success: true,
      documents: responsePayload.documents.map((document, index) =>
        normalizeDocument(document as RawSearchDocument, index, fallbackFileId),
      ),
      latency_ms:
        typeof responsePayload.latency_ms === "number"
          ? responsePayload.latency_ms
          : 0,
    },
    200,
  );
}
