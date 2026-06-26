"use client";

import type { Tables } from "@/types/supabase";
import { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Code, MessageCircle, ArrowUpIcon, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useScrollToBottom } from "./use-scroll-to-bottom";

type SearchResult = {
  success: boolean;
  documents: {
    content: string;
  }[];
};

export function ChatInterface({
  uploadedFiles,
  apiKey,
}: {
  uploadedFiles: Tables<"files">[] | null;
  apiKey: string;
}) {
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [embeddingFromAPI, setEmbeddingFromAPI] = useState<
    SearchResult["documents"] | null
  >(null);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const { messages, setMessages, handleSubmit, input, setInput, isLoading } =
    useChat({
      api: "/api/protected/chat",
      body: {
        apiKey,
        selectedFile,
      },
      initialMessages: [],
      onError: (error) => {
        toast.error(`An error occurred: ${error.message}`);
      },
    });

  // Add event listener for file deletion
  useEffect(() => {
    const handleFileDeleted = (event: CustomEvent<{ fileId: string }>) => {
      if (event.detail.fileId === selectedFile) {
        setSelectedFile("");
        setMessages([]);
        setEmbeddingFromAPI(null);
      }
    };

    window.addEventListener("fileDeleted", handleFileDeleted as EventListener);
    return () => {
      window.removeEventListener(
        "fileDeleted",
        handleFileDeleted as EventListener
      );
    };
  }, [selectedFile, setMessages]);

  const fetchSearchResults = async (query: string) => {
    const response = await fetch("/api/protected/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        apiKey,
        selectedFile,
        includeEmbeddings: true,
      }),
    });

    if (!response.ok) {
      toast.error("Failed to search documents");
      return;
    }

    const data = (await response.json()) as SearchResult;
    setEmbeddingFromAPI(data.documents);
  };

  const handleFileSelect = (file: string) => {
    setSelectedFile(file);
    setMessages([]);
    setEmbeddingFromAPI(null);
  };

  const selectedFileName =
    uploadedFiles?.find((file) => file.file_id === selectedFile)?.file_name ??
    null;
  const embeddingPayload = embeddingFromAPI
    ? JSON.stringify(embeddingFromAPI, null, 2)
    : "";

  return (
    <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
      {(!uploadedFiles || uploadedFiles.length === 0) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
          <div className="grid h-full w-full grid-cols-1 gap-4 p-4 md:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] md:p-8">
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted p-4">
              <MessageCircle className="size-8 text-muted-foreground mb-2" />
              <p className="text-lg font-medium text-muted-foreground">
                Chat Interface
              </p>
              <p className="text-sm text-muted-foreground/80 text-center mt-1">
                Upload files to start chatting with them using AI
              </p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted p-4">
              <Code className="size-8 text-muted-foreground mb-2" />
              <p className="text-lg font-medium text-muted-foreground">
                Embedding Viewer
              </p>
              <p className="text-sm text-muted-foreground/80 text-center mt-1">
                See relevant document snippets as you chat
              </p>
            </div>
          </div>
        </div>
      )}
      <Card className="flex h-[640px] min-w-0 flex-col overflow-hidden bg-background shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <MessageCircle className="size-5 shrink-0" />
              Chat with your files
            </h2>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {selectedFileName
                ? selectedFileName
                : "Choose a file to start a scoped conversation."}
            </p>
          </div>
          <div className="shrink-0">
            <Select onValueChange={handleFileSelect} value={selectedFile}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder="Choose a file" />
              </SelectTrigger>
              <SelectContent>
                {uploadedFiles?.map((file) => (
                  <SelectItem key={file.id} value={file.file_id!}>
                    {file.file_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div
          className="h-full w-full flex-1 overflow-auto rounded-[inherit] p-4"
          ref={messagesContainerRef}
        >
          {!selectedFile && (
            <div className="text-center text-muted-foreground p-4">
              Please select a file to start chatting ↑
            </div>
          )}
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const query = input.trim();
            if (!query) {
              return;
            }

            await Promise.all([handleSubmit(), fetchSearchResults(query)]);
          }}
          className="p-4 border-t"
        >
          <div className="flex gap-2 items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your file..."
            />
            <Button
              type="submit"
              disabled={isLoading || !selectedFile || !input.trim()}
              className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <ArrowUpIcon size={14} />
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="flex h-[640px] min-w-0 flex-col overflow-hidden bg-background shadow-sm">
        <div className="border-b p-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Code className="size-4 shrink-0" />
            Embedding data from API
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Raw matches returned for the latest query.
          </p>
        </div>
        <div className="min-h-0 flex-1">
          <ScrollArea className="h-full" scrollHideDelay={0}>
            <div className="p-3">
              {embeddingFromAPI ? (
                <div className="rounded-lg bg-muted p-3 font-mono text-[10px] leading-4 text-muted-foreground">
                  <div className="overflow-x-auto">
                    <pre className="whitespace-pre">{embeddingPayload}</pre>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                  Response from Memora embeddings API will be shown here.
                </div>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
}
