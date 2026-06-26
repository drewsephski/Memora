import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { HighlightedCodeBlock } from "./highlighted-code-block";
import type { RetrievalDocument } from "./workbench-types";

type RetrievalResultCardProps = {
  document: RetrievalDocument;
  rank: number;
};

function formatMetadata(metadata: Record<string, unknown>) {
  return JSON.stringify(metadata, null, 2);
}

function getScoreLabel(score: number) {
  if (score >= 0.85) {
    return "Very strong match";
  }

  if (score >= 0.7) {
    return "Strong match";
  }

  if (score >= 0.5) {
    return "Possible match";
  }

  return "Loose match";
}

export function RetrievalResultCard({
  document,
  rank,
}: RetrievalResultCardProps) {
  const hasMetadata = Object.keys(document.metadata).length > 0;
  const scoreLabel = getScoreLabel(document.score);

  return (
    <article className="rounded-lg border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Match {rank}</Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="rounded-md bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Badge variant="outline" className="cursor-help">
                    {scoreLabel} · {document.score.toFixed(3)}
                  </Badge>
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-64 text-balance leading-5">
                This score estimates how closely the passage matches your
                question. Higher is better, but the text itself is still the
                best thing to judge.
              </TooltipContent>
            </Tooltip>
            {document.embedding !== undefined && (
              <Badge variant="outline">embedding included</Badge>
            )}
          </div>
          <h4 className="truncate text-sm font-semibold">
            {document.file_name ?? "Unknown file"}
          </h4>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-md bg-muted px-2 py-1">
              Match ID: <span className="font-mono">{document.chunk_id}</span>
            </span>
          </div>
        </div>
        <p
          className={cn(
            "shrink-0 rounded-md px-2 py-1 text-xs font-medium",
            document.file_id
              ? "bg-muted text-muted-foreground"
              : "bg-destructive/10 text-destructive",
          )}
        >
          {document.file_id ? "Document selected" : "Document missing"}
        </p>
      </div>

      <p className="mt-4 whitespace-pre-wrap rounded-md bg-muted/35 p-3 text-sm leading-6 text-foreground">
        {document.content}
      </p>

      <details className="mt-4 rounded-md bg-muted/60 p-3">
        <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
          Extra details
        </summary>
        {hasMetadata ? (
          <HighlightedCodeBlock
            code={formatMetadata(document.metadata)}
            className="mt-3"
            preClassName="max-h-64"
          />
        ) : (
          <div className="mt-3 rounded-md border border-dashed bg-background/60 p-3 text-xs leading-5 text-muted-foreground">
            No extra details were returned for this passage. That is normal when
            the API only sends the matched text and score. If a document was
            uploaded with fields like page number, speaker, timestamp, or
            section, those fields will appear here.
          </div>
        )}
      </details>
    </article>
  );
}
