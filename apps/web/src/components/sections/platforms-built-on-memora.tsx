"use client";

import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Layers3, Sparkles } from "lucide-react";
import Link from "next/link";

const platforms = [
  {
    name: "Ragbase",
    href: "/ragbase",
    externalHref: "https://ragbase.dev",
    description:
      "A productized RAG experience built on Memora for teams that want a polished end-user layer on top of the retrieval engine.",
    highlights: [
      "Memora-powered retrieval",
      "Product UI on top of RAG",
      "Designed for customer-facing workflows",
    ],
  },
];

export function PlatformsBuiltOnMemora({
  className,
}: {
  className?: string;
}) {
  return (
    <Section
      id="platforms-built-on-memora"
      title="Platforms built on Memora"
      subtitle="Ragbase"
      description="Memora is the retrieval layer. Ragbase is one of the products built on top of it, showing how the engine turns into a real application."
      align="center"
      className={className}
    >
      <div className="border-x border-t overflow-hidden">
        <div className="grid gap-6 p-6 lg:p-12">
          {platforms.map((platform) => (
            <article
              key={platform.name}
              className="relative overflow-hidden rounded-2xl border bg-background shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/30" />
              <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Built on Memora
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      {platform.name}
                    </h3>
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                      {platform.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {platform.highlights.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild className="rounded-full">
                      <Link href={platform.href}>Read the Ragbase page</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full">
                      <a
                        href={platform.externalHref}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visit ragbase.dev
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border bg-muted/30 p-5">
                  <div className="mb-4 flex items-center gap-2 text-sm font-medium">
                    <Layers3 className="h-4 w-4 text-primary" />
                    Memora integration layer
                  </div>
                  <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                    <p>
                      Ragbase uses Memora for storage, retrieval, and semantic
                      search so the product can focus on the experience layer.
                    </p>
                    <p>
                      That keeps the application fast to ship while preserving
                      the production RAG infrastructure underneath.
                    </p>
                    <p>
                      The result is a customer-facing product that still behaves
                      like a serious retrieval system.
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
