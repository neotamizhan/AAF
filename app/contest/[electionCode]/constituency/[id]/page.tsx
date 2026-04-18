import { notFound } from "next/navigation";
import { CandidatePicker } from "@/components/candidate-picker";
import { LinkButton, SectionHeader, Shell } from "@/components/ui";
import {
  getConstituencyCatalog,
  getElectionByCode,
  getUserPredictions
} from "@/lib/data/adapter";
import { StatusChip } from "@/components/status-chip";

export default async function ConstituencyDetailPage({
  params
}: {
  params: { electionCode: string; id: string };
}) {
  const election = await getElectionByCode(params.electionCode);
  if (!election) notFound();

  const [catalog, predictions] = await Promise.all([
    getConstituencyCatalog(params.electionCode),
    getUserPredictions(election.id)
  ]);
  const index = catalog.findIndex((item) => item.id === params.id);
  const constituency = catalog[index];
  if (!constituency) notFound();

  const previous = catalog[index - 1];
  const next = catalog[index + 1];
  const prediction = predictions.find(
    (item) => item.constituencyId === constituency.id
  );

  return (
    <Shell>
      <SectionHeader
        eyebrow={`${constituency.ecCode} · ${constituency.districtName} · ${constituency.zoneName}`}
        title={constituency.name}
        description="Choose one predicted winning candidate. Selection autosaves when Supabase is configured and stores locally in preview mode."
        actions={
          <LinkButton
            href={`/contest/${params.electionCode}/constituencies`}
            variant="secondary"
          >
            All constituencies
          </LinkButton>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
          <div className="flex flex-wrap gap-2">
            {constituency.isVip ? <StatusChip status="vip" /> : null}
            <StatusChip status={prediction ? "saved" : "not_started"} />
          </div>
          <h2 className="mt-5 text-lg font-bold">Previous election top 3</h2>
          <div className="mt-3 grid gap-3">
            {constituency.previousResults.map((result) => (
              <div
                key={result.id}
                className="rounded-md border border-line bg-paper p-3 text-sm"
              >
                <p className="font-bold">
                  {result.rank}. {result.candidateName}
                </p>
                <p className="mt-1 text-ink/65">
                  {result.partyName ?? "Party unavailable"}
                  {result.voteShare ? ` · ${result.voteShare}% vote share` : ""}
                </p>
              </div>
            ))}
          </div>
        </section>

        <CandidatePicker
          election={election}
          electionCode={params.electionCode}
          constituency={constituency}
          prediction={prediction}
          previousHref={
            previous
              ? `/contest/${params.electionCode}/constituency/${previous.id}`
              : undefined
          }
          nextHref={
            next
              ? `/contest/${params.electionCode}/constituency/${next.id}`
              : undefined
          }
        />
      </div>
    </Shell>
  );
}
