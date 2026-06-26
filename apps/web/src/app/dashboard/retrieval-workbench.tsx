"use client";

import type { Tables } from "@/types/supabase";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { HelpCircle, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CodeSnippetPanel } from "./code-snippet-panel";
import { HighlightedCodeBlock } from "./highlighted-code-block";
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

function FieldLabel({
  children,
  htmlFor,
  tooltip,
}: {
  children: ReactNode;
  htmlFor?: string;
  tooltip: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>{children}</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`What does ${String(children)} mean?`}
          >
            <HelpCircle className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-64 text-balance leading-5">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </div>
  );
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
    <TooltipProvider delayDuration={150}>
      <div className="rounded-xl border bg-muted/30 p-4">
        <div className="mb-4 grid gap-3 rounded-lg border bg-background p-4 md:grid-cols-[minmax(0,1fr)_280px] md:items-center">
          <div>
            <h4 className="text-base font-semibold">Test what Memora finds</h4>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Ask a question, choose which documents to search, then inspect the
              passages Memora would send to an AI answer. Higher scores mean
              closer matches.
            </p>
          </div>
          <div className="rounded-md bg-muted/70 p-3 text-sm">
            <p className="font-medium">Reading the results</p>
            <p className="mt-1 text-muted-foreground">
              Start broad, then raise the minimum score if you only want the
              strongest matches.
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4 rounded-lg border bg-background p-4">
            <div className="space-y-2">
              <FieldLabel
                htmlFor="retrieval-query"
                tooltip="Write the question or phrase you want to match against your uploaded documents. Use natural language, the same way a customer or teammate would ask."
              >
                Search question
              </FieldLabel>
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
                <FieldLabel tooltip="Pick the documents Memora should look inside. Selecting fewer files keeps the search focused; selecting all files is useful for broad discovery.">
                  Documents
                </FieldLabel>
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
                <FieldLabel
                  htmlFor="top-k"
                  tooltip="This is how many possible matches Memora returns before filtering. A higher number gives you more context to review; a lower number keeps the results concise."
                >
                  Matches to review (Top K)
                </FieldLabel>
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
                <FieldLabel
                  htmlFor="score-threshold"
                  tooltip="This hides weaker matches from the page. Use 0 to show everything. Try 0.75 or higher when you only want passages that are very closely related."
                >
                  Minimum match score
                </FieldLabel>
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

            <div className="flex items-start gap-3 rounded-md border p-3">
              <Checkbox
                id="include-embeddings"
                checked={includeEmbeddings}
                onCheckedChange={(checked) =>
                  setIncludeEmbeddings(checked === true)
                }
                aria-label="Include embeddings"
              />
              <FieldLabel
                htmlFor="include-embeddings"
                tooltip="Embeddings are the numeric fingerprints used for search. Most people can leave this off; turn it on only when you are debugging or comparing API responses."
              >
                Include embeddings
              </FieldLabel>
            </div>

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
              Find matching passages
            </Button>
          </div>

          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded-md bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Badge variant="secondary" className="cursor-help">
                      {visibleDocuments.length} matches shown
                    </Badge>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-64 text-balance leading-5">
                  These are the passages that passed your minimum match score.
                </TooltipContent>
              </Tooltip>
              {searchResponse && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="rounded-md bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <Badge variant="outline" className="cursor-help">
                        {searchResponse.latency_ms}ms search time
                      </Badge>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-64 text-balance leading-5">
                    How long the search API took to respond. Lower is faster.
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded-md bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Badge variant="outline" className="cursor-help">
                      {selectedFileIds.length} documents selected
                    </Badge>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-64 text-balance leading-5">
                  The number of uploaded documents included in this search.
                </TooltipContent>
              </Tooltip>
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
                    <HighlightedCodeBlock
                      code={requestJson}
                      preClassName="max-h-[420px]"
                    />
                  </div>
                  <div className="rounded-lg border bg-background">
                    <div className="border-b px-3 py-2 text-sm font-medium">
                      Response
                    </div>
                    <HighlightedCodeBlock
                      code={responseJson}
                      preClassName="max-h-[420px]"
                    />
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
    </TooltipProvider>
  );
}
