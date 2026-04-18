import { notFound } from "next/navigation";
import { LinkButton, SectionHeader, Shell } from "@/components/ui";
import {
  getActualResults,
  getConstituencyCatalog,
  getElectionByCode,
  getUserPredictions
} from "@/lib/data/adapter";

export default async function ResultConstituencyPage({
  params
}: {
  params: { electionCode: string; id: string };
}) {
  const election = await getElectionByCode(params.electionCode);
  if (!election) notFound();

  const [catalog, results, predictions] = await Promise.all([
    getConstituencyCatalog(params.electionCode),
    getActualResults(election.id),
    getUserPredictions(election.id)
  ]);
  const constituency = catalog.find((item) => item.id === params.id);
  if (!constituency) notFound();

  const result = results.find((item) => item.constituencyId === constituency.id);
  const prediction = predictions.find(
    (item) => item.constituencyId === constituency.id
  );
  const predictedCandidate = constituency.candidates.find(
    (item) => item.candidateId === prediction?.predictedCandidateId
  );
  const hit =
    result?.winningCandidateId &&
    prediction?.predictedCandidateId === result.winningCandidateId;

  return (
    <Shell>
      <SectionHeader
        eyebrow={election.name}
        title={constituency.name}
        description="Review your predicted candidate against the imported actual winner."
        actions={
          <LinkButton href={`/results/${params.electionCode}`} variant="secondary">
            Back to results
          </LinkButton>
        }
      />
      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
          <h2 className="text-lg font-bold">Your prediction</h2>
          <p className="mt-4 text-2xl font-bold">
            {predictedCandidate?.candidateName ?? "No prediction"}
          </p>
          <p className="mt-2 text-sm text-ink/65">
            {predictedCandidate
              ? `${predictedCandidate.partyCode} · ${predictedCandidate.allianceName}`
              : "Draft entry was not saved for this seat."}
          </p>
        </section>
        <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
          <h2 className="text-lg font-bold">Actual winner</h2>
          <p className="mt-4 text-2xl font-bold">
            {result?.winningCandidateName ?? "Result not imported"}
          </p>
          <p className="mt-2 text-sm text-ink/65">
            {result
              ? `${result.resultStatus} · margin ${
                  result.margin?.toLocaleString("en-IN") ?? "unavailable"
                }`
              : "Admin import pending."}
          </p>
        </section>
      </div>
      <section className="mt-5 rounded-lg border border-line bg-white p-5 shadow-panel">
        <h2 className="text-lg font-bold">Score impact</h2>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          {hit
            ? "This VIP or constituency pick matched the actual winning candidate."
            : "This pick did not match the actual winning candidate, or the result is still pending."}
        </p>
      </section>
    </Shell>
  );
}
