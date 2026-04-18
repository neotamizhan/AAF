"use client";

import { useState, useTransition } from "react";
import { finalizeSubmissionAction } from "@/app/actions";
import { Button } from "@/components/ui";
import type { Election, PredictionProgress } from "@/lib/types";

export function FinalSubmissionPanel({
  election,
  electionCode,
  progress
}: {
  election: Election;
  electionCode: string;
  progress: PredictionProgress;
}) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const canFinalize =
    election.status === "open" &&
    !progress.isFinal &&
    progress.total > 0 &&
    progress.completed === progress.total;

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
      <h2 className="text-lg font-bold">Final submission</h2>
      <p className="mt-2 text-sm leading-6 text-ink/70">
        Final submission is irreversible. Drafts stay editable until all entries are
        submitted, the election locks, or you press the final button.
      </p>
      {progress.missing.length > 0 ? (
        <div className="mt-4 rounded-md border border-line bg-paper p-3 text-sm">
          <p className="font-semibold">Missing constituencies</p>
          <p className="mt-1 text-ink/70">
            {progress.missing.slice(0, 8).map((item) => item.name).join(", ")}
            {progress.missing.length > 8 ? "..." : ""}
          </p>
        </div>
      ) : null}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-h-6 text-sm font-medium text-ink/65">
          {isPending ? "Submitting..." : message}
        </p>
        <Button
          disabled={!canFinalize || isPending}
          onClick={() => {
            startTransition(async () => {
              const result = await finalizeSubmissionAction(electionCode, election.id);
              setMessage(result.message);
            });
          }}
        >
          Submit final predictions
        </Button>
      </div>
    </section>
  );
}
