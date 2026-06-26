import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getPostAuthRedirectUrl } from "@/lib/auth-redirect";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.redirect(getPostAuthRedirectUrl("/login", origin));

  return NextResponse.redirect(getPostAuthRedirectUrl("/dashboard", origin));
}
