import { NextResponse } from "next/server";

function csvToGrid(csvText: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    const next = csvText[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      cur += '"';
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      row.push(cur);
      cur = "";
      continue;
    }
    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
      continue;
    }
    cur += ch;
  }

  row.push(cur);
  rows.push(row);

  return rows;
}

function getCell(grid: string[][], a1: string): string {
  const match = a1.match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error(`Invalid A1 cell: ${a1}`);

  const colLetters = match[1];
  const rowNumber = parseInt(match[2], 10);

  let colNumber = 0;
  for (let i = 0; i < colLetters.length; i++) {
    colNumber = colNumber * 26 + (colLetters.charCodeAt(i) - 64);
  }

  const r = rowNumber - 1;
  const c = colNumber - 1;

  return (grid[r]?.[c] ?? "").trim();
}

function toNumber(value: string): number | null {
  const cleaned = value.replace(/\$/g, "").replace(/,/g, "").trim();
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export async function GET() {
  const url = process.env.DASHBOARD_CSV_URL;

  if (!url) {
    return NextResponse.json(
      { error: "Missing env var: DASHBOARD_CSV_URL" },
      { status: 500 }
    );
  }

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Failed to fetch CSV (${res.status})` },
      { status: 500 }
    );
  }

  const csvText = await res.text();
  const grid = csvToGrid(csvText);

  const salesGoalAnnual = toNumber(getCell(grid, "C3"));
  const percentOfGoal = toNumber(getCell(grid, "C5"));
  const lastYearRevenue = toNumber(getCell(grid, "C6"));
  const salesYTD = toNumber(getCell(grid, "C52"));

  return NextResponse.json({
    salesGoalAnnual,
    salesYTD,
    lastYearRevenue,
    percentOfGoal,
    source: "google_sheet_csv",
    mappedCells: {
      salesGoalAnnual: "C3",
      percentOfGoal: "C5",
      lastYearRevenue: "C6",
      salesYTD: "C52"
    },
    fetchedAt: new Date().toISOString()
  });
}
