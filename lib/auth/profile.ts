import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: User
): Promise<void> {
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existing) {
    return;
  }

  const { error: insertError } = await supabase.from("profiles").insert({
    id: user.id,
    email: user.email ?? null,
    display_name:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      null
  });

  if (insertError) {
    throw insertError;
  }
}
