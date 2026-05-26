// src/app/AllProducts/page.tsx
import ProductCard from "@/components/ProductCard";
import type { ComponentProps } from "react";

export const dynamic = "force-dynamic"; // Disable static generation

type SearchParams = {
  sort?: "price_asc" | "price_desc";
  theme?: string; // theme slug
  age?: string; // minimum age (years), e.g. "6"
};

// What ProductCard expects
type ProductLite = ComponentProps<typeof ProductCard>["p"];

type CatalogProduct = {
  sku: string;
  name: string;
  slug: string;
  msrpCents: number;
  isActive: boolean;
  setNumber: number;
  theme: string;
  pieceCount?: number | null;
  ageMinimum?: number | null;
  primaryImagePath?: string | null;
  stockLevel?: number | null;
  reorderPoint?: number | null;
};

/* ----------------------------- utils ----------------------------- */

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
    .replace(/^-+|-+$/g, "");
}

function readAgeMin(p: CatalogProduct): number | null {
  return typeof p.ageMinimum === "number" && Number.isFinite(p.ageMinimum)
    ? p.ageMinimum
    : null;
}

/* --------------------------------- page --------------------------------- */

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const base = backendBase();

  // 1) Pull products from backend catalog JSON
  const productsRaw = await fetchJson<CatalogProduct[]>(
    joinUrl(base, "/catalog/products")
  );

  // Only active products (mirrors your previous Prisma filter)
  const active = productsRaw.filter((p) => p && p.isActive);

  // Map to just what the card needs (same fields you used before)
  let items: ProductLite[] = active.map((p) => {
    const stockLevel =
      typeof p.stockLevel === "number" && Number.isFinite(p.stockLevel)
        ? p.stockLevel
        : null;

    const normalizedPath = p.primaryImagePath
      ? p.primaryImagePath.replace(/\\/g, "/")
      : null;

    // NOTE: If ProductCard uses next/image and you get “Invalid src prop”,
    // you’ll need to add localhost:4000 to next.config remotePatterns.
    const imageUrl = normalizedPath ? joinUrl(base, normalizedPath) : undefined;

    return {
      slug: p.slug,
      setNumber: typeof p.setNumber === "number" ? p.setNumber : Number(p.setNumber),
      name: p.name,
      msrpCents: p.msrpCents,
      imageUrl,
      themeSlug: p.theme ? slugify(p.theme) : undefined,
      stockLevel,
    };
  });

  /* ------------------------------- filtering ------------------------------ */

  // Theme filter
  const themeParam = (searchParams.theme ?? "").trim();
  if (themeParam && themeParam !== "all") {
    items = items.filter((i) => i.themeSlug === themeParam);
  }

  // Age (minimum) filter
  const ageMin = Number(searchParams.age ?? "");
  if (Number.isFinite(ageMin) && ageMin > 0) {
    const bySlug = new Map(active.map((p) => [p.slug, p]));
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
    sort === "price_desc"
      ? b.msrpCents - a.msrpCents
      : a.msrpCents - b.msrpCents
  );

  // Theme options (derived from catalog)
  const themeOptions = Array.from(
    new Map(
      active
        .map((p) => {
          if (!p.theme) return null;
          const slug = slugify(p.theme);
          return [slug, { slug, name: p.theme }] as const;
        })
        .filter(Boolean) as Array<[string, { slug: string; name: string }]>
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  /* --------------------------------- UI ---------------------------------- */

  // Keep current filter selections
  const currentSort = sort;
  const currentTheme = themeParam || "all";
  const currentAge =
    Number.isFinite(ageMin) && ageMin > 0 ? String(ageMin) : "";

  return (
    <main className="mx-auto max-w-7xl px-3 md:px-4 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
        All Products
      </h1>

      {/* Filters – simple GET form so URL reflects the state */}
      <form
        className="mt-4 grid grid-cols-1 md:flex md:flex-wrap md:items-end gap-3 md:gap-3"
        method="get"
      >
        <div className="flex flex-col">
          <label className="text-xs text-slate-500">Sort by price</label>
          <select
            name="sort"
            defaultValue={currentSort}
            className="w-full md:min-w-[140px] rounded-md border border-slate-300 px-3 py-2 text-sm"
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
            className="w-full md:min-w-[180px] rounded-md border border-slate-300 px-3 py-2 text-sm"
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
            className="w-full md:w-[100px] rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="h-[38px] rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 w-full md:w-auto"
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
        <p className="mt-6 text-sm text-slate-500">
          No products match your filters.
        </p>
      )}
    </main>
  );
}
