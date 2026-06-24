import type { ReactNode } from "react";
import { Header } from "@/components/sections/header";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen py-12 md:py-20">
        <div className="container mx-auto py-8">{children}</div>
      </main>
    </>
  );
}
