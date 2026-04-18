import { CheckCircle2, Clock, LockKeyhole } from "lucide-react";
import type { Election, PredictionProgress } from "@/lib/types";

export function ProgressPanel({
  election,
  progress
}: {
  election: Election;
  progress: PredictionProgress;
}) {
  const percent =
    progress.total === 0 ? 0 : Math.round((progress.completed / progress.total) * 100);
  const lockLabel = election.lockAt
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata"
      }).format(new Date(election.lockAt))
    : "Not scheduled";

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink/60">Prediction progress</p>
          <p className="mt-1 text-2xl font-bold">
            {progress.completed} / {progress.total} constituencies
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="inline-flex items-center gap-2 rounded-md bg-paper px-3 py-2 font-medium">
            <Clock className="h-4 w-4 text-river" aria-hidden />
            Locks {lockLabel}
          </span>
          <span className="inline-flex items-center gap-2 rounded-md bg-paper px-3 py-2 font-medium">
            {progress.isFinal ? (
              <LockKeyhole className="h-4 w-4 text-ember" aria-hidden />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-leaf" aria-hidden />
            )}
            {progress.isFinal ? "Final submitted" : "Draft editable"}
          </span>
        </div>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-md bg-paper">
        <div
          className="h-full rounded-md bg-leaf transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-ink/65">
        {percent}% complete. Final submission unlocks after every constituency has a
        saved winner.
      </p>
    </section>
  );
}
