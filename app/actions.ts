"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";

const savePredictionSchema = z.object({
  electionId: z.string().min(1),
  electionCode: z.string().min(1),
  constituencyId: z.string().min(1),
  candidateId: z.string().min(1),
  partyId: z.string().min(1),
  allianceId: z.string().min(1)
});

export type ActionState = {
  ok: boolean;
  message: string;
};

export async function savePredictionAction(
  input: z.infer<typeof savePredictionSchema>
): Promise<ActionState> {
  const parsed = savePredictionSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "The prediction payload is incomplete." };
  }

  if (!hasSupabaseEnv()) {
    return {
      ok: true,
      message: "Saved in this browser preview. Configure Supabase to sync entries."
    };
  }

  const supabase = getServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sign in with email before saving predictions." };
  }

  const { error } = await supabase.from("predictions").upsert(
    {
      election_id: parsed.data.electionId,
      user_id: user.id,
      constituency_id: parsed.data.constituencyId,
      predicted_candidate_id: parsed.data.candidateId,
      predicted_party_id: parsed.data.partyId,
      predicted_alliance_id: parsed.data.allianceId,
      updated_at: new Date().toISOString()
    },
    { onConflict: "election_id,user_id,constituency_id" }
  );

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/contest/${parsed.data.electionCode}`);
  revalidatePath(`/contest/${parsed.data.electionCode}/constituencies`);
  revalidatePath(`/contest/${parsed.data.electionCode}/summary`);

  return { ok: true, message: "Prediction saved." };
}

export async function finalizeSubmissionAction(
  electionCode: string,
  electionId: string
): Promise<ActionState> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      message:
        "Final submission is server-enforced. Configure Supabase before locking entries."
    };
  }

  const supabase = getServerSupabase();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return { ok: false, message: "Sign in with email before final submission." };
  }

  const { data, error } = await supabase.functions.invoke("finalize-submission", {
    body: { election_id: electionId }
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/contest/${electionCode}`);
  revalidatePath(`/contest/${electionCode}/summary`);

  return {
    ok: true,
    message: data?.message ?? "Final submission recorded."
  };
}
