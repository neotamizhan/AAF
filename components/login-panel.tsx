"use client";

import { FormEvent, useState, useTransition } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui";
import { getBrowserSupabase } from "@/lib/supabase/browser";

function getAuthRedirectOrigin() {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, "");
  }

  return window.location.origin;
}

export function LoginPanel() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/contest/tn-2026`
        }
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Check your email for the sign-in link.");
    });
  }

  return (
    <section className="rounded-lg border border-line bg-white p-6 shadow-panel">
      <h1 className="text-2xl font-bold">Sign in with email</h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">
        Enter your email and use the secure link sent to your inbox. No password or
        OAuth setup needed.
      </p>
      <form className="mt-6 grid gap-3" onSubmit={signIn}>
        <label className="text-sm font-semibold" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="focus-ring min-h-11 rounded-md border border-line bg-paper px-3 text-sm"
        />
        <Button className="w-full" type="submit" disabled={isPending}>
          <Mail className="mr-2 h-4 w-4" aria-hidden />
          Send sign-in link
        </Button>
      </form>
      <p className="mt-4 min-h-6 text-sm font-medium text-ember" role="status">
        {message}
      </p>
    </section>
  );
}
