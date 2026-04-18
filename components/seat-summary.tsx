import type { SeatSummaryRow } from "@/lib/types";

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
  totalLabel = "seats"
}: {
  rows: SeatSummaryRow[];
  title: string;
  totalLabel?: string;
}) {
  const total = rows.reduce((sum, row) => sum + row.seats, 0);

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm font-medium text-ink/60">
          {total} {totalLabel}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
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
        ))}
      </div>
    </section>
  );
}
