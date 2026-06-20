import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeNextPath(value: string | null) {
  if (!value || !value.startsWith("/")) {
    return "/dashboard";
  }

  return value;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextPath = normalizeNextPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=oauth_code_missing`);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${origin}/sign-in?error=oauth_exchange_failed`);
    }

    const forwardedHost = request.headers.get("x-forwarded-host");
    if (process.env.NODE_ENV !== "development" && forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${nextPath}`);
    }

    return NextResponse.redirect(`${origin}${nextPath}`);
  } catch {
    return NextResponse.redirect(`${origin}/sign-in?error=oauth_callback_failed`);
  }
}
