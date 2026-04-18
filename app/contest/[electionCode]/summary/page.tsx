import { notFound } from "next/navigation";
import { FinalSubmissionPanel } from "@/components/final-submission-panel";
import { ProgressPanel } from "@/components/progress-panel";
import { SeatSummary } from "@/components/seat-summary";
import { LinkButton, SectionHeader, Shell } from "@/components/ui";
import {
  getAlliances,
  getConstituencyCatalog,
  getElectionByCode,
  getPredictionProgress,
  getUserPredictions,
  summarizePredictedSeats
} from "@/lib/data/adapter";

export default async function SummaryPage({
  params
}: {
  params: { electionCode: string };
}) {
  const election = await getElectionByCode(params.electionCode);
  if (!election) notFound();

  const [catalog, alliances, predictions] = await Promise.all([
    getConstituencyCatalog(params.electionCode),
    getAlliances(),
    getUserPredictions(election.id)
  ]);
  const progress = await getPredictionProgress(election, catalog);
  const seatSummary = summarizePredictedSeats(alliances, predictions);

  return (
    <Shell>
      <SectionHeader
        eyebrow={election.name}
        title="Prediction summary"
        description="Review your alliance totals, VIP picks, and missing constituencies before final submission."
        actions={
          <LinkButton href={`/contest/${params.electionCode}/constituencies`}>
            Edit predictions
          </LinkButton>
        }
      />
      <div className="grid gap-5">
        <ProgressPanel election={election} progress={progress} />
        <SeatSummary rows={seatSummary} title="Your predicted alliance totals" />
        <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
          <h2 className="text-lg font-bold">VIP picks</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {catalog
              .filter((item) => item.isVip)
              .map((item) => {
                const prediction = predictions.find(
                  (row) => row.constituencyId === item.id
                );
                const candidate = item.candidates.find(
                  (row) => row.candidateId === prediction?.predictedCandidateId
                );

                return (
                  <div key={item.id} className="rounded-md border border-line p-3">
                    <p className="font-semibold">{item.name}</p>
                    <p className="mt-1 text-sm text-ink/65">
                      {candidate
                        ? `${candidate.candidateName} · ${candidate.partyCode}`
                        : "No pick yet"}
                    </p>
                  </div>
                );
              })}
          </div>
        </section>
        <FinalSubmissionPanel
          election={election}
          electionCode={params.electionCode}
          progress={progress}
        />
      </div>
    </Shell>
  );
}
