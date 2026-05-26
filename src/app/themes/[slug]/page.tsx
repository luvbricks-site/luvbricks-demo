// src/app/themes/[slug]/page.tsx
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

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

export default async function ThemePage({ params }: Params) {
  const slug = params.slug;
  const base = backendBase();
  let catalog: CatalogProduct[] = [];
  try {
    catalog = await fetchJson<CatalogProduct[]>(joinUrl(base, "/catalog/products"));
  } catch {
    catalog = [];
  }

  const products = catalog
    .filter((p) => p && p.isActive)
    .filter((p) => slugify(p.theme ?? "") === slug)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (products.length === 0) return notFound();

  const title =
    products[0]?.theme ??
    slug
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900">{title}</h1>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard
            key={p.slug}
            p={{
              slug: p.slug,
              setNumber: typeof p.setNumber === "number" ? p.setNumber : Number(p.setNumber),
              name: p.name,
              msrpCents: p.msrpCents,
              imageUrl: toAbsImageUrl(base, p.primaryImagePath) ?? "/icon.png",
              themeSlug: slug,
              stockLevel:
                typeof p.stockLevel === "number" && Number.isFinite(p.stockLevel)
                  ? p.stockLevel
                  : null,
            }}
          />
        ))}
      </div>
    </main>
  );
}

function slugify(s: string) {
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
