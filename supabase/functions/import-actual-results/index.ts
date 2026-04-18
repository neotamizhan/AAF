import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import {
  normalizeCandidateName,
  parseCsv,
  requireFields
} from "../_shared/csv.ts";
import { requireAdmin, serviceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    await requireAdmin(req);
    const { csv, dry_run = true } = await req.json();

    if (!csv || typeof csv !== "string") {
      return jsonResponse({ error: "csv payload is required" }, 400);
    }

    const rows = parseCsv(csv);
    const issues: Array<{ rowNumber: number; field: string; message: string }> = [];
    const admin = serviceClient();
    let imported = 0;

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2;
      requireFields(
        row,
        [
          "election_code",
          "constituency_name",
          "winning_candidate_name",
          "winning_party_code"
        ],
        rowNumber,
        issues
      );
      if (issues.some((issue) => issue.rowNumber === rowNumber)) continue;

      const { data: election } = await admin
        .from("elections")
        .select("id")
        .eq("code", row.election_code)
        .maybeSingle();
      const { data: constituency } = await admin
        .from("constituencies")
        .select("id")
        .eq("name", row.constituency_name)
        .maybeSingle();
      const { data: party } = await admin
        .from("parties")
        .select("id")
        .eq("code", row.winning_party_code)
        .maybeSingle();

      if (!election) issues.push({ rowNumber, field: "election_code", message: "Election not found" });
      if (!constituency) issues.push({ rowNumber, field: "constituency_name", message: "Constituency not found" });
      if (!party) issues.push({ rowNumber, field: "winning_party_code", message: "Party not found" });
      if (!election || !constituency || !party) continue;

      const { data: map } = await admin
        .from("party_alliance_map")
        .select("alliance_id")
        .eq("election_id", election.id)
        .eq("party_id", party.id)
        .maybeSingle();

      if (!map) {
        issues.push({
          rowNumber,
          field: "winning_party_code",
          message: "Party has no alliance mapping for this election"
        });
        continue;
      }

      if (!dry_run) {
        const { data: candidate, error: candidateError } = await admin
          .from("candidates")
          .upsert(
            {
              normalized_name: normalizeCandidateName(row.winning_candidate_name),
              display_name: row.winning_candidate_name
            },
            { onConflict: "normalized_name" }
          )
          .select("id")
          .single();

        if (candidateError) throw candidateError;

        const { error } = await admin.from("actual_results").upsert(
          {
            election_id: election.id,
            constituency_id: constituency.id,
            winning_candidate_id: candidate.id,
            winning_candidate_name: row.winning_candidate_name,
            winning_party_id: party.id,
            winning_alliance_id: map.alliance_id,
            votes_won: row.votes_won ? Number(row.votes_won) : null,
            runner_up_votes: row.runner_up_votes
              ? Number(row.runner_up_votes)
              : null,
            margin: row.margin ? Number(row.margin) : null,
            result_status: row.result_status || "final",
            source_url: row.source_url || null
          },
          { onConflict: "election_id,constituency_id" }
        );

        if (error) throw error;
        imported += 1;
      }
    }

    return jsonResponse({ dry_run, rows: rows.length, imported, issues });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: String(error) }, 500);
  }
});
