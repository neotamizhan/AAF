"use client";

import { useState, useTransition } from "react";
import { Chrome } from "lucide-react";
import { Button } from "@/components/ui";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export function LoginPanel() {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function signIn() {
    startTransition(async () => {
      const supabase = getBrowserSupabase();

      if (!supabase) {
        setMessage(
          "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
        return;
      }

      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=/contest/tn-2026`
        }
      });

      if (error) {
        setMessage(error.message);
      }
    });
  }

  return (
    <section className="rounded-lg border border-line bg-white p-6 shadow-panel">
      <h1 className="text-2xl font-bold">Sign in with Google</h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">
        Google sign-in creates your contest profile and keeps predictions tied to one
        account.
      </p>
      <Button className="mt-6 w-full" onClick={signIn} disabled={isPending}>
        <Chrome className="mr-2 h-4 w-4" aria-hidden />
        Continue with Google
      </Button>
      <p className="mt-4 min-h-6 text-sm font-medium text-ember">{message}</p>
    </section>
  );
}
