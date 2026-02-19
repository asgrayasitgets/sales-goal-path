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
  if (!match) return "";

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
function sumRange(grid: string[][], startCell: string, endCell: string): number {
  const start = startCell.match(/^([A-Z]+)(\d+)$/);
  const end = endCell.match(/^([A-Z]+)(\d+)$/);
  if (!start || !end) return 0;

  const colStart = start[1];
  const rowStart = parseInt(start[2], 10);
  const colEnd = end[1];
  const rowEnd = parseInt(end[2], 10);

  // This simple version expects same column (B..B, C..C)
  if (colStart !== colEnd) return 0;

  let total = 0;
  for (let r = rowStart; r <= rowEnd; r++) {
    const cell = `${colStart}${r}`;
    total += toNumber(getCell(grid, cell)) ?? 0;
  }
  return total;
}
function getRangeNumbers(
  grid: string[][],
  startCell: string,
  endCell: string
): number[] {
  const start = startCell.match(/^([A-Z]+)(\d+)$/);
  const end = endCell.match(/^([A-Z]+)(\d+)$/);
  if (!start || !end) return [];

  const colLetters = start[1];
  const startRow = parseInt(start[2], 10);
  const endRow = parseInt(end[2], 10);

  const values: number[] = [];
  for (let r = startRow; r <= endRow; r++) {
    const cell = `${colLetters}${r}`;
    const n = toNumber(getCell(grid, cell));
    values.push(n ?? 0);
  }

  return values;
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

  const monthlyActual = getRangeNumbers(grid, "C40", "C51");
  const monthlyLastYear = getRangeNumbers(grid, "D40", "D51");
const ytdActualRevenue = sumRange(grid, "C57", "C64");
const ytdExpectedRevenue = sumRange(grid, "B57", "B64");
  const monthlyLabels = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  return NextResponse.json({
    salesGoalAnnual,
    salesYTD,
    lastYearRevenue,
    percentOfGoal,
    ytdActualRevenue,
ytdExpectedRevenue,
mappedCells: {
  // keep your existing mappedCells if you have them
  ytdActualRevenue: "C57:C64",
  ytdExpectedRevenue: "B57:B64"
},
    monthly: {
      labels: monthlyLabels,
      actual: monthlyActual,
      lastYear: monthlyLastYear
    },
    fetchedAt: new Date().toISOString()
  });
}
