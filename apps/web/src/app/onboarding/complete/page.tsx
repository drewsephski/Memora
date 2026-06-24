import { APP_NAME } from "@/app/consts";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function OnboardingCompletePage() {
  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Thank You!</CardTitle>
          <CardDescription>
            Your onboarding is complete. Welcome to {APP_NAME}!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            If you need help getting started, reach out to our support team.
          </p>
          <a
            href="mailto:hello@memoralabs.dev"
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            Contact support
          </a>
        </CardContent>
        <CardFooter>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            Go to Dashboard
          </Link>
        </CardFooter>
      </Card>
    </>
  );
}
