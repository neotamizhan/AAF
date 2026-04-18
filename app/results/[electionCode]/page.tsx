import { notFound } from "next/navigation";
import Link from "next/link";
import { SeatSummary } from "@/components/seat-summary";
import { SectionHeader, Shell } from "@/components/ui";
import {
  getActualResults,
  getAlliances,
  getConstituencyCatalog,
  getElectionByCode,
  getLeaderboard,
  getUserPredictions,
  summarizeActualSeats
} from "@/lib/data/adapter";

export default async function ResultsPage({
  params
}: {
  params: { electionCode: string };
}) {
  const election = await getElectionByCode(params.electionCode);
  if (!election) notFound();

  const [alliances, results, leaderboard, catalog, predictions] = await Promise.all([
    getAlliances(),
    getActualResults(election.id),
    getLeaderboard(election.id),
    getConstituencyCatalog(params.electionCode),
    getUserPredictions(election.id)
  ]);
  const actualSummary = summarizeActualSeats(alliances, results);

  return (
    <Shell>
      <SectionHeader
        eyebrow={election.name}
        title="Results and leaderboard"
        description="Official result imports drive actual seat totals, user score, and public rankings."
      />
      <div className="grid gap-5">
        <SeatSummary rows={actualSummary} title="Actual seat summary" />
        <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
          <h2 className="text-lg font-bold">Leaderboard</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-ink/60">
                  <th className="py-3 pr-3">Rank</th>
                  <th className="py-3 pr-3">Player</th>
                  <th className="py-3 pr-3">Score</th>
                  <th className="py-3 pr-3">VIP hits</th>
                  <th className="py-3">Exact seat groups</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row) => (
                  <tr key={`${row.electionId}-${row.rank}`} className="border-b border-line">
                    <td className="py-3 pr-3 font-bold">{row.rank}</td>
                    <td className="py-3 pr-3">{row.displayName}</td>
                    <td className="py-3 pr-3 font-bold">{row.totalScore}</td>
                    <td className="py-3 pr-3">{row.vipHits}</td>
                    <td className="py-3">{row.exactAllianceDistributionHits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
          <h2 className="text-lg font-bold">Constituency result review</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.map((item) => {
              const result = results.find((row) => row.constituencyId === item.id);
              const prediction = predictions.find(
                (row) => row.constituencyId === item.id
              );
              const predictedCandidate = item.candidates.find(
                (row) => row.candidateId === prediction?.predictedCandidateId
              );

              return (
                <Link
                  key={item.id}
                  href={`/results/${params.electionCode}/constituency/${item.id}`}
                  className="focus-ring rounded-md border border-line bg-paper p-3 text-sm hover:border-ink/30"
                >
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-ink/65">
                    Pick: {predictedCandidate?.candidateName ?? "No prediction"}
                  </p>
                  <p className="mt-1 text-ink/65">
                    Result: {result?.winningCandidateName ?? "Not imported"}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </Shell>
  );
}
