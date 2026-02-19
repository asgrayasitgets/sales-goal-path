"use client";

import { useEffect, useMemo, useState } from "react";

type DashboardData = {
  salesGoalAnnual: number | null;
  salesYTD: number | null;
  lastYearRevenue: number | null;
  percentOfGoal: number | null;
  monthly?: {
    labels: string[];
    actual: number[];
    lastYear: number[];
  };
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

function Sparkline({ values }: { values: number[] }) {
  const w = 260;
  const h = 60;
  const pad = 6;

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);

  const scaleX = (i: number) => pad + (i * (w - pad * 2)) / Math.max(values.length - 1, 1);
  const scaleY = (v: number) => {
    if (max === min) return h / 2;
    return pad + (h - pad * 2) * (1 - (v - min) / (max - min));
  };

  const points = values.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function GoalGauge({
  percent,
  subtitle,
}: {
  percent: number | null;
  subtitle: string;
}) {
  const pct = percent ?? 0;
  const clamped = Math.max(0, Math.min(pct, 1.2)); // allow up to 120% for "above"
  const radius = 44;
  const stroke = 10;
  const cx = 56;
  const cy = 56;
  const circumference = 2 * Math.PI * radius;

  const progress = Math.min(clamped / 1.0, 1); // ring fills to 100%, above shown as badge
  const dash = circumference * (1 - progress);

  const zone = pct >= 1 ? "Above Target" : pct >= 0.8 ? "On Track" : "Below Target";

  return (
    <div className="rounded-2xl bg-[var(--pe-card)] p-5 shadow-sm border border-black/5">
      <div className="text-sm font-semibold tracking-wide text-black/60">
        Goal Gauge
      </div>

      <div className="mt-3 flex items-center gap-4">
        <svg width="112" height="112" viewBox="0 0 112 112" className="shrink-0">
          {/* background ring */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(0,0,0,0.10)"
            strokeWidth={stroke}
          />

          {/* progress ring */}
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

          {/* center text */}
          <text
            x="56"
            y="56"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="20"
            fontWeight="800"
            fill="rgba(0,0,0,0.85)"
          >
            {percent === null ? "—" : `${Math.round(pct * 100)}%`}
          </text>
          <text
            x="56"
            y="74"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="600"
            fill="rgba(0,0,0,0.55)"
          >
            {zone}
          </text>
        </svg>

        <div className="min-w-0">
          <div className="text-sm font-bold text-[var(--pe-black)]">{zone}</div>
          <div className="mt-1 text-sm text-black/60">{subtitle}</div>

          {pct > 1 ? (
            <div className="mt-2 inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-[var(--pe-black)] border border-black/10">
              +{Math.round((pct - 1) * 100)}% above goal pace
            </div>
          ) : null}
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
  <GoalGauge percent={data?.percentOfGoal ?? null} subtitle={gaugeSubtitle} />
</div>
        {data?.monthly?.actual ? (
  <div className="mt-4 rounded-2xl bg-[var(--pe-card)] p-5 shadow-sm border border-black/5">
    <div className="flex items-baseline justify-between">
      <div className="text-sm font-semibold tracking-wide text-black/60">
        
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
