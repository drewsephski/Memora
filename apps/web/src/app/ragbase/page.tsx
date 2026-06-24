import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowUpRight,
  Database,
  Layers3,
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
      "Ragbase turns Memora into an end-user application with a focused interface, guided workflows, and a simple way to explore RAG-powered experiences.",
    icon: LayoutGrid,
  },
  {
    title: "Retrieval engine",
    description:
      "Memora handles the storage, embedding, and retrieval layer so Ragbase can stay centered on user experience instead of infrastructure.",
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
      "Documents, notes, and other source material are uploaded into Memora so they are ready for indexing and retrieval.",
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

function InfoCard({
  title,
  description,
  icon: Icon,
  centered = false,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  centered?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-background p-6 shadow-sm ${centered ? "text-center" : ""}`}
    >
      <div
        className={`mb-4 inline-flex rounded-full border bg-muted/50 p-3 ${centered ? "mx-auto" : ""}`}
      >
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
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
        description="Ragbase is another one of my products. It uses Memora as the RAG and retrieval layer, then adds a clean product experience on top so the platform feels like a finished application instead of a raw API."
        className="bg-background"
      >
        <div className="border-x border-t overflow-hidden">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                ragbase.dev
              </div>

              <div className="space-y-4">
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Ragbase is designed to show how Memora can be packaged into a
                  real product. The app keeps the retrieval layer focused and
                  moves the product logic into a clean, branded interface.
                </p>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  That separation matters: Memora stays the source of truth for
                  context, while Ragbase handles the experience people see and
                  use every day.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="rounded-full">
                  <a
                    href="https://ragbase.dev"
                    target="_blank"
                    rel="noreferrer"
                  >
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

            <div className="rounded-2xl border bg-muted/30 p-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
                <Layers3 className="h-4 w-4 text-primary" />
                How it fits with Memora
              </div>
              <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
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
        subtitle="A product built on top of the retrieval layer"
        description="Ragbase is the application layer that turns Memora into something customer-facing. These pieces are intentionally separate so the platform can scale cleanly."
      >
        <div className="border-x border-t">
          <div className="grid gap-6 p-6 md:grid-cols-3 lg:p-12">
            {whatItIs.map((item) => (
              <InfoCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={item.icon}
                centered
              />
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="How it works"
        subtitle="Memora provides the engine, Ragbase provides the product"
        description="The implementation keeps the responsibilities separated so each layer can evolve independently."
      >
        <div className="border-x border-t">
          <div className="grid gap-6 p-6 lg:grid-cols-4 lg:p-12">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border bg-background p-6 text-center shadow-sm"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-muted/50 text-sm font-semibold text-foreground">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="Integration"
        subtitle="The Memora contract that Ragbase depends on"
        description="Ragbase stays lightweight by delegating the hard retrieval problems to Memora. That makes the integration straightforward and predictable."
      >
        <div className="border-x border-t">
          <div className="grid gap-6 p-6 lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
            <div className="rounded-2xl border bg-muted/20 p-6 text-center">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
                <Workflow className="h-4 w-4 text-primary" />
                Integration pattern
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
            </div>

            <div className="rounded-2xl border bg-background p-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
                <Search className="h-4 w-4 text-primary" />
                Example shape
              </div>
              <pre className="overflow-auto rounded-xl border bg-muted/50 p-4 text-sm leading-6 text-foreground">
                <code>{integrationSnippet}</code>
              </pre>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                The exact implementation can vary, but the contract remains the
                same: Memora stores and retrieves the context, Ragbase owns the
                product experience.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Why it matters"
        subtitle="A reusable product shell on top of Memora"
        description="Ragbase is a concrete example of how Memora can support multiple products without changing the retrieval backbone."
      >
        <div className="border-x border-t">
          <div className="grid gap-6 p-6 md:grid-cols-2 lg:p-12">
            <InfoCard
              title="Faster product iteration"
              description="The retrieval layer stays stable while the product layer can change quickly as the app evolves."
              icon={Sparkles}
              centered
            />
            <InfoCard
              title="Cleaner separation"
              description="Memora handles context infrastructure. Ragbase handles the user experience and product-specific logic."
              icon={Layers3}
              centered
            />
          </div>
        </div>
      </Section>

      <Section
        title="Get started"
        subtitle="Use Ragbase as the reference point"
        description="If you want to see how Memora becomes a finished product, Ragbase is the cleanest example."
      >
        <div className="border-x border-t">
          <div className="flex flex-col items-start gap-4 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-12">
            <div className="max-w-2xl space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Ragbase on Memora
              </p>
              <p className="text-base leading-7 text-muted-foreground">
                Explore the live product at ragbase.dev and use this page as
                the explanation of how it fits into the Memora ecosystem.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
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
        </div>
      </Section>

      <Footer />
    </main>
  );
}
