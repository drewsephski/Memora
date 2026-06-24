import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowUpRight,
  Database,
  LayoutGrid,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Ragbase | Built on Memora",
  description:
    "Ragbase is a product built on Memora that shows how retrieval infrastructure becomes a polished customer-facing application.",
  alternates: {
    canonical: "/ragbase",
  },
};

const whatItIs = [
  {
    title: "Product layer",
    description:
      "Ragbase turns Memora into an end-user application with a focused interface and a simple way to explore RAG-powered experiences.",
    icon: LayoutGrid,
  },
  {
    title: "Retrieval engine",
    description:
      "Memora handles storage, embedding, and retrieval so Ragbase can stay centered on product experience instead of infrastructure.",
    icon: Database,
  },
  {
    title: "Customer-ready workflow",
    description:
      "The result is a polished surface for demos, sales, and product discovery that still uses production-grade context retrieval underneath.",
    icon: ShieldCheck,
  },
];

const steps = [
  {
    title: "Connect content",
    description:
      "Documents, notes, and source material are uploaded into Memora so they are ready for indexing and retrieval.",
  },
  {
    title: "Index with Memora",
    description:
      "Memora chunks and stores the data, keeping retrieval consistent and fast across the app.",
  },
  {
    title: "Query in Ragbase",
    description:
      "Ragbase sends user questions through Memora to pull back the most relevant context for the experience.",
  },
  {
    title: "Present the result",
    description:
      "The app renders the answer in a product-facing flow instead of exposing raw API mechanics to the user.",
  },
];

const integrationPoints = [
  "Memora provides the retrieval API and data layer.",
  "Ragbase handles the product UX, prompts, and presentation.",
  "The two layers stay decoupled so the product can evolve without changing the retrieval core.",
  "That separation makes it easier to reuse Memora across future products.",
];

const integrationSnippet = `const ragbase = {
  product: "ragbase.dev",
  retrieval: {
    provider: "Memora",
    apiUrl: "https://api.memoralabs.dev",
    flow: ["ingest", "embed", "retrieve", "present"],
  },
};`;

function Card({
  title,
  description,
  icon: Icon,
  className,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-[1.5rem] border border-border/70 bg-background/90 p-6 text-center shadow-sm",
        className
      )}
    >
      <div className="mx-auto mb-4 inline-flex rounded-full border bg-muted/50 p-3">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-balance text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-[24ch] text-sm leading-6 text-muted-foreground text-balance">
        {description}
      </p>
    </div>
  );
}

