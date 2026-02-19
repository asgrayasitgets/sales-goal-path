"use client";

import { useEffect, useMemo, useState } from "react";

type MonthlyWeeklyBlock = {
  revenue: { target: number | null; actual: number | null };
  quotesCount: { target: number | null; actual: number | null };
  quotesValue: { target: number | null; actual: number | null };
  sourceRow: number;
};

type DashboardData = {
  salesGoalAnnual: number | null;
  salesYTD: number | null;
  lastYearRevenue: number | null;
  percentOfGoal: number | null;

  ytdActualRevenue: number;
  ytdExpectedRevenue: number;

  monthly: ({ month: string } & MonthlyWeeklyBlock) | null;
  weekly: ({ weekEnding: string } & MonthlyWeeklyBlock) | null;

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

function formatInt(n: number | null) {
  if (n === null) return "—";
  return Math.round(n).toLocaleString();
}

function formatPercent(n: number | null) {
  if (n === null) return "—";
  return new Intl.NumberFormat("en-CA", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(n);
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[var(--pe-card)] p-5 shadow-sm border border-black/5 min-w-0">
      <div className="text-sm font-semibold tracking-wide text-black/60">{label}</div>
      <div className="mt-2 font-extrabold leading-none text-[var(--pe-black)] tracking-tight whitespace-nowrap text-[clamp(1.1rem,3.2vw,1.9rem)]">
        {value}
      </div>
    </div>
  );
}
function StatusChip({
  status,
}: {
  status: "Ahead" | "On Pace" | "Behind";
}) {
  const styles =
    status === "Ahead"
      ? "bg-green-100 text-green-900 border-green-200"
      : status === "Behind"
      ? "bg-red-100 text-red-900 border-red-200"
      : "bg-yellow-100 text-yellow-900 border-yellow-200";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${styles}`}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

function MetricRow({
  title,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  status,
  accent = "orange",
}: {
  title: string;
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  status: "Ahead" | "On Pace" | "Behind";
  accent?: "orange" | "black";
}) {
  const accentBar =
    accent === "orange" ? "bg-[var(--pe-orange)]" : "bg-[var(--pe-black)]";

  return (
    <div className="rounded-2xl bg-[var(--pe-card)] p-5 shadow-sm border border-black/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-black/70">{title}</div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-black/50">
                {leftLabel}
              </div>
              <div className="mt-1 text-lg font-extrabold text-[var(--pe-black)]">
                {leftValue}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-black/50">
                {rightLabel}
              </div>
              <div className="mt-1 text-lg font-extrabold text-[var(--pe-black)]">
                {rightValue}
              </div>
            </div>
          </div>
        </div>

        <StatusChip status={status} />
      </div>

      <div className="mt-4 h-1.5 w-full rounded-full bg-black/5 overflow-hidden">
        <div className={`h-full w-1/2 ${accentBar} rounded-full`} />
      </div>
    </div>
  );
}
function PaceGauge({
  actualYTD,
  expectedYTD,
  annualGoal,
}: {
  actualYTD: number | null;
  expectedYTD: number | null;
  annualGoal: number | null;
}) {
  const actual = actualYTD ?? null;
  const expected = expectedYTD ?? null;

  const cushionPct = 0.02; // 2%
  const status =
    actual == null || expected == null
      ? "—"
      : actual >= expected * (1 + cushionPct)
      ? "Ahead of Pace"
      : actual <= expected * (1 - cushionPct)
      ? "Behind Pace"
      : "On Pace";

  const pctOfAnnual =
    actual != null && annualGoal != null && annualGoal > 0 ? actual / annualGoal : null;

  const radius = 44;
  const stroke = 10;
  const cx = 56;
  const cy = 56;
  const circumference = 2 * Math.PI * radius;

  const clamped = pctOfAnnual == null ? 0 : Math.max(0, Math.min(pctOfAnnual, 1.2));
  const progress = Math.min(clamped, 1);
  const dash = circumference * (1 - progress);

  const actualText = pctOfAnnual == null ? "—" : `${Math.round(pctOfAnnual * 100)}%`;
  const diff = actual == null || expected == null ? null : actual - expected;

  return (
    <div className="rounded-2xl bg-[var(--pe-card)] p-5 shadow-sm border border-black/5">
      <div className="text-sm font-semibold tracking-wide text-black/60">
        Pace Gauge (Plan vs Actual)
      </div>

      <div className="mt-3 flex items-center gap-4">
        <svg width="112" height="112" viewBox="0 0 112 112" className="shrink-0">
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth={stroke} />
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
          <text x="56" y="54" textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="800" fill="rgba(0,0,0,0.85)">
            {actualText}
          </text>
          <text x="56" y="74" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill="rgba(0,0,0,0.55)">
            {status}
          </text>
        </svg>

        <div className="min-w-0">
          <div className="text-sm font-extrabold text-[var(--pe-black)]">{status}</div>
          <div className="mt-1 text-sm text-black/60">
            Actual YTD: <span className="font-bold">{formatMoney(actual)}</span>
          </div>
          <div className="mt-1 text-sm text-black/60">
            Expected YTD: <span className="font-bold">{formatMoney(expected)}</span>
          </div>
          <div className="mt-2 text-xs text-black/55">
            Difference: <span className="font-bold">{diff == null ? "—" : formatMoney(diff)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
function getStatus(actual: number | null, target: number | null) {
  if (actual == null || target == null || target === 0) return "On Pace" as const;
  const ratio = actual / target;

  if (ratio >= 1.05) return "Ahead" as const;
  if (ratio <= 0.95) return "Behind" as const;
  return "On Pace" as const;
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
    setData(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  const cards = useMemo(() => {
    if (!data) return [];

    if (tab === "Monthly") {
      const m = data.monthly;
      return [
        {
          label: `Revenue (${m?.month ?? "This Month"})`,
          value: `${formatMoney(m?.revenue.actual ?? null)} / ${formatMoney(m?.revenue.target ?? null)}`,
        },
        {
          label: `Quotes Count (${m?.month ?? "This Month"})`,
          value: `${formatInt(m?.quotesCount.actual ?? null)} / ${formatInt(m?.quotesCount.target ?? null)}`,
        },
        {
          label: `Quotes Value (${m?.month ?? "This Month"})`,
          value: `${formatMoney(m?.quotesValue.actual ?? null)} / ${formatMoney(m?.quotesValue.target ?? null)}`,
        },
      ];
    }

    if (tab === "Weekly") {
      const w = data.weekly;
      const title = w?.weekEnding ? `Week Ending ${w.weekEnding}` : "This Week";
      return [
        {
          label: `Revenue (${title})`,
          value: `${formatMoney(w?.revenue.actual ?? null)} / ${formatMoney(w?.revenue.target ?? null)}`,
        },
        {
          label: `Quotes Count (${title})`,
          value: `${formatInt(w?.quotesCount.actual ?? null)} / ${formatInt(w?.quotesCount.target ?? null)}`,
        },
        {
          label: `Quotes Value (${title})`,
          value: `${formatMoney(w?.quotesValue.actual ?? null)} / ${formatMoney(w?.quotesValue.target ?? null)}`,
        },
      ];
    }

    // YTD default
    return [
      { label: "Sales Goal (Annual)", value: formatMoney(data.salesGoalAnnual) },
      { label: "Sales YTD", value: formatMoney(data.salesYTD) },
      { label: "Last Year Revenue", value: formatMoney(data.lastYearRevenue) },
      { label: "% of Goal", value: formatPercent(data.percentOfGoal) },
    ];
  }, [data, tab]);

  return (
    <main className="min-h-screen bg-[var(--pe-beige)] p-5">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl bg-white/60 p-5 border border-black/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-2xl font-extrabold text-[var(--pe-black)]">Sales Goal Path</div>
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

        {/* KPI cards */}
       <div className="mt-5 grid grid-cols-2 gap-3">
  {cards.map((c) => (
    <Card key={c.label} label={c.label} value={c.value} />
  ))}
</div>
          

        {/* Gauge only on YTD */}
        {tab === "YTD" ? (
          <div className="mt-4">
            <PaceGauge
              actualYTD={data?.ytdActualRevenue ?? null}
              expectedYTD={data?.ytdExpectedRevenue ?? null}
              annualGoal={data?.salesGoalAnnual ?? null}
            />
          </div>
        ) : null}

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
