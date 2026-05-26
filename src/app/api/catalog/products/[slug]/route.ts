import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: { slug: string } }) {
  const base = process.env.BACKEND_API_BASE;
  if (!base) {
    return NextResponse.json({ error: "BACKEND_API_BASE not set" }, { status: 500 });
  }

  const slug = ctx.params.slug;
  const r = await fetch(`${base.replace(/\/$/, "")}/catalog/products/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });

  const text = await r.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  return NextResponse.json(data, { status: r.status });
}