function StepCard({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-[1.25rem] border border-border/70 bg-background/90 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-muted/50 text-sm font-semibold text-foreground">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function RagbasePage() {
  return (
    <main>
      <Header />

      <Section
        title="Platform Spotlight"
        subtitle="Ragbase is built on Memora"
        description="Ragbase is a customer-facing product on top of Memora. The retrieval layer stays focused on context, while Ragbase turns that infrastructure into a finished application."
        align="center"
        className="bg-background"
        bodyClassName="max-w-6xl px-6 pb-12 lg:px-8"
      >
        <div className="rounded-[2rem] border border-border/70 bg-gradient-to-b from-background via-background to-muted/20 p-6 shadow-sm lg:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              ragbase.dev
            </div>

            <div className="mt-6 space-y-4">
              <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Ragbase is designed to show how Memora can be packaged into a
                real product. It keeps the retrieval layer narrow and moves the
                product logic into a clean, branded interface.
              </p>
              <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                That separation matters: Memora stays the source of truth for
                context, while Ragbase handles the experience people see and
                use every day.
              </p>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild className="rounded-full">
                <a href="https://ragbase.dev" target="_blank" rel="noreferrer">
                  Visit ragbase.dev
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/#platforms-built-on-memora">
                  Back to platforms
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[1.5rem] border bg-background/80 p-6 text-left">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
                <LayoutGrid className="h-4 w-4 text-primary" />
                What Ragbase adds
              </div>
              <ul className="space-y-4 text-sm leading-6 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    A product shell that keeps the experience focused and
                    immediately understandable.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    A clean place to present answers, prompts, and guided
                    workflows without exposing infrastructure details.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    A reusable front end that can evolve independently from the
                    retrieval core.
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-[1.5rem] border bg-muted/25 p-6 text-left">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
                <Workflow className="h-4 w-4 text-primary" />
                How it fits with Memora
              </div>
              <ul className="space-y-4 text-sm leading-6 text-muted-foreground">
                {integrationPoints.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="What it is"
        subtitle="A product shell with a real retrieval core"
        description="Ragbase is the application layer that turns Memora into something customer-facing. The shape stays simple so the product can scale without becoming visually noisy."
        align="center"
        bodyClassName="max-w-5xl px-6 pb-12 lg:px-8"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {whatItIs.map((item) => (
            <Card
              key={item.title}
              title={item.title}
              description={item.description}
              icon={item.icon}
            />
          ))}
        </div>
      </Section>

      <Section
        title="System"
        subtitle="How Ragbase is wired"
        description="The interaction between the product shell and the retrieval layer is intentionally compact. That keeps the page readable and the architecture obvious."
        align="center"
        bodyClassName="max-w-6xl px-6 pb-12 lg:px-8"
      >
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.75rem] border border-border/70 bg-background/90 p-6 text-left shadow-sm lg:p-8">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              How it works
            </div>
            <div className="mt-6 space-y-4">
              {steps.map((step, index) => (
                <StepCard
                  key={step.title}
                  index={index}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-border/70 bg-muted/25 p-6 text-left shadow-sm lg:p-8">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
                <Workflow className="h-4 w-4 text-primary" />
                Integration contract
              </div>
              <div className="space-y-4 text-sm leading-6 text-muted-foreground">
                <p>
                  Ragbase calls Memora for ingestion and retrieval, then
                  presents the result as a polished application experience.
                </p>
                <p>
                  If the product expands later, the same Memora layer can be
                  reused for other surfaces without rebuilding the core.
                </p>
                <p>
                  That keeps the platform architecture small, testable, and
                  easier to maintain.
                </p>
              </div>

              <ul className="mt-6 space-y-3 text-sm leading-6 text-muted-foreground">
                {integrationPoints.slice(0, 3).map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.75rem] border border-border/70 bg-background/90 p-6 text-left shadow-sm lg:p-8">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
                <Search className="h-4 w-4 text-primary" />
                Example shape
              </div>
              <pre className="overflow-auto rounded-[1rem] border bg-muted/50 p-4 text-sm leading-6 text-foreground">
                <code>{integrationSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Why it matters"
        subtitle="Reusable product logic, not repeated scaffolding"
        description="Ragbase is a concrete example of how Memora can support multiple products without changing the retrieval backbone."
        align="center"
        bodyClassName="max-w-4xl px-6 pb-12 lg:px-8"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Card
            title="Faster product iteration"
            description="The retrieval layer stays stable while the product layer can change quickly as the app evolves."
            icon={Sparkles}
          />
          <Card
            title="Cleaner separation"
            description="Memora handles context infrastructure. Ragbase handles the user experience and product-specific logic."
            icon={LayoutGrid}
          />
        </div>
      </Section>

      <Section
        title="Get started"
        subtitle="Use Ragbase as the reference point"
        description="If you want to see how Memora becomes a finished product, Ragbase is the cleanest example."
        align="center"
        bodyClassName="max-w-4xl px-6 pb-12 lg:px-8"
      >
        <div className="rounded-[2rem] border border-border/70 bg-background/90 p-8 text-center shadow-sm lg:p-10">
          <p className="mx-auto max-w-2xl text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Ragbase on Memora
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Explore the live product at ragbase.dev and use this page as the
            explanation of how it fits into the Memora ecosystem.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-full">
              <a href="https://ragbase.dev" target="_blank" rel="noreferrer">
                Open Ragbase
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/">Back to Memora</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Footer />
    </main>
  );
}
