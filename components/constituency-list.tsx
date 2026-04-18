"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { ConstituencyCatalogItem, Prediction } from "@/lib/types";
import { StatusChip } from "@/components/status-chip";

export function ConstituencyList({
  electionCode,
  constituencies,
  predictions
}: {
  electionCode: string;
  constituencies: ConstituencyCatalogItem[];
  predictions: Prediction[];
}) {
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("all");
  const [zone, setZone] = useState("all");
  const [vipOnly, setVipOnly] = useState(false);

  const predictedIds = useMemo(
    () => new Set(predictions.map((prediction) => prediction.constituencyId)),
    [predictions]
  );
  const districts = useMemo(
    () => Array.from(new Set(constituencies.map((item) => item.districtName))).sort(),
    [constituencies]
  );
  const zones = useMemo(
    () => Array.from(new Set(constituencies.map((item) => item.zoneName))).sort(),
    [constituencies]
  );

  const filtered = constituencies.filter((item) => {
    const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
    const matchesDistrict = district === "all" || item.districtName === district;
    const matchesZone = zone === "all" || item.zoneName === zone;
    const matchesVip = !vipOnly || item.isVip;
    return matchesQuery && matchesDistrict && matchesZone && matchesVip;
  });

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-lg border border-line bg-white p-4 shadow-panel lg:sticky lg:top-24 lg:self-start">
        <h2 className="text-base font-bold">Filters</h2>
        <label className="mt-4 block text-sm font-semibold" htmlFor="constituency-search">
          Name
        </label>
        <div className="mt-2 flex min-h-11 items-center gap-2 rounded-md border border-line bg-paper px-3">
          <Search className="h-4 w-4 text-ink/55" aria-hidden />
          <input
            id="constituency-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search constituency"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <label className="mt-4 block text-sm font-semibold" htmlFor="district-filter">
          District
        </label>
        <select
          id="district-filter"
          value={district}
          onChange={(event) => setDistrict(event.target.value)}
          className="focus-ring mt-2 min-h-11 w-full rounded-md border border-line bg-paper px-3 text-sm"
        >
          <option value="all">All districts</option>
          {districts.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label className="mt-4 block text-sm font-semibold" htmlFor="zone-filter">
          Zone
        </label>
        <select
          id="zone-filter"
          value={zone}
          onChange={(event) => setZone(event.target.value)}
          className="focus-ring mt-2 min-h-11 w-full rounded-md border border-line bg-paper px-3 text-sm"
        >
          <option value="all">All zones</option>
          {zones.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-line bg-paper px-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={vipOnly}
            onChange={(event) => setVipOnly(event.target.checked)}
            className="h-4 w-4 accent-leaf"
          />
          VIP constituencies only
        </label>
      </aside>

      <section aria-label="Constituencies" className="grid gap-3">
        <p className="text-sm font-medium text-ink/65">
          Showing {filtered.length} of {constituencies.length} constituencies
        </p>
        {filtered.map((item) => {
          const isSaved = predictedIds.has(item.id);

          return (
            <Link
              key={item.id}
              href={`/contest/${electionCode}/constituency/${item.id}`}
              className="focus-ring rounded-lg border border-line bg-white p-4 shadow-panel transition hover:-translate-y-0.5 hover:border-ink/25"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold uppercase text-ink/50">
                      {item.ecCode}
                    </p>
                    {item.isVip ? <StatusChip status="vip" /> : null}
                    <StatusChip status={isSaved ? "saved" : "not_started"} />
                  </div>
                  <h2 className="mt-2 text-lg font-bold">{item.name}</h2>
                  <p className="mt-1 text-sm text-ink/65">
                    {item.districtName} district · {item.zoneName} zone
                  </p>
                </div>
                <div className="text-sm font-semibold text-river">
                  Pick winner
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
