export type RetrievalDocument = {
  chunk_id: string;
  file_id: string;
  file_name: string | null;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
  embedding?: unknown;
};

export type RetrievalSearchResponse = {
  success: true;
  documents: RetrievalDocument[];
  latency_ms: number;
};

export type RetrievalSearchRequest = {
  query: string;
  fileIds: string[];
  topK: number;
  includeEmbeddings: boolean;
};
