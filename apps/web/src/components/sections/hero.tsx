"use client";

import { AuroraText } from "@/components/aurora-text";
import { Icons } from "@/components/icons";
import { Section } from "@/components/section";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, Copy, Sparkles } from "lucide-react";
import { AuthCtaLink } from "@/components/auth-cta-link";
import { lazy, type ReactNode, Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

const ease = [0.16, 1, 0.3, 1];
const MEMORA_API_EXAMPLE_URL = "https://memora-api-drew.fly.dev";
const HERO_COMMAND = `const API = "${MEMORA_API_EXAMPLE_URL}";

// 1. Add knowledge
const upload = await fetch(\`\${API}/upload_text\`, {
  method: "POST",
  headers: {
    Authorization: process.env.MEMORA_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "company-notes",
    contents: "Our refund policy is 30 days.",
  }),
}).then((res) => res.json());

// 2. Ask a question
const reply = await fetch(\`\${API}/chat\`, {
  method: "POST",
  headers: {
    Authorization: process.env.MEMORA_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    query: "What is our refund policy?",
    file_ids: [upload.file_id],
  }),
}).then((res) => res.json());

console.log(reply.answer);`;

const AGENT_PROMPT = `Add Memora to my app with a simple "Add knowledge" and "Ask questions" flow.

Use ${MEMORA_API_EXAMPLE_URL}.

API contract:
- POST /upload_text stores text and returns file_id.
- POST /chat answers questions with file_ids: [file_id].

Build two helpers: uploadKnowledge(text) and askQuestion(fileId, question).
Store the API key in MEMORA_API_KEY and show users only the final answer.`;

const HERO_TABS = [
  {
    value: "add",
    label: "Add knowledge",
    code: `POST /upload_text

{
  "contents": "Our refund policy is 30 days."
}

returns: file_id`,
  },
  {
    value: "keep",
    label: "Keep file_id",
    code: `const fileId = upload.file_id;

Save it with the customer,
project, ticket, or document.`,
  },
  {
    value: "ask",
    label: "Ask questions",
    code: `POST /chat

{
  "query": "What is our refund policy?",
  "file_ids": [fileId]
}

answer: Our refund policy is 30 days.`,
  },
] as const;

type HeroTabValue = (typeof HERO_TABS)[number]["value"];

const CODE_TOKEN_STYLES = {
  endpoint: "text-emerald-500 dark:text-emerald-400",
  keyword: "text-violet-500 dark:text-violet-400",
  key: "text-sky-500 dark:text-sky-400",
  label: "text-amber-600 dark:text-amber-400",
  string: "text-rose-500 dark:text-rose-400",
  variable: "text-cyan-600 dark:text-cyan-300",
} as const;

function getCodeTokenClass(token: string) {
  if (token.startsWith('"')) {
    return CODE_TOKEN_STYLES.string;
  }

  if (token.startsWith("/")) {
    return CODE_TOKEN_STYLES.endpoint;
  }

  if (["POST", "const"].includes(token)) {
    return CODE_TOKEN_STYLES.keyword;
  }

  if (["returns", "answer"].includes(token)) {
    return CODE_TOKEN_STYLES.label;
  }

  if (["contents", "query", "file_ids"].includes(token)) {
    return CODE_TOKEN_STYLES.key;
  }

  if (["fileId", "upload.file_id"].includes(token)) {
    return CODE_TOKEN_STYLES.variable;
  }

  return undefined;
}

function renderHighlightedCode(code: string) {
  const tokenPattern =
    /("([^"\\]|\\.)*"|\/[a-z_]+|\bPOST\b|\bconst\b|\breturns\b|\banswer\b|\bcontents\b|\bquery\b|\bfile_ids\b|\bfileId\b|\bupload\.file_id\b)/g;

  return code.split("\n").map((line, lineIndex) => {
    const tokens: ReactNode[] = [];
    let cursor = 0;

    for (const match of line.matchAll(tokenPattern)) {
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

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall back below for browser contexts that expose but block Clipboard API.
    }
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const copied = document.execCommand("copy");
    if (!copied) {
      throw new Error("Copy command failed");
    }
  } finally {
    document.body.removeChild(textArea);
  }
}

function HeroTitles() {
  return (
    <div className="flex w-full max-w-4xl flex-col overflow-hidden pt-8">
      <motion.h1
        className="text-left text-4xl font-semibold leading-tight text-foreground sm:text-5xl md:text-6xl tracking-tighter"
        initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
        animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          ease,
          staggerChildren: 0.2,
        }}
      >
        <motion.span
          className="inline-block text-balance"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            ease,
          }}
        >
          <AuroraText className="leading-tight">
            {siteConfig.hero.title}
          </AuroraText>
        </motion.span>
      </motion.h1>
      <motion.p
        className="text-left max-w-2xl leading-relaxed text-muted-foreground sm:text-lg sm:leading-relaxed text-balance"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.6,
          duration: 0.8,
          ease,
        }}
      >
        {siteConfig.hero.description}
      </motion.p>
    </div>
  );
}

