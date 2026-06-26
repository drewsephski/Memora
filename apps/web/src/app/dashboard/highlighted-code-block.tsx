import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const CODE_TOKEN_STYLES = {
  endpoint: "text-emerald-500 dark:text-emerald-400",
  keyword: "text-violet-500 dark:text-violet-400",
  key: "text-sky-500 dark:text-sky-400",
  label: "text-amber-600 dark:text-amber-400",
  string: "text-rose-500 dark:text-rose-400",
  variable: "text-cyan-600 dark:text-cyan-300",
  number: "text-fuchsia-500 dark:text-fuchsia-300",
} as const;

const TOKEN_PATTERN =
  /("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`|\/[a-z][a-z0-9_/-]*|\b(?:POST|GET|const|let|await|fetch|throw|new|if|return|true|false|null|undefined|process|JSON|Authorization|Content-Type)\b|\b(?:query|file_ids|include_embeddings|contents|content|score|metadata|documents|chunk_id|file_id|file_name|latency_ms|success|headers|method|body|response|data|error|k|topK|apiKey)\b|\b(?:MEMORA_API_KEY|NEXT_PUBLIC_API_URL|process\.env\.[A-Z0-9_]+|fileId|upload\.file_id)\b|\b\d+(?:\.\d+)?\b)/g;

type HighlightedCodeBlockProps = {
  code: string;
  className?: string;
  preClassName?: string;
};

function getCodeTokenClass(token: string) {
  if (/^\d/.test(token)) {
    return CODE_TOKEN_STYLES.number;
  }

  if (token.startsWith('"') || token.startsWith("'") || token.startsWith("`")) {
    return CODE_TOKEN_STYLES.string;
  }

  if (token.startsWith("/")) {
    return CODE_TOKEN_STYLES.endpoint;
  }

  if (
    [
      "POST",
      "GET",
      "const",
      "let",
      "await",
      "fetch",
      "throw",
      "new",
      "if",
      "return",
      "true",
      "false",
      "null",
      "undefined",
      "process",
      "JSON",
    ].includes(token)
  ) {
    return CODE_TOKEN_STYLES.keyword;
  }

  if (["Authorization", "Content-Type"].includes(token)) {
    return CODE_TOKEN_STYLES.label;
  }

  if (
    [
      "MEMORA_API_KEY",
      "NEXT_PUBLIC_API_URL",
      "fileId",
      "upload.file_id",
    ].includes(token) ||
    token.startsWith("process.env.")
  ) {
    return CODE_TOKEN_STYLES.variable;
  }

  return CODE_TOKEN_STYLES.key;
}

function renderHighlightedCode(code: string) {
  return code.split("\n").map((line, lineIndex) => {
    const tokens: ReactNode[] = [];
    let cursor = 0;

    for (const match of line.matchAll(TOKEN_PATTERN)) {
      const token = match[0];
      const index = match.index ?? 0;

      if (index > cursor) {
        tokens.push(line.slice(cursor, index));
      }

      tokens.push(
        <span
          key={`${lineIndex}-${index}`}
          className={getCodeTokenClass(token)}
        >
          {token}
        </span>,
      );
      cursor = index + token.length;
    }

    if (cursor < line.length) {
      tokens.push(line.slice(cursor));
    }

    return (
      <span key={lineIndex} className="block">
        {tokens.length ? tokens : "\u00A0"}
      </span>
    );
  });
}

export function HighlightedCodeBlock({
  code,
  className,
  preClassName,
}: HighlightedCodeBlockProps) {
  return (
    <div
      className={cn("overflow-hidden rounded-md bg-background/80", className)}
    >
      <pre
        className={cn(
          "overflow-auto whitespace-pre-wrap p-3 font-mono text-[10px] leading-4 text-foreground sm:text-[11px]",
          preClassName,
        )}
      >
        {renderHighlightedCode(code)}
      </pre>
    </div>
  );
}
