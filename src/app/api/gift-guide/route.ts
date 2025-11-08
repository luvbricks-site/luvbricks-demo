// src/app/api/gift-guide/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

type Payload = {
  ageMin?: number;        // giftee’s age in years
  themeSlugs?: string[];  // optional; if empty we won’t filter by theme
  priceMin?: number;      // cents
  priceMax?: number;      // cents
  experience?: string;    // "Yes, they love it!" | "They've built a few" | "I'm not sure" | "No, this would be their first"
};

// small helper to coerce/clamp inputs
function clamp(n: unknown, lo: number, hi: number, fallback: number) {
  const x = typeof n === "number" && Number.isFinite(n) ? n : fallback;
  return Math.min(Math.max(x, lo), hi);
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

    // --- where clause (typed explicitly) ------------------------------------
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ageMin: { lte: gifteeAge },
      msrpCents: { gte: priceMin, lte: priceMax },
      ...(themeSlugs
        ? {
            // Theme is a relation; this mirrors how you filtered theme elsewhere
            theme: { slug: { in: themeSlugs } },
          }
        : {}),
    };

    // --- query ---------------------------------------------------------------
    const products = await prisma.product.findMany({
      where,
      orderBy: [{ msrpCents: "asc" }, { name: "asc" }],
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        theme: { select: { slug: true } },
        inventory: { select: { qty: true }, take: 1 },
      },
      take: 60,
    });

    // helpers
    const qtyOf = (p: (typeof products)[number]) => p.inventory?.[0]?.qty ?? 0;
    const inStock = (p: (typeof products)[number]) => qtyOf(p) > 0;

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
      id: p.id,
      slug: p.slug,
      setNumber: p.setNumber,
      name: p.name,
      msrpCents: p.msrpCents,
      imageUrl: p.images[0]?.url ?? null,
      themeSlug: p.theme?.slug ?? undefined,
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
