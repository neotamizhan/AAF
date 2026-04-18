import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { parseCsv, requireFields } from "../_shared/csv.ts";
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
        ["constituency_name", "election_year", "rank", "candidate_name"],
        rowNumber,
        issues
      );
      if (issues.some((issue) => issue.rowNumber === rowNumber)) continue;

      const rank = Number(row.rank);
      if (!Number.isInteger(rank) || rank < 1 || rank > 3) {
        issues.push({ rowNumber, field: "rank", message: "Rank must be 1, 2, or 3" });
        continue;
      }

      const { data: constituency } = await admin
        .from("constituencies")
        .select("id")
        .eq("name", row.constituency_name)
        .maybeSingle();

      if (!constituency) {
        issues.push({
          rowNumber,
          field: "constituency_name",
          message: "Constituency not found"
        });
        continue;
      }

      if (!dry_run) {
        const { error } = await admin.from("previous_results").upsert(
          {
            constituency_id: constituency.id,
            election_year: Number(row.election_year),
            rank,
            candidate_name: row.candidate_name,
            party_name: row.party_name || null,
            votes: row.votes ? Number(row.votes) : null,
            vote_share: row.vote_share ? Number(row.vote_share) : null,
            source_url: row.source_url || null
          },
          { onConflict: "constituency_id,election_year,rank" }
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
