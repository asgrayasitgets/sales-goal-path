"use client";

import { useEffect, useMemo, useState } from "react";

type DashboardData = {
  salesGoalAnnual: number | null;
  salesYTD: number | null;
  lastYearRevenue: number | null;
  percentOfGoal: number | null;
  fetchedAt: string;
};

function formatMoney(n: number | null) {
  if (n === null) return "—";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatPercent(n: number | null) {
  if (n === null) return "—";
  const value = n > 1 ? n / 100 : n;
  return new Intl.NumberFormat("en-CA", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value);
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[var(--pe-card)] p-5 shadow-sm border border-black/5">
      <div className="text-sm font-semibold tracking-wide text-black/60">
        {label}
      </div>
      <div className="mt-2 text-3xl sm:text-4xl font-extrabold leading-none text-[var(--pe-black)] break-words">
        {value}
      </div>
    </div>
  );
}

export default function Page() {
  const [tab, setTab] = useState<"YTD" | "Monthly" | "Weekly">("YTD");
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    const res = await fetch("/api/dashboard-data", { cache: "no-store" });
    if (!res.ok) {
      setError("Could not load dashboard data.");
      return;
    }
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    load();
  }, []);

  const cards = useMemo(() => {
    if (!data) return [];
    return [
      { label: "Sales Goal (Annual)", value: formatMoney(data.salesGoalAnnual) },
      { label: "Sales YTD", value: formatMoney(data.salesYTD) },
      { label: "Last Year Revenue", value: formatMoney(data.lastYearRevenue) },
      { label: "% of Goal", value: formatPercent(data.percentOfGoal) },
    ];
  }, [data]);

  return (
    <main className="min-h-screen bg-[var(--pe-beige)] p-5">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl bg-white/60 p-5 border border-black/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-2xl font-extrabold text-[var(--pe-black)]">
                Sales Goal Path
              </div>
              <div className="mt-1 text-sm text-black/60">
                Live dashboard powered by Google Sheet data
              </div>
            </div>

            <button
              onClick={load}
              className="rounded-full bg-[var(--pe-orange)] px-4 py-2 text-sm font-bold text-white shadow-sm"
            >
              Refresh
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            {(["YTD", "Monthly", "Weekly"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  "flex-1 rounded-full px-3 py-2 text-sm font-bold",
                  tab === t
                    ? "bg-[var(--pe-black)] text-white"
                    : "bg-white/80 text-[var(--pe-black)] border border-black/10",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {cards.map((c) => (
            <Card key={c.label} label={c.label} value={c.value} />
          ))}
        </div>

        <div className="mt-4 text-xs text-black/50 text-center">
          {error ? (
            <span className="text-red-600">{error}</span>
          ) : data?.fetchedAt ? (
            <>Last updated: {new Date(data.fetchedAt).toLocaleString()}</>
          ) : (
            "Loading…"
          )}
        </div>
      </div>
    </main>
  );
}
