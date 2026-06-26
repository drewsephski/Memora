"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { getAuthCallbackUrl, getRequestOrigin } from "@/lib/auth-redirect";

export async function googleLogin() {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = getRequestOrigin(headersList);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthCallbackUrl(origin),
    },
  });

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect(data.url);
}

export const signOut = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  return redirect("/login");
};
