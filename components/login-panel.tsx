"use client";

import { useState, useTransition } from "react";
import { Chrome } from "lucide-react";
import { Button } from "@/components/ui";
import { getBrowserSupabase } from "@/lib/supabase/browser";

function getAuthRedirectOrigin() {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, "");
  }

  return window.location.origin;
}

export function LoginPanel({ initialMessage = "" }: { initialMessage?: string }) {
  const [message, setMessage] = useState(initialMessage);
  const [isPending, startTransition] = useTransition();

  function signIn() {
    setMessage("");

    startTransition(async () => {
      const supabase = getBrowserSupabase();

      if (!supabase) {
        setMessage(
          "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
        return;
      }

      const origin = getAuthRedirectOrigin();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=/contest/tn-2026`
        }
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Redirecting to Google...");
    });
  }

  return (
    <section className="rounded-lg border border-line bg-white p-6 shadow-panel">
      <h1 className="text-2xl font-bold">Sign in with Google</h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">
        Use your Google account to enter the contest and save predictions.
      </p>
      <Button className="mt-6 w-full" onClick={signIn} disabled={isPending}>
        <Chrome className="mr-2 h-4 w-4" aria-hidden />
        Continue with Google
      </Button>
      <p className="mt-4 min-h-6 text-sm font-medium text-ember" role="status">
        {message}
      </p>
    </section>
  );
}
