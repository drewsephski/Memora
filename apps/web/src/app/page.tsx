import type { Metadata } from "next";
import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
// import { WhyIBuit } from "@/components/sections/why-i-built";
// import { WhatIsRag } from "@/components/sections/what-is-rag";
import { UseCases } from "@/components/sections/use-cases";
import { HowToUse } from "@/components/sections/how-to-use";
import { Community } from "@/components/sections/community";
import { CTA } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";
import { Pricing } from "@/components/sections/pricing";
import { Statistics } from "@/components/sections/statistics";

export const metadata: Metadata = {
  description:
    "Build powerful RAG applications with any data source, at any scale.",
};

export default async function Home() {
  return (
    <main>
      <Header />
      <Hero />
      {/* <WhyIBuit /> */}
      {/* <WhatIsRag /> */}
      <UseCases />
      <HowToUse />
      <Statistics />
      <Pricing className="mt-[-49px] bg-background relative z-10" />
      <Community />
      <CTA />
      <Footer />
    </main>
  );
}
