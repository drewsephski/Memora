"use client";

import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Ripple } from "@/components/ui/ripple";
import { cn } from "@/lib/utils";
import { Linkedin } from "lucide-react";

export function Community({ className }: { className?: string }) {
  return (
    <Section id="community" title="Built by" className={cn(className)}>
      <div className="border-x border-t overflow-hidden relative">
        <Ripple />
        <div className="relative p-6 text-center py-12">
          <p className="text-muted-foreground mb-6 text-balance max-w-prose mx-auto font-medium">
            Designed and developed by Drew Sepeczi.
          </p>

          <div className="flex justify-center mb-8">
            <div className="size-24 overflow-hidden rounded-full border border-border bg-background shadow-sm md:size-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/community-anime.png"
                alt="Anime-style avatar illustration"
                className="block size-full object-cover"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              asChild
              variant="secondary"
              size="icon"
              className="rounded-full"
            >
              <a
                target="_blank"
                rel="noreferrer"
                href="https://www.linkedin.com/in/drewsepeczi/"
                aria-label="Drew Sepeczi on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
