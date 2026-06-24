import { LoginForm } from "@/components/login-form";
import { getAuthUser } from "@/utils/supabase/get-user";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
  alternates: {
    canonical: "/login",
  },
};

export default async function LoginPage() {
  const user = await getAuthUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
