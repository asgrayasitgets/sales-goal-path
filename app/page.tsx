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
    <div className="rounded-2xl bg-[var(--pe-card)] p-5 shadow-sm border border-black/5 min-w-0">
      <div className="text-sm font-semibold tracking-wide text-black/60">
        {label}
      </div>
      <div className="mt-2 font-extrabold leading-none text-[var(--pe-black)] tracking-tight whitespace-nowrap text-[clamp(1.2rem,3.4vw,2rem)]">
        {value}
      </div>
    </div>
  );
}

function GoalGauge({
  salesYTD,
  salesGoalAnnual,
  subtitle,
}: {
  salesYTD: number | null;
  salesGoalAnnual: number | null;
  subtitle: string;
}) {
  const pct =
    salesYTD != null && salesGoalAnnual != null && salesGoalAnnual > 0
      ? salesYTD / salesGoalAnnual
      : null;

  // Expected progress by today's date (pace)
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);
  const dayOfYear =
    Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
  const daysInYear = Math.floor((end.getTime() - start.getTime()) / 86400000);

  const expected = dayOfYear / daysInYear;

  // Pace status with cushion
  const cushion = 0.02; // 2% of annual goal
  const status =
    pct == null
      ? "—"
      : pct >= expected + cushion
      ? "Ahead of Pace"
      : pct <= expected - cushion
      ? "Behind Pace"
      : "On Pace";

  const radius = 44;
  const stroke = 10;
  const cx = 56;
  const cy = 56;
  const circumference = 2 * Math.PI * radius;

  const clamped = pct == null ? 0 : Math.max(0, Math.min(pct, 1.2));
  const progress = Math.min(clamped, 1);
  const dash = circumference * (1 - progress);

  const actualText = pct == null ? "—" : `${Math.round(pct * 100)}%`;
  const expectedText = `${Math.round(expected * 100)}%`;
  const deltaText =
    pct == null
      ? "—"
      : `${pct >= expected ? "+" : ""}${Math.round((pct - expected) * 100)}%`;

  return (
    <div className="rounded-2xl bg-[var(--pe-card)] p-5 shadow-sm border border-black/5">
      <div className="text-sm font-semibold tracking-wide text-black/60">
        Pace Gauge (Today)
      </div>

      <div className="mt-3 flex items-center gap-4">
        <svg width="112" height="112" viewBox="0 0 112 112" className="shrink-0">
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(0,0,0,0.10)"
            strokeWidth={stroke}
          />

          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-[var(--pe-orange)]"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dash}
            transform={`rotate(-90 ${cx} ${cy})`}
          />

          <text
            x="56"
            y="54"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="20"
            fontWeight="800"
            fill="rgba(0,0,0,0.85)"
          >
            {actualText}
          </text>
          <text
            x="56"
            y="74"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="700"
            fill="rgba(0,0,0,0.55)"
          >
            {status}
          </text>
        </svg>

        <div className="min-w-0">
          <div className="text-sm font-extrabold text-[var(--pe-black)]">
            {status}
          </div>

          <div className="mt-1 text-sm text-black/60">{subtitle}</div>

          <div className="mt-2 text-xs text-black/55 space-y-1">
            <div>
              Expected by today:{" "}
              <span className="font-bold">{expectedText}</span>
            </div>
            <div>
              Pace difference: <span className="font-bold">{deltaText}</span>
            </div>
          </div>
        </div>
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

  const gaugeSubtitle =
    data?.salesYTD != null && data?.salesGoalAnnual != null
      ? `${formatMoney(data.salesYTD)} of ${formatMoney(data.salesGoalAnnual)}`
      : "—";

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

        <div className="mt-4">
          <GoalGauge
            salesYTD={data?.salesYTD ?? null}
            salesGoalAnnual={data?.salesGoalAnnual ?? null}
            subtitle={gaugeSubtitle}
          />
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
