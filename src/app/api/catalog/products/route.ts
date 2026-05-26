import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const base = process.env.BACKEND_API_BASE;
  if (!base) {
    return NextResponse.json({ error: "BACKEND_API_BASE not set" }, { status: 500 });
  }

  const r = await fetch(`${base.replace(/\/$/, "")}/catalog/products`, { cache: "no-store" });
  const text = await r.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  return NextResponse.json(data, { status: r.status });
}