function HeroCTA() {
  const [promptOpen, setPromptOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<HeroTabValue>("add");
  const [copiedItem, setCopiedItem] = useState<"snippet" | "prompt" | null>(
    null,
  );
  const activeTabIndex = Math.max(
    HERO_TABS.findIndex((tab) => tab.value === activeTab),
    0,
  );

  const handleCopy = async (text: string, item: "snippet" | "prompt") => {
    try {
      await copyTextToClipboard(text);
      setCopiedItem(item);
      toast.success(item === "prompt" ? "Agent prompt copied" : "Code copied");
    } catch {
      toast.error(
        item === "prompt"
          ? "Could not copy the prompt"
          : "Could not copy the code",
      );
    }
  };

  const handleTabChange = (value: string) => {
    const nextTab = value as HeroTabValue;
    const nextIndex = HERO_TABS.findIndex((tab) => tab.value === nextTab);

    if (nextIndex !== -1) {
      setActiveTab(nextTab);
    }
  };

  return (
    <div className="relative mt-6">
      <motion.div
        className="flex w-full max-w-2xl flex-col items-start justify-start gap-4 sm:flex-row sm:items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease }}
      >
        <AuthCtaLink
          className={cn(
            buttonVariants({ variant: "default" }),
            "w-full sm:w-auto text-background flex gap-2 rounded-lg",
          )}
        >
          <Icons.logo className="h-6 w-6" />
          {siteConfig.hero.cta}
        </AuthCtaLink>
      </motion.div>

      {/* Code snippet */}
      <motion.div
        className="mt-6 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8, ease }}
      >
        <div className="rounded-lg border bg-muted/50 p-3">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-foreground">
                Give your app memory
              </div>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                Upload text once. Use its ID when you ask.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-2 rounded-md px-2"
                onClick={() => handleCopy(HERO_COMMAND, "snippet")}
              >
                {copiedItem === "snippet" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {copiedItem === "snippet" ? "Copied" : "Copy code"}
                </span>
              </Button>
              <Dialog
                open={promptOpen}
                onOpenChange={(open) => {
                  setPromptOpen(open);
                  if (!open) {
                    setCopiedItem(null);
                  }
                }}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2 rounded-md px-2"
                  onClick={() => setPromptOpen(true)}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="sr-only">Agent prompt</span>
                </Button>

                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Copy an agent prompt</DialogTitle>
                    <DialogDescription>
                      Paste this into ChatGPT, Claude, or any AI assistant to
                      get a simple, guided first setup.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="rounded-lg border bg-muted/40 p-4">
                    <pre className="whitespace-pre-wrap font-mono text-xs leading-5 text-foreground">
                      {AGENT_PROMPT}
                    </pre>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={() => handleCopy(AGENT_PROMPT, "prompt")}
                      className="w-full gap-2 sm:w-auto"
                    >
                      {copiedItem === "prompt" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copiedItem === "prompt" ? "Copied" : "Copy prompt"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="relative grid h-auto w-full grid-cols-3 overflow-hidden p-1">
              <motion.span
                className="absolute bottom-1 left-1 top-1 rounded-md bg-background shadow"
                animate={{ x: `${activeTabIndex * 100}%` }}
                transition={{
                  type: "spring",
                  stiffness: 360,
                  damping: 36,
                  mass: 0.8,
                }}
                style={{ width: "calc((100% - 0.5rem) / 3)" }}
              />
              {HERO_TABS.map((tab, index) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative z-10 h-9 gap-1 whitespace-normal bg-transparent px-1 text-[10px] leading-tight shadow-none transition-colors data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none sm:gap-1.5 sm:text-xs"
                >
                  <span className="text-foreground">{index + 1}</span>
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="mt-3 overflow-hidden rounded-md bg-background/80">
              <motion.div
                className="flex"
                animate={{ x: `-${activeTabIndex * 100}%` }}
                transition={{
                  type: "spring",
                  stiffness: 340,
                  damping: 38,
                  mass: 0.9,
                }}
              >
                {HERO_TABS.map((tab) => (
                  <pre
                    key={tab.value}
                    className="min-h-36 w-full shrink-0 whitespace-pre-wrap p-3 font-mono text-[10px] leading-4 text-foreground sm:text-[11px]"
                  >
                    {renderHighlightedCode(tab.code)}
                  </pre>
                ))}
              </motion.div>
            </div>
          </Tabs>
        </div>
        <a
          href="https://ragbase.dev"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Not sure how this works? Try a real Ragbase demo for free.
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </motion.div>
    </div>
  );
}

const LazyGlobe = lazy(() => import("@/components/globe"));

export function Hero() {
  const [showGlobe, setShowGlobe] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Assuming 1024px is the breakpoint for lg
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Don't show on mobile
    if (!isMobile) {
      const timer = setTimeout(() => {
        setShowGlobe(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  return (
    <Section id="hero">
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-x-8 w-full p-6 lg:p-12 border-x overflow-hidden">
        <div className="flex flex-col justify-start items-start lg:col-span-1">
          <HeroTitles />
          <HeroCTA />
        </div>
        {!isMobile && (
          <div className="relative lg:h-full lg:col-span-1">
            <Suspense>
              {showGlobe && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <LazyGlobe />
                </motion.div>
              )}
            </Suspense>
          </div>
        )}
      </div>
    </Section>
  );
}
