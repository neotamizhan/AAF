import { notFound } from "next/navigation";
import { ConstituencyList } from "@/components/constituency-list";
import { LinkButton, SectionHeader, Shell } from "@/components/ui";
import {
  getConstituencyCatalog,
  getElectionByCode,
  getUserPredictions
} from "@/lib/data/adapter";

export default async function ConstituenciesPage({
  params
}: {
  params: { electionCode: string };
}) {
  const election = await getElectionByCode(params.electionCode);
  if (!election) notFound();

  const [catalog, predictions] = await Promise.all([
    getConstituencyCatalog(params.electionCode),
    getUserPredictions(election.id)
  ]);

  return (
    <Shell>
      <SectionHeader
        eyebrow={election.name}
        title="Constituencies"
        description="Filter by name, district, zone, and VIP status. Open a seat to choose one predicted winner."
        actions={
          <LinkButton href={`/contest/${params.electionCode}/summary`} variant="secondary">
            View summary
          </LinkButton>
        }
      />
      <ConstituencyList
        electionCode={params.electionCode}
        constituencies={catalog}
        predictions={predictions}
      />
    </Shell>
  );
}
