// src/app/api/gift-guide/route.ts
import { NextResponse } from "next/server";

type Payload = {
  ageMin?: number;        // giftee’s age in years
  themeSlugs?: string[];  // optional; if empty we won’t filter by theme
  priceMin?: number;      // cents
  priceMax?: number;      // cents
  experience?: string;    // "Yes, they love it!" | "They've built a few" | "I'm not sure" | "No, this would be their first"
};

type CatalogProduct = {
  sku: string;
  name: string;
  slug: string;
  msrpCents: number;
  isActive: boolean;
  setNumber: number;
  theme?: string | null;
  ageMinimum?: number | null;
  primaryImagePath?: string | null;
  stockLevel?: number | null;
};

// small helper to coerce/clamp inputs
function clamp(n: unknown, lo: number, hi: number, fallback: number) {
  const x = typeof n === "number" && Number.isFinite(n) ? n : fallback;
  return Math.min(Math.max(x, lo), hi);
}

function backendBase(): string {
  return (
    process.env.BACKEND_API_BASE ||
    process.env.NEXT_PUBLIC_BACKEND_BASE ||
    "http://localhost:4000"
  ).replace(/\/$/, "");
}

function joinUrl(base: string, p: string) {
  const clean = p.replace(/^\/+/, "");
  return `${base}/${clean}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`Request failed: ${r.status}`);
  return (await r.json()) as T;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function toAbsImageUrl(base: string, p?: string | null): string | null {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  const clean = p.startsWith("/") ? p : `/${p}`;
  return `${base}${clean}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    // --- normalize inputs ----------------------------------------------------
    const gifteeAge = clamp(body.ageMin, 1, 99, 6); // default to 6
    const priceMin = clamp(body.priceMin, 0, 1_000_000, 0);
    const priceMax = clamp(
      body.priceMax,
      priceMin || 0,
      1_000_000,
      Math.max(priceMin, 1_000_000)
    );
    const themeSlugs =
      Array.isArray(body.themeSlugs) && body.themeSlugs.length > 0
        ? body.themeSlugs.filter((s) => typeof s === "string")
        : undefined;
    const experience = body.experience ?? "";

    const base = backendBase();
    const catalog = await fetchJson<CatalogProduct[]>(
      joinUrl(base, "/catalog/products")
    );

    const products = catalog
      .filter((p) => p && p.isActive)
      .filter((p) => p.msrpCents >= priceMin && p.msrpCents <= priceMax)
      .filter((p) => {
        if (typeof p.ageMinimum !== "number") return true;
        return p.ageMinimum <= gifteeAge;
      })
      .filter((p) => {
        if (!themeSlugs) return true;
        const themeSlug = p.theme ? slugify(p.theme) : "";
        return themeSlug ? themeSlugs.includes(themeSlug) : false;
      })
      .sort((a, b) => a.msrpCents - b.msrpCents || a.name.localeCompare(b.name))
      .slice(0, 60);

    const qtyOf = (p: CatalogProduct) =>
      typeof p.stockLevel === "number" && Number.isFinite(p.stockLevel)
        ? p.stockLevel
        : 0;
    const inStock = (p: CatalogProduct) => qtyOf(p) > 0;

    const beginnerLike =
      experience === "No, this would be their first" ||
      experience === "I'm not sure";

    // re-rank: in-stock first; if beginner, bias cheaper
    const ranked = [...products].sort((a, b) => {
      const aStock = inStock(a) ? 1 : 0;
      const bStock = inStock(b) ? 1 : 0;
      if (aStock !== bStock) return bStock - aStock; // stock first
      if (beginnerLike && a.msrpCents !== b.msrpCents) {
        return a.msrpCents - b.msrpCents;
      }
      return 0; // keep base order otherwise
    });

    const mapped = ranked.slice(0, 12).map((p) => ({
      id: p.sku,
      slug: p.slug,
      setNumber: p.setNumber,
      name: p.name,
      msrpCents: p.msrpCents,
      imageUrl: toAbsImageUrl(base, p.primaryImagePath),
      themeSlug: p.theme ? slugify(p.theme) : undefined,
      qty: qtyOf(p),
      inStock: inStock(p),
    }));

    return NextResponse.json({ products: mapped }, { status: 200 });
  } catch (err) {
    console.error("/api/gift-guide error", err);
    return NextResponse.json(
      { error: "Could not fetch gift suggestions" },
      { status: 500 }
    );
  }
}
