"use client";

import { useMemo, useState } from "react";
import type { PredictedSelectionsByAlliance, SeatSummaryRow } from "@/lib/types";

const colorByAlliance: Record<string, string> = {
  DMK: "bg-ember text-white",
  ADMK: "bg-leaf text-white",
  NTK: "bg-sun text-ink",
  SPMK: "bg-river text-white",
  TVK: "bg-ink text-white",
  OTH: "bg-paper text-ink"
};

export function SeatSummary({
  rows,
  title,
  totalLabel = "seats",
  predictedSelectionsByAlliance
}: {
  rows: SeatSummaryRow[];
  title: string;
  totalLabel?: string;
  predictedSelectionsByAlliance?: PredictedSelectionsByAlliance;
}) {
  const total = rows.reduce((sum, row) => sum + row.seats, 0);
  const isInteractive = Boolean(predictedSelectionsByAlliance);
  const [selectedAllianceId, setSelectedAllianceId] = useState<string | null>(null);
  const selectedRow = useMemo(
    () => rows.find((row) => row.allianceId === selectedAllianceId),
    [rows, selectedAllianceId]
  );
  const selectedCandidates =
    (selectedAllianceId && predictedSelectionsByAlliance?.[selectedAllianceId]) ?? [];

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm font-medium text-ink/60">
          {total} {totalLabel}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) =>
          isInteractive ? (
            <button
              key={row.allianceId}
              type="button"
              onClick={() =>
                setSelectedAllianceId((current) =>
                  current === row.allianceId ? null : row.allianceId
                )
              }
              className="focus-ring rounded-lg border border-line p-4 text-left transition hover:border-ink/30"
              aria-pressed={selectedAllianceId === row.allianceId}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`rounded-md px-2 py-1 text-xs font-bold ${
                    colorByAlliance[row.allianceCode] ?? "bg-paper text-ink"
                  }`}
                >
                  {row.allianceCode}
                </span>
                <span className="text-3xl font-bold">{row.seats}</span>
              </div>
              <p className="mt-3 text-sm font-medium text-ink/75">{row.allianceName}</p>
            </button>
          ) : (
            <div key={row.allianceId} className="rounded-lg border border-line p-4">
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`rounded-md px-2 py-1 text-xs font-bold ${
                    colorByAlliance[row.allianceCode] ?? "bg-paper text-ink"
                  }`}
                >
                  {row.allianceCode}
                </span>
                <span className="text-3xl font-bold">{row.seats}</span>
              </div>
              <p className="mt-3 text-sm font-medium text-ink/75">{row.allianceName}</p>
            </div>
          )
        )}
      </div>
      {isInteractive && selectedRow ? (
        <section className="mt-4 rounded-lg border border-line bg-paper p-4">
          <h3 className="text-sm font-bold">
            {selectedRow.allianceName} · Selected candidates ({selectedCandidates.length})
          </h3>
          {selectedCandidates.length === 0 ? (
            <p className="mt-2 text-sm text-ink/65">
              No saved candidates for this party yet.
            </p>
          ) : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {selectedCandidates.map((item) => (
                <li
                  key={item.constituencyId}
                  className="rounded-md border border-line bg-white p-3 text-sm"
                >
                  <p className="font-semibold">{item.constituencyName}</p>
                  <p className="mt-1 text-ink/70">{item.candidateName}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </section>
  );
}
