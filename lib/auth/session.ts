import { hasSupabaseEnv } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";

export type AppUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  role: "user" | "admin";
};

export async function getCurrentUser(): Promise<AppUser | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = getServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("display_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: data?.email ?? user.email ?? null,
    displayName: data?.display_name ?? user.user_metadata?.full_name ?? null,
    role: data?.role === "admin" ? "admin" : "user"
  };
}
