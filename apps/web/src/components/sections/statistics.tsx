import { Section } from "@/components/section";
import { BorderText } from "@/components/ui/border-number";
import { Clock3, Database, Search } from "lucide-react";

const stats = [
  {
    value: "1-5ms",
    label: "Redis L1 cache",
    detail: "Exact-match lookups for repeated queries.",
    icon: <Database className="size-5" />,
  },
  {
    value: "10-20ms",
    label: "Postgres L2 semantic cache",
    detail: "Similarity search before generation.",
    icon: <Search className="size-5" />,
  },
  {
    value: "2-10s",
    label: "Standard search fallback",
    detail: "Baseline when a cache miss reaches retrieval.",
    icon: <Clock3 className="size-5" />,
  },
];

export function Statistics() {
  return (
    <Section id="statistics" title="Statistics">
      <div className="border-x border-t bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center px-6 py-10 text-center"
            >
              <BorderText
                text={stat.value}
                className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold text-foreground"
              />
              <div className="mt-4 flex items-center justify-center gap-2">
                {stat.icon}
                <p className="text-sm font-semibold text-foreground">
                  {stat.label}
                </p>
              </div>
              <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                {stat.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
