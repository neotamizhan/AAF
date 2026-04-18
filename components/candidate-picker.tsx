"use client";

import { useEffect, useState, useTransition } from "react";
import { savePredictionAction } from "@/app/actions";
import { Button, LinkButton } from "@/components/ui";
import type {
  CandidateOption,
  ConstituencyCatalogItem,
  Election,
  Prediction
} from "@/lib/types";

const storagePrefix = "tn-election-contest:prediction";

function storageKey(electionId: string, constituencyId: string) {
  return `${storagePrefix}:${electionId}:${constituencyId}`;
}

export function CandidatePicker({
  election,
  electionCode,
  constituency,
  prediction,
  previousHref,
  nextHref
}: {
  election: Election;
  electionCode: string;
  constituency: ConstituencyCatalogItem;
  prediction: Prediction | undefined;
  previousHref?: string;
  nextHref?: string;
}) {
  const [selectedCandidateId, setSelectedCandidateId] = useState(
    prediction?.predictedCandidateId ?? ""
  );
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedCandidate = constituency.candidates.find(
    (candidate) => candidate.candidateId === selectedCandidateId
  );
  const isLocked = election.status !== "open";

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey(election.id, constituency.id));
    if (stored) {
      setSelectedCandidateId(stored);
    }
  }, [constituency.id, election.id]);

  function save(option?: CandidateOption) {
    const target = option ?? selectedCandidate;
    if (!target) return;

    window.localStorage.setItem(
      storageKey(election.id, constituency.id),
      target.candidateId
    );

    startTransition(async () => {
      const result = await savePredictionAction({
        electionId: election.id,
        electionCode,
        constituencyId: constituency.id,
        candidateId: target.candidateId,
        partyId: target.partyId,
        allianceId: target.allianceId
      });
      setMessage(result.message);
    });
  }

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
      <fieldset disabled={isLocked || isPending} className="grid gap-3">
        <legend className="mb-3 text-lg font-bold">Current candidates</legend>
        {constituency.candidates.map((candidate) => {
          const checked = selectedCandidateId === candidate.candidateId;

          return (
            <label
              key={candidate.candidateId}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                checked
                  ? "border-leaf bg-leaf/10"
                  : "border-line bg-white hover:border-ink/30"
              }`}
            >
              <input
                type="radio"
                name="candidate"
                value={candidate.candidateId}
                checked={checked}
                onChange={() => {
                  setSelectedCandidateId(candidate.candidateId);
                  save(candidate);
                }}
                className="mt-1 h-4 w-4 accent-leaf"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{candidate.candidateName}</span>
                <span className="mt-1 block text-sm text-ink/65">
                  {candidate.partyCode} · {candidate.allianceName}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-h-6 text-sm font-medium text-ink/65">
          {isPending ? "Saving..." : message}
        </p>
        <div className="flex flex-wrap gap-2">
          {previousHref ? (
            <LinkButton href={previousHref} variant="secondary">
              Previous
            </LinkButton>
          ) : null}
          <Button onClick={() => save()} disabled={!selectedCandidate || isLocked}>
            Save
          </Button>
          {nextHref ? (
            <LinkButton href={nextHref} variant="secondary">
              Next
            </LinkButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}
