// src/app/AllProducts/page.tsx
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import type { ComponentProps } from "react";

export const revalidate = 60; // ISR refresh cadence (server renders + cache)

type SearchParams = {
  sort?: "price_asc" | "price_desc";
  theme?: string; // theme slug
  age?: string;   // minimum age (years), e.g. "6"
};

// What ProductCard expects
type ProductLite = ComponentProps<typeof ProductCard>["p"];

/* ----------------------------- safe readers ----------------------------- */

function readThemeSlug(p: { theme?: { slug?: string | null } | null } & Record<string, unknown>): string | undefined {
  // Prefer relation if present
  const rel = p.theme?.slug ?? undefined;
  if (rel) return rel;

  // Fallback to a legacy denormalized column if the schema had one
  const legacy = (p as unknown as { themeSlug?: string | null }).themeSlug;
  return legacy ?? undefined;
}

function readAgeMin(obj: Record<string, unknown>): number | null {
  // Handle a few likely schema variations without using `any`
  const tryKeys = ["ageMin", "minAge", "minAgeYears", "age"];
  for (const k of tryKeys) {
    const v = obj[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

/* --------------------------------- page --------------------------------- */

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Pull themes for the filter dropdown. If Theme table didn’t exist in some
  // earlier local DBs, we still gracefully continue by deriving from products.
  const [productsRaw, themesRaw] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        theme: { select: { slug: true, name: true } },
        inventory: { orderBy: { sku: "asc" }, take: 1 },
      },
    }),
    prisma.theme
      .findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } })
      .catch(() => [] as { id: string; name: string; slug: string }[]),
  ]);

  // Map to just what the card needs
  let items: ProductLite[] = productsRaw.map((p) => ({
    slug: p.slug,
    // ensure number even if an older DB stored it as text
    setNumber: typeof p.setNumber === "number" ? p.setNumber : Number(p.setNumber),
    name: p.name,
    msrpCents: p.msrpCents,
    imageUrl: p.images[0]?.url ?? undefined,
    themeSlug: readThemeSlug(p),
    // map simple inventory hints (seed uses `SKU-<setNumber>` inventory rows)
    qty: typeof p.inventory?.[0]?.qty === "number" ? p.inventory[0].qty : undefined,
    inStock:
      p.inventory?.[0]?.stockStatus != null
        ? (p.inventory[0].stockStatus as unknown) === "IN_STOCK"
        : undefined,
  }));

  /* ------------------------------- filtering ------------------------------ */

  // Theme filter
  const themeParam = (searchParams.theme ?? "").trim();
  if (themeParam && themeParam !== "all") {
    items = items.filter((i) => i.themeSlug === themeParam);
  }

  // Age (minimum) filter – read possible age fields from the original record
  const ageMin = Number(searchParams.age ?? "");
  if (Number.isFinite(ageMin) && ageMin > 0) {
    // Build a quick lookup by slug so we can read age from the raw product
    const bySlug = new Map(productsRaw.map((p) => [p.slug, p as unknown as Record<string, unknown>]));
    items = items.filter((i) => {
      const src = bySlug.get(i.slug);
      if (!src) return true;
      const min = readAgeMin(src);
      return min === null ? true : min >= ageMin;
    });
  }

  // Sort by price
  const sort = searchParams.sort ?? "price_asc";
  items.sort((a, b) =>
    sort === "price_desc" ? b.msrpCents - a.msrpCents : a.msrpCents - b.msrpCents
  );

  // Final theme list for dropdown (prefer Theme table, else derive from products)
  const themeOptions =
    themesRaw.length > 0
      ? themesRaw.map((t) => ({ slug: t.slug, name: t.name }))
      : Array.from(
          new Map(
            productsRaw
              .map((p) => {
                const slug = readThemeSlug(p);
                const name =
                  (p.theme?.name as string | undefined) ??
                  (slug ? slug.split("-").map((s) => s[0]?.toUpperCase() + s.slice(1)).join(" ") : undefined);
                return slug ? [slug, { slug, name: name ?? slug }] as const : null;
              })
              .filter(Boolean) as Array<[string, { slug: string; name: string }]>
          ).values()
        ).sort((a, b) => a.name.localeCompare(b.name));

  /* --------------------------------- UI ---------------------------------- */

  // Keep current filter selections
  const currentSort = sort;
  const currentTheme = themeParam || "all";
  const currentAge = Number.isFinite(ageMin) && ageMin > 0 ? String(ageMin) : "";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900">All Products</h1>

      {/* Filters – simple GET form so URL reflects the state */}
      <form className="mt-4 flex flex-wrap items-end gap-3" method="get">
        <div className="flex flex-col">
          <label className="text-xs text-slate-500">Sort by price</label>
          <select
            name="sort"
            defaultValue={currentSort}
            className="min-w-[140px] rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="price_asc">Low → High</option>
            <option value="price_desc">High → Low</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-500">Theme</label>
          <select
            name="theme"
            defaultValue={currentTheme}
            className="min-w-[180px] rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">All themes</option>
            {themeOptions.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-500">Age (min)</label>
          <input
            type="number"
            name="age"
            min={0}
            step={1}
            defaultValue={currentAge}
            placeholder="Any"
            className="w-[100px] rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="h-[38px] rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Apply
        </button>
      </form>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.slug} p={p} />
        ))}
      </div>

      {items.length === 0 && (
        <p className="mt-6 text-sm text-slate-500">No products match your filters.</p>
      )}
    </main>
  );
}
