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
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Copy, Sparkles } from "lucide-react";
import { AuthCtaLink } from "@/components/auth-cta-link";
import { lazy, Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

const ease = [0.16, 1, 0.3, 1];
const AGENT_PROMPT = `You are an AI agent helping me get started with Memora.

I am not technical, so keep the instructions simple and step by step.

First, explain the fastest way to try Memora with my own content.
Then, if I want to test the API directly, show me this request and explain what each part does:

curl -X POST https://api.memoralabs.dev/upload_text \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"contents": "your text here"}'

Ask me one question at a time and help me get to a working first test.`;

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
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AGENT_PROMPT);
      setCopied(true);
      toast.success("Agent prompt copied");
    } catch {
      toast.error("Could not copy the prompt");
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
            "w-full sm:w-auto text-background flex gap-2 rounded-lg"
          )}
        >
          <Icons.logo className="h-6 w-6" />
          {siteConfig.hero.cta}
        </AuthCtaLink>
      </motion.div>

      {/* Code snippet */}
      <motion.div
        className="mt-8 w-full max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8, ease }}
      >
        <div className="rounded-lg border bg-muted/50 p-4 text-sm font-mono">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="text-xs font-medium text-muted-foreground">
              GET STARTED IN SECONDS
            </div>
            <Dialog
              open={promptOpen}
              onOpenChange={(open) => {
                setPromptOpen(open);
                if (!open) {
                  setCopied(false);
                }
              }}
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 rounded-md"
                onClick={() => setPromptOpen(true)}
              >
                <Sparkles className="h-4 w-4" />
                Agent prompt
              </Button>

              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Copy an agent prompt</DialogTitle>
                  <DialogDescription>
                    Paste this into ChatGPT, Claude, or any AI assistant to get
                    a simple, guided first setup.
                  </DialogDescription>
                </DialogHeader>

                <div className="rounded-lg border bg-muted/40 p-4">
                  <pre className="max-h-[48vh] overflow-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground">
                    {AGENT_PROMPT}
                  </pre>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="w-full gap-2 sm:w-auto"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Copied" : "Copy prompt"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <pre className="text-foreground whitespace-pre-wrap">
            {`curl -X POST https://api.memoralabs.dev/upload_text \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"contents": "your text here"}'`}
          </pre>
        </div>
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
