"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RetrievalSearchRequest } from "./workbench-types";

type CodeSnippetPanelProps = {
  request: RetrievalSearchRequest;
};

function escapeSingleQuotedJson(json: string) {
  return json.replace(/'/g, "'\"'\"'");
}

function SnippetBlock({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copySnippet = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copied`);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-lg border bg-background">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">{label}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Copy ${label}`}
          onClick={copySnippet}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
      </div>
      <pre className="max-h-[320px] overflow-auto p-3 text-xs leading-5">
        <code>{value}</code>
      </pre>
    </div>
  );
}

export function CodeSnippetPanel({ request }: CodeSnippetPanelProps) {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "https://api.memoralabs.dev";
  const rawApiRequest = useMemo(
    () => ({
      query: request.query || "How does this document answer my question?",
      file_ids: request.fileIds,
      k: request.topK,
      include_embeddings: request.includeEmbeddings,
    }),
    [request],
  );
  const requestJson = JSON.stringify(rawApiRequest, null, 2);
  const curlSnippet = `curl -X POST "${apiUrl}/search" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: $MEMORA_API_KEY" \\
  -d '${escapeSingleQuotedJson(requestJson)}'`;
  const typescriptSnippet = `const response = await fetch("${apiUrl}/search", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: process.env.MEMORA_API_KEY!,
  },
  body: JSON.stringify(${requestJson}),
});

if (!response.ok) {
  throw new Error(await response.text());
}

const data = await response.json();`;

  return (
    <Tabs defaultValue="curl" className="space-y-3">
      <TabsList>
        <TabsTrigger value="curl">curl</TabsTrigger>
        <TabsTrigger value="typescript">TypeScript</TabsTrigger>
      </TabsList>
      <TabsContent value="curl">
        <SnippetBlock label="curl snippet" value={curlSnippet} />
      </TabsContent>
      <TabsContent value="typescript">
        <SnippetBlock label="TypeScript snippet" value={typescriptSnippet} />
      </TabsContent>
    </Tabs>
  );
}
