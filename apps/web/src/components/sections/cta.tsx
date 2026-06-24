import { AuthCtaLink } from "@/components/auth-cta-link";
import { Section } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CTA() {
  return (
    <Section id="cta">
      <div className="border overflow-hidden relative text-center py-16 mx-auto">
        <p className="text-sm text-secondary-foreground/70 text-balance mx-auto font-medium">
          Ready to bring your data to any LLM?
        </p>

        <p className="max-w-3xl mt-2 text-foreground mb-6 text-balance mx-auto font-medium text-3xl">
          Start building with your own data in minutes.
        </p>
        <div className="flex justify-center">
          <AuthCtaLink
            className={cn(
              buttonVariants({ variant: "default" }),
              "flex items-center gap-2"
            )}
            loggedOutLabel="Get Started Free"
          />
        </div>
      </div>
    </Section>
  );
}
