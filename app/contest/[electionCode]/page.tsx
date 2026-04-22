import { notFound } from "next/navigation";
import Link from "next/link";
import { ProgressPanel } from "@/components/progress-panel";
import { SeatSummary } from "@/components/seat-summary";
import { LinkButton, SectionHeader, Shell } from "@/components/ui";
import {
  getAlliances,
  getConstituencyCatalog,
  getElectionByCode,
  getPredictionProgress,
  getUserPredictions,
  groupPredictedSelectionsByAlliance,
  summarizePredictedSeats
} from "@/lib/data/adapter";

export default async function ContestDashboardPage({
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
  const predictedSelectionsByAlliance = groupPredictedSelectionsByAlliance(
    catalog,
    predictions
  );

  return (
    <Shell>
      <SectionHeader
        eyebrow={election.name}
        title="Contest dashboard"
        description="Track prediction progress, missing seats, and your running alliance tally."
        actions={
          <>
            <LinkButton href={`/contest/${params.electionCode}/constituencies`}>
              Resume entry
            </LinkButton>
            <LinkButton href={`/contest/${params.electionCode}/summary`} variant="secondary">
              Review summary
            </LinkButton>
          </>
        }
      />

      <div className="grid gap-5">
        <ProgressPanel election={election} progress={progress} />
        <SeatSummary
          rows={seatSummary}
          title="Predicted seat summary"
          predictedSelectionsByAlliance={predictedSelectionsByAlliance}
        />
        <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
          <h2 className="text-lg font-bold">Missing constituencies</h2>
          {progress.missing.length === 0 ? (
            <p className="mt-3 text-sm text-ink/65">
              Every constituency has a saved prediction.
            </p>
          ) : (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {progress.missing.slice(0, 12).map((item) => (
                <Link
                  key={item.id}
                  href={`/contest/${params.electionCode}/constituency/${item.id}`}
                  className="focus-ring rounded-md border border-line bg-paper px-3 py-2 text-sm font-medium hover:border-ink/30"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}
