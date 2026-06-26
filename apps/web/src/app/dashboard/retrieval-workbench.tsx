"use client";

import type { Tables } from "@/types/supabase";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CodeSnippetPanel } from "./code-snippet-panel";
import { RetrievalResultCard } from "./retrieval-result-card";
import type {
  RetrievalSearchRequest,
  RetrievalSearchResponse,
} from "./workbench-types";

type RetrievalWorkbenchProps = {
  uploadedFiles: Tables<"files">[] | null;
  apiKey: string;
};

type SearchableFile = Tables<"files"> & {
  file_id: string;
};

function isSearchableFile(file: Tables<"files">): file is SearchableFile {
  return Boolean(file.file_id);
}

function createVisibleResponse(
  response: RetrievalSearchResponse | null,
  documents: RetrievalSearchResponse["documents"],
) {
  if (!response) {
    return null;
  }

  return {
    ...response,
    documents,
  };
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getSearchErrorMessage(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string" &&
    payload.error.trim()
  ) {
    return payload.error;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string" &&
    payload.message.trim()
  ) {
    return payload.message;
  }

  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  return "Search failed. Please try again.";
}

export function RetrievalWorkbench({
  uploadedFiles,
  apiKey,
}: RetrievalWorkbenchProps) {
  const files = useMemo(
    () => (uploadedFiles ?? []).filter(isSearchableFile),
    [uploadedFiles],
  );
  const [query, setQuery] = useState("");
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [topK, setTopK] = useState(5);
  const [threshold, setThreshold] = useState(0);
  const [includeEmbeddings, setIncludeEmbeddings] = useState(false);
  const [searchResponse, setSearchResponse] =
    useState<RetrievalSearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const availableFileIds = new Set(files.map((file) => file.file_id));

    setSelectedFileIds((current) => {
      const stillAvailable = current.filter((fileId) =>
        availableFileIds.has(fileId),
      );

      if (stillAvailable.length > 0 || files.length === 0) {
        return stillAvailable;
      }

      return [files[0].file_id];
    });
  }, [files]);

  useEffect(() => {
    const handleFileDeleted = (event: CustomEvent<{ fileId: string }>) => {
      setSelectedFileIds((current) =>
        current.filter((fileId) => fileId !== event.detail.fileId),
      );
      setSearchResponse(null);
    };

    window.addEventListener("fileDeleted", handleFileDeleted as EventListener);
    return () => {
      window.removeEventListener(
        "fileDeleted",
        handleFileDeleted as EventListener,
      );
    };
  }, []);

  const requestPayload: RetrievalSearchRequest = useMemo(
    () => ({
      query: query.trim(),
      fileIds: selectedFileIds,
      topK,
      includeEmbeddings,
    }),
    [includeEmbeddings, query, selectedFileIds, topK],
  );
  const protectedRequestBody = useMemo(
    () => ({
      ...requestPayload,
      apiKey,
    }),
    [apiKey, requestPayload],
  );
  const rawApiRequestBody = useMemo(
    () => ({
      query: requestPayload.query,
      file_ids: requestPayload.fileIds,
      k: requestPayload.topK,
      include_embeddings: requestPayload.includeEmbeddings,
    }),
    [requestPayload],
  );

  const visibleDocuments = useMemo(
    () =>
      searchResponse?.documents.filter(
        (document) => document.score >= threshold,
      ) ?? [],
    [searchResponse, threshold],
  );
  const requestJson = JSON.stringify(rawApiRequestBody, null, 2);
  const responseJson = JSON.stringify(
    createVisibleResponse(searchResponse, visibleDocuments),
    null,
    2,
  );

  const toggleFile = (fileId: string, checked: boolean) => {
    setSelectedFileIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, fileId]));
      }

      return current.filter((selectedFileId) => selectedFileId !== fileId);
    });
  };

  const runSearch = async () => {
    if (!requestPayload.query) {
      toast.error("Enter a query first");
      return;
    }

    if (requestPayload.fileIds.length === 0) {
      toast.error("Select at least one file");
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch("/api/protected/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(protectedRequestBody),
      });

      const payload = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(getSearchErrorMessage(payload));
      }

      if (
        !payload ||
        typeof payload !== "object" ||
        !("success" in payload) ||
        payload.success !== true ||
        !("documents" in payload) ||
        !Array.isArray(payload.documents)
      ) {
        throw new Error("Search returned an invalid response.");
      }

      setSearchResponse(payload as RetrievalSearchResponse);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.trim()
          ? error.message
          : "Search failed. Please try again.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4 rounded-lg border bg-background p-4">
          <div className="space-y-2">
            <Label htmlFor="retrieval-query">Query</Label>
            <Textarea
              id="retrieval-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask a retrieval question..."
              className="min-h-24 resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Files</Label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setSelectedFileIds(files.map((file) => file.file_id))
                  }
                  disabled={files.length === 0}
                >
                  All
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedFileIds([])}
                  disabled={selectedFileIds.length === 0}
                >
                  Clear
                </Button>
              </div>
            </div>
            <ScrollArea className="h-44 rounded-md border">
              <div className="space-y-2 p-3">
                {files.length > 0 ? (
                  files.map((file) => (
                    <label
                      key={file.id}
                      className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted"
                    >
                      <Checkbox
                        checked={selectedFileIds.includes(file.file_id)}
                        onCheckedChange={(checked) =>
                          toggleFile(file.file_id, checked === true)
                        }
                        aria-label={`Search ${file.file_name ?? file.file_id}`}
                      />
                      <span className="min-w-0 space-y-1">
                        <span className="block truncate text-sm font-medium">
                          {file.file_name ?? "Untitled document"}
                        </span>
                        <span className="block break-all font-mono text-xs text-muted-foreground">
                          {file.file_id}
                        </span>
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                    Upload a file to inspect retrieval.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="space-y-2">
              <Label htmlFor="top-k">Top K</Label>
              <Input
                id="top-k"
                type="number"
                min={1}
                max={20}
                value={topK}
                onChange={(event) =>
                  setTopK(Math.max(1, Number(event.target.value) || 1))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="score-threshold">Score threshold</Label>
              <Input
                id="score-threshold"
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={threshold}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setThreshold(Number.isFinite(value) ? value : 0);
                }}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-md border p-3">
            <Checkbox
              checked={includeEmbeddings}
              onCheckedChange={(checked) =>
                setIncludeEmbeddings(checked === true)
              }
              aria-label="Include embeddings"
            />
            <span className="text-sm font-medium">Include embeddings</span>
          </label>

          <Button
            type="button"
            className="w-full"
            onClick={runSearch}
            disabled={isSearching || files.length === 0}
          >
            {isSearching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            Search
          </Button>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{visibleDocuments.length} visible</Badge>
            {searchResponse && (
              <Badge variant="outline">{searchResponse.latency_ms}ms</Badge>
            )}
            <Badge variant="outline">{selectedFileIds.length} files</Badge>
          </div>

          <Tabs defaultValue="results" className="space-y-4">
            <TabsList className="flex w-full justify-start overflow-x-auto">
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="snippets">Snippets</TabsTrigger>
            </TabsList>
            <TabsContent value="results" className="space-y-3">
              {visibleDocuments.length > 0 ? (
                visibleDocuments.map((document, index) => (
                  <RetrievalResultCard
                    key={document.chunk_id}
                    document={document}
                    rank={index + 1}
                  />
                ))
              ) : (
                <div className="rounded-lg border border-dashed bg-background p-8 text-center text-sm text-muted-foreground">
                  {searchResponse
                    ? "No chunks match the current threshold."
                    : "Run a query to inspect retrieved chunks."}
                </div>
              )}
            </TabsContent>
            <TabsContent value="json">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border bg-background">
                  <div className="border-b px-3 py-2 text-sm font-medium">
                    Request
                  </div>
                  <pre className="max-h-[420px] overflow-auto p-3 text-xs leading-5">
                    {requestJson}
                  </pre>
                </div>
                <div className="rounded-lg border bg-background">
                  <div className="border-b px-3 py-2 text-sm font-medium">
                    Response
                  </div>
                  <pre className="max-h-[420px] overflow-auto p-3 text-xs leading-5">
                    {responseJson}
                  </pre>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="snippets">
              <CodeSnippetPanel request={requestPayload} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
