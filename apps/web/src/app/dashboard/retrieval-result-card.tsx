import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RetrievalDocument } from "./workbench-types";

type RetrievalResultCardProps = {
  document: RetrievalDocument;
  rank: number;
};

function formatMetadata(metadata: Record<string, unknown>) {
  if (Object.keys(metadata).length === 0) {
    return "{}";
  }

  return JSON.stringify(metadata, null, 2);
}

export function RetrievalResultCard({
  document,
  rank,
}: RetrievalResultCardProps) {
  return (
    <article className="rounded-lg border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">#{rank}</Badge>
            <Badge variant="outline">score {document.score.toFixed(3)}</Badge>
            {document.embedding !== undefined && (
              <Badge variant="outline">embedding included</Badge>
            )}
          </div>
          <h4 className="truncate text-sm font-semibold">
            {document.file_name ?? "Unknown file"}
          </h4>
          <p className="break-all font-mono text-xs text-muted-foreground">
            {document.chunk_id}
          </p>
        </div>
        <p
          className={cn(
            "shrink-0 rounded-md px-2 py-1 text-xs font-medium",
            document.file_id
              ? "bg-muted text-muted-foreground"
              : "bg-destructive/10 text-destructive",
          )}
        >
          {document.file_id || "missing file_id"}
        </p>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground">
        {document.content}
      </p>

      <details className="mt-4 rounded-md bg-muted/60 p-3">
        <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
          Metadata
        </summary>
        <pre className="mt-3 overflow-x-auto whitespace-pre text-xs leading-5 text-muted-foreground">
          {formatMetadata(document.metadata)}
        </pre>
      </details>
    </article>
  );
}
