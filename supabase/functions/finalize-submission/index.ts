import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { requireUser, serviceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const user = await requireUser(req);
    const { election_id } = await req.json();

    if (!election_id) {
      return jsonResponse({ error: "election_id is required" }, 400);
    }

    const admin = serviceClient();
    const { data: election, error: electionError } = await admin
      .from("elections")
      .select("id, status, lock_at")
      .eq("id", election_id)
      .maybeSingle();

    if (electionError || !election) {
      return jsonResponse({ error: "Election not found" }, 404);
    }

    if (
      election.status !== "open" ||
      (election.lock_at && Date.now() >= Date.parse(election.lock_at))
    ) {
      return jsonResponse({ error: "Election is locked" }, 409);
    }

    const { data: candidates, error: candidateError } = await admin
      .from("election_candidates")
      .select("constituency_id")
      .eq("election_id", election_id);

    if (candidateError) throw candidateError;

    const requiredConstituencies = new Set(
      (candidates ?? []).map((row) => row.constituency_id)
    );

    const { data: predictions, error: predictionError } = await admin
      .from("predictions")
      .select("constituency_id")
      .eq("election_id", election_id)
      .eq("user_id", user.id);

    if (predictionError) throw predictionError;

    const predictedConstituencies = new Set(
      (predictions ?? []).map((row) => row.constituency_id)
    );
    const missing = [...requiredConstituencies].filter(
      (id) => !predictedConstituencies.has(id)
    );

    if (requiredConstituencies.size === 0) {
      return jsonResponse({ error: "No constituencies are configured" }, 409);
    }

    if (missing.length > 0) {
      return jsonResponse(
        {
          error: "Predictions are incomplete",
          missing_count: missing.length
        },
        409
      );
    }

    const { error: upsertError } = await admin
      .from("prediction_submissions")
      .upsert(
        {
          election_id,
          user_id: user.id,
          is_final: true,
          final_submitted_at: new Date().toISOString()
        },
        { onConflict: "election_id,user_id" }
      );

    if (upsertError) throw upsertError;

    return jsonResponse({ message: "Final submission recorded" });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: String(error) }, 500);
  }
});
