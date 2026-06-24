import type { Metadata } from "next";
import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";
import { CTA } from "@/components/sections/cta";
import { PricingClient } from "./pricing-client";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple pricing for everyone. Choose an affordable plan that's packed with the best features.",
};

const faqItems = [
  {
    question: "What does Memora actually do for my team?",
    answer:
      "Memora lets your team search across calls, docs, and tickets in one place so people get the right answer faster without digging through tabs or asking around.",
  },
  {
    question: "Do I need to be technical to use it?",
    answer:
      "No. You can start with simple uploads and ready-made examples, then grow into API use later if your team needs it.",
  },
  {
    question: "Why would I pay for this instead of using a regular chatbot?",
    answer:
      "A chatbot guesses from general knowledge. Memora answers from your own content, with access controls and retrieval built for real business workflows.",
  },
  {
    question: "How long does it take to get value?",
    answer:
      "Most teams can try the core workflow in minutes by uploading a file and asking a question. From there, you can connect more data sources as needed.",
  },
];

export default async function PricingPage() {
  return (
    <>
      <Header />
      <main className="bg-background text-foreground">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              Simple pricing for everyone
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose an affordable plan that&apos;s packed with the best
              features for engaging your audience, creating customer loyalty,
              and driving sales.
            </p>
            <p className="mt-4 text-lg text-primary font-medium max-w-3xl mx-auto">
              100% refund within 14 days if you don&apos;t love it. No questions
              asked.
            </p>
          </div>

          <PricingClient />

          <div className="mt-24">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:gap-10 max-w-5xl mx-auto">
              {faqItems.map((item, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="text-xl font-semibold">{item.question}</h3>
                  <p className="text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <CTA />
      </main>
      <Footer />
    </>
  );
}
