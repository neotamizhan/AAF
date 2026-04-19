import { NextResponse } from "next/server";
import { ensureUserProfile } from "@/lib/auth/profile";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const next = requestUrl.searchParams.get("next") ?? "/contest/tn-2026";

  if (error) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set(
      "error",
      errorDescription ?? "The sign-in link could not be verified."
    );
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "The sign-in link was missing an auth code.");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = getServerSupabase();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", exchangeError.message);
    return NextResponse.redirect(loginUrl);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    try {
      await ensureUserProfile(supabase, user);
    } catch (profileError) {
      console.error("Profile self-heal failed after auth callback", profileError);
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
