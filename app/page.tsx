import { ArrowRight, BarChart3, ShieldCheck, Vote } from "lucide-react";
import { LinkButton, Shell } from "@/components/ui";
import {
  getAlliances,
  getConstituencyCatalog,
  getElectionByCode
} from "@/lib/data/adapter";

const assemblyImage =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/TamilNaduAssembly.svg/1280px-TamilNaduAssembly.svg.png";

export default async function HomePage() {
  const election = await getElectionByCode("tn-2026");
  const [catalog, alliances] = await Promise.all([
    getConstituencyCatalog("tn-2026"),
    getAlliances()
  ]);

  return (
    <>
      <section
        className="relative min-h-[72vh] border-b border-line bg-ink text-white"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(23,23,23,0.92), rgba(23,23,23,0.72), rgba(23,23,23,0.45)), url(${assemblyImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover"
        }}
      >
        <div className="mx-auto flex min-h-[72vh] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase text-sun">
              Tamil Nadu Assembly Election Contest
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Predict every Assembly Constituency winner.
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/82">
              Pick one winner in each seat, watch your alliance totals move, lock
              your final entry, and compare scores after official results.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/contest/tn-2026/constituencies">
                Start predictions
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </LinkButton>
              <LinkButton href="/login" variant="secondary">
                Sign in with Google
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <Shell>
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-line bg-white p-5 shadow-panel">
            <Vote className="h-7 w-7 text-leaf" aria-hidden />
            <p className="mt-4 text-3xl font-bold">{catalog.length}</p>
            <p className="mt-1 text-sm text-ink/65">Constituencies loaded</p>
          </div>
          <div className="rounded-lg border border-line bg-white p-5 shadow-panel">
            <BarChart3 className="h-7 w-7 text-river" aria-hidden />
            <p className="mt-4 text-3xl font-bold">{alliances.length}</p>
            <p className="mt-1 text-sm text-ink/65">Contest scoring groups</p>
          </div>
          <div className="rounded-lg border border-line bg-white p-5 shadow-panel">
            <ShieldCheck className="h-7 w-7 text-ember" aria-hidden />
            <p className="mt-4 text-3xl font-bold">
              {election?.status.replace("_", " ") ?? "draft"}
            </p>
            <p className="mt-1 text-sm text-ink/65">Election status</p>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-line bg-white p-6 shadow-panel">
            <h2 className="text-xl font-bold">Contest rules</h2>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-ink/72">
              <p>Correct winning alliance: 10 points.</p>
              <p>Actual winning alliance seat count: 10, 5, or 2 points.</p>
              <p>Every alliance seat count: 5, 3, or 1 point.</p>
              <p>Each correct VIP winner: 2 points.</p>
            </div>
          </div>
          <div className="rounded-lg border border-line bg-white p-6 shadow-panel">
            <h2 className="text-xl font-bold">Submission rule</h2>
            <p className="mt-4 text-sm leading-6 text-ink/72">
              Drafts are editable. Final submission is enabled only when every
              constituency has one predicted winner and is then locked by the server.
            </p>
          </div>
        </section>
      </Shell>
    </>
  );
}
