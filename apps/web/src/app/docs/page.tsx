import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Docs",
  description: "Documentation and reference for building with Memora.",
};

const docs = [
  {
    title: "LLMs text",
    description: "A concise machine-readable overview of the product surface.",
    href: "/llms.txt",
  },
  {
    title: "LLMs full text",
    description: "The expanded repository-wide context and product summary.",
    href: "/llms-full.txt",
  },
  {
    title: "Chat with PDF example",
    description: "End-to-end example for uploading and querying documents.",
    href: "/examples/chat-with-pdf",
  },
  {
    title: "Sales coaching example",
    description: "Interactive example showing structured analysis workflows.",
    href: "/outbound-sales-call-coaching",
  },
];

export default function DocsPage() {
  return (
    <Section
      title="Docs"
      subtitle="Everything you need to build with Memora"
      description="Start here for repository context, example flows, and the machine-readable docs surface used by the app."
      align="center"
    >
      <div className="border-x border-t bg-background">
        <div className="grid gap-0 md:grid-cols-2">
          {docs.map((doc) => (
            <Link
              key={doc.href}
              href={doc.href}
              className="border-b md:border-b-0 md:border-r last:md:border-r-0 p-6 md:p-8 hover:bg-muted/40 transition-colors"
            >
              <h2 className="text-lg font-semibold text-foreground">
                {doc.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {doc.description}
              </p>
            </Link>
          ))}
        </div>

        <div id="what-is-rag" className="border-t p-6 md:p-8">
          <h2 className="text-lg font-semibold text-foreground">
            What is RAG?
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Retrieval-Augmented Generation combines your own documents with
            model output, so answers come from the content you control rather
            than generic model memory.
          </p>
        </div>

        <div className="border-t p-6 md:p-8">
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            The app itself is built around {siteConfig.name}. If you need the
            lower-level API contract, use the example routes above or inspect
            the API package README in the repository.
          </p>
        </div>
      </div>
    </Section>
  );
}
