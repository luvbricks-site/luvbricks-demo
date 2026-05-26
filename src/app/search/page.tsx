// src/app/search/page.tsx

import ProductCard from "@/components/ProductCard";

type SearchPageProps = {
  searchParams: { q?: string };
};

// tiny helper: turn "Harry Potter" -> "harry-potter"
function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type CatalogProduct = {
  sku: string;
  name: string;
  slug: string;
  msrpCents: number;
  isActive: boolean;
  setNumber: number;
  theme?: string | null;
  primaryImagePath?: string | null;
  stockLevel?: number | null;
};

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

function toAbsImageUrl(base: string, p?: string | null): string | null {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  const clean = p.startsWith("/") ? p : `/${p}`;
  return `${base}${clean}`;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // sanitize input a bit (and keep it short)
  const raw = (searchParams.q ?? "").trim().slice(0, 64);

  // empty state (friendly prompt)
  if (!raw) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Search</h1>
        <p className="text-slate-600">
          Type a set number, product name, or theme in the search bar above.
        </p>
      </main>
    );
  }

  const base = backendBase();
  const catalog = await fetchJson<CatalogProduct[]>(
    joinUrl(base, "/catalog/products")
  );

  // helpers for the query
  const qSlug = slugify(raw);
  const qNum = /^\d+$/.test(raw) ? Number(raw) : undefined;

  const products = catalog
    .filter((p) => p && p.isActive)
    .filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(raw.toLowerCase());
      const slugMatch = p.slug?.toLowerCase().includes(qSlug);
      const setMatch = qNum ? p.setNumber === qNum : false;
      const themeMatch = p.theme
        ? slugify(p.theme).includes(qSlug) || p.theme.toLowerCase().includes(raw.toLowerCase())
        : false;
      return nameMatch || slugMatch || setMatch || themeMatch;
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 60);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-6">
        Search results for “{raw}”
      </h1>

      {products.length === 0 ? (
        <p className="text-slate-600">
          No matches. Try a set number (e.g., 76454), product name, or theme.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.slug}
              p={{
                slug: p.slug,
                setNumber: p.setNumber,
                name: p.name,
                msrpCents: p.msrpCents,
                imageUrl: toAbsImageUrl(base, p.primaryImagePath),
                themeSlug: p.theme ? slugify(p.theme) : "",
                stockLevel:
                  typeof p.stockLevel === "number" && Number.isFinite(p.stockLevel)
                    ? p.stockLevel
                    : null,
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}

