import { Response } from "express";
import { z } from "zod";
import { client } from "../utils/posthog";
import { logApiUsageAsync } from "../utils/async-logger";
import { supabase } from "../utils/supabase";
import { createEmbeddings } from "../utils/embeddings";
import {
  getApiKeyFromRequest,
  type AuthenticatedRequest,
} from "../middleware/auth";

type MatchDocumentResult = {
  id: number;
  content: string;
  metadata: unknown;
  embedding: unknown;
  similarity: number;
};

type SearchFile = {
  file_id: string | null;
  file_name: string | null;
};

type ApiKeyData = {
  team_id: string;
  user_id: string | null;
  profiles?: {
    email?: string | null;
  } | null;
};

type SearchDocumentResponse = {
  chunk_id: string;
  file_id: string;
  file_name: string | null;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
  embedding?: unknown;
};

const searchSchema = z.object({
  query: z.string().min(1, "Query is required"),
  k: z.number().int().positive().default(3),
  include_embeddings: z.boolean().optional().default(false),
  file_ids: z
    .array(z.string().uuid())
    .min(1, "At least one file ID is required")
    .transform((fileIds) => Array.from(new Set(fileIds))),
});

type SearchRequest = z.infer<typeof searchSchema>;

async function validateRequest(req: AuthenticatedRequest): Promise<{
  success: boolean;
  data?: SearchRequest;
  apiKeyData?: ApiKeyData;
  files?: SearchFile[];
  error?: unknown;
  statusCode?: number;
}> {
  console.log("[SEARCH] Validating request");
  // Validate request body
  const validationResult = searchSchema.safeParse(req.body);
  if (!validationResult.success) {
    console.log(
      "[SEARCH] Request validation failed",
      validationResult.error.issues,
    );
    return {
      success: false,
      error: validationResult.error.issues,
      statusCode: 400,
    };
  }
  console.log("[SEARCH] Request body validated", {
    query: validationResult.data.query,
    k: validationResult.data.k,
    fileIds: validationResult.data.file_ids.length,
  });

  // Validate API key and get team ID
  const apiKey = getApiKeyFromRequest(req);
  console.log("[SEARCH] Verifying API key");
  const { data: apiKeyData, error: apiKeyError } = await supabase
    .from("api_keys")
    .select("team_id, user_id, profiles(email)")
    .match({ api_key: apiKey })
    .single();

  if (apiKeyError || !apiKeyData?.team_id) {
    console.log("[SEARCH] Invalid API key", { error: apiKeyError });
    return {
      success: false,
      error: "Invalid API key",
      statusCode: 401,
    };
  }
  console.log("[SEARCH] API key verified", { teamId: apiKeyData.team_id });

  // Verify file ownership
  console.log("[SEARCH] Verifying file ownership");
  const { data: files, error: filesError } = await supabase
    .from("files")
    .select("file_id, file_name")
    .in("file_id", validationResult.data.file_ids)
    .match({ team_id: apiKeyData.team_id })
    .is("deleted_at", null);

  if (filesError) {
    console.log("[SEARCH] Error verifying file ownership", {
      error: filesError,
    });
    throw new Error(`Failed to verify file ownership: ${filesError.message}`);
  }

  if (!files || files.length !== validationResult.data.file_ids.length) {
    console.log("[SEARCH] File ownership verification failed", {
      requestedFiles: validationResult.data.file_ids.length,
      foundFiles: files?.length || 0,
    });
    return {
      success: false,
      error: "One or more files do not belong to your team",
      statusCode: 403,
    };
  }
  console.log("[SEARCH] File ownership verified", {
    fileCount: files.length,
  });

  return {
    success: true,
    data: validationResult.data,
    apiKeyData,
    files,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function getMetadataFileId(metadata: Record<string, unknown>): string {
  return typeof metadata.file_id === "string" ? metadata.file_id : "";
}

export const search = async (req: AuthenticatedRequest, res: Response) => {
  console.log("[SEARCH] Request received");
  const startTime = Date.now();
  try {
    const validation = await validateRequest(req);
    if (!validation.success) {
      console.log("[SEARCH] Request validation failed", {
        statusCode: validation.statusCode,
        error: validation.error,
      });
      return res.status(validation.statusCode!).json({
        success: false,
        error: validation.error,
      });
    }

    const { query, k, file_ids, include_embeddings } = validation.data!;
    const apiKeyData = validation.apiKeyData!;
    const fileNameById = new Map(
      (validation.files ?? [])
        .filter((file): file is { file_id: string; file_name: string | null } =>
          Boolean(file.file_id),
        )
        .map((file) => [file.file_id, file.file_name]),
    );

    console.log("[SEARCH] Processing search request", {
      query,
      k,
      fileIdsCount: file_ids.length,
      include_embeddings,
    });

    console.log("[SEARCH] Performing similarity search");
    const embeddings = createEmbeddings();
    const embeddingArray = await embeddings.embedQuery(query);
    const queryEmbedding = `[${embeddingArray.join(",")}]`;

    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_count: k,
      filter: { file_id: { in: file_ids } },
    });

    if (error) {
      throw new Error(`Error in similarity search: ${error.message}`);
    }

    const rawResults = (data as MatchDocumentResult[]) || [];
    const documentsResponse: SearchDocumentResponse[] = rawResults.map(
      (result) => {
        const metadata = isRecord(result.metadata) ? result.metadata : {};
        const fileId =
          getMetadataFileId(metadata) ||
          (file_ids.length === 1 ? file_ids[0] : "");
        const document: SearchDocumentResponse = {
          chunk_id: String(result.id),
          file_id: fileId,
          file_name: fileNameById.get(fileId) ?? null,
          content: result.content,
          score: Number(result.similarity.toFixed(3)),
          metadata,
        };

        if (include_embeddings) {
          document.embedding = result.embedding;
        }

        return document;
      },
    );

    console.log("[SEARCH] Similarity search completed", {
      resultCount: documentsResponse.length,
    });

    console.log("[SEARCH] Capturing PostHog event");
    client.capture({
      distinctId: apiKeyData.profiles?.email ?? "",
      event: "/search API Call",
    });

    const response = {
      success: true,
      documents: documentsResponse,
      latency_ms: Date.now() - startTime,
    };

    console.log("[SEARCH] Logging API usage");
    logApiUsageAsync({
      endpoint: "/search",
      userId: apiKeyData.user_id || "",
      success: true,
    });

    console.log("[SEARCH] Sending successful response");
    return res.status(200).json(response);
  } catch (error) {
    console.error("[SEARCH] Error in search endpoint:", error);

    const apiKey = getApiKeyFromRequest(req);
    if (apiKey) {
      console.log("[SEARCH] Attempting to log error with user ID");
      const { data: apiKeyData } = await supabase
        .from("api_keys")
        .select("user_id")
        .match({ api_key: apiKey })
        .single();

      if (apiKeyData?.user_id) {
        logApiUsageAsync({
          endpoint: "/search",
          userId: apiKeyData.user_id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        console.log("[SEARCH] Error logged for user", {
          userId: apiKeyData.user_id,
        });
      }
    }

    console.log("[SEARCH] Sending error response");
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
