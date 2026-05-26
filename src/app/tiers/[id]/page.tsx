// src/app/tiers/[id]/page.tsx
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { TIERS, type Tier } from "@/lib/tiers";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

function isTier(x: string): x is `${Tier}` {
  return ["1", "2", "3", "4"].includes(x);
}

// Backend API base (server-side fetch; no CORS issues)
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  process.env.NEXT_PUBLIC_BACKEND_BASE?.replace(/\/+$/, "") ||
  "http://localhost:4000";

type CatalogProduct = {
  sku: string;
  name: string;
  slug?: string;
  msrpCents: number;
  isActive: boolean;

  setNumber?: number | null;
  theme?: string | null;

  primaryImagePath?: string | null;
  stockLevel?: number | null;
  // other fields may exist but are not needed here
};

type CatalogEnvelope = {
  products?: CatalogProduct[];
  items?: CatalogProduct[];
} & Record<string, unknown>;

async function getJson<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GET ${url} failed (${res.status}): ${txt || res.statusText}`);
  }
  return (await res.json()) as T;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toAbsImageUrl(p: string | null | undefined): string | null {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  const clean = p.startsWith("/") ? p : `/${p}`;
  return `${API_BASE}${clean}`;
}

function deriveSetNumber(p: CatalogProduct): number {
  if (typeof p.setNumber === "number") return p.setNumber;
  // fallback: try to pull digits from sku
  const m = p.sku.match(/(\d{4,7})/);
  return m ? Number(m[1]) : 0;
}

function toCatalogArray(value: unknown): CatalogProduct[] {
  if (Array.isArray(value)) return value as CatalogProduct[];
  if (!value || typeof value !== "object") return [];

  const envelope = value as CatalogEnvelope;
  if (Array.isArray(envelope.products)) return envelope.products;
  if (Array.isArray(envelope.items)) return envelope.items;

  return Object.values(envelope) as CatalogProduct[];
}

export default async function TierPage({ params }: Props) {
  if (!isTier(params.id)) return notFound();

  const tier = Number(params.id) as Tier;
  const spec = TIERS[tier];

  const minCents = Math.round(spec.min * 100);
  const maxCents = spec.max !== undefined ? Math.round(spec.max * 100) : undefined;

  // Pull catalog
  const catalog = await getJson<CatalogProduct[]>("/catalog/products");

  const catalogArr = toCatalogArray(catalog);

  const products = catalogArr
    .filter((p) => p.isActive)
    .filter((p) => {
      if (p.msrpCents < minCents) return false;
      if (maxCents !== undefined && p.msrpCents > maxCents) return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 200);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

  const rangeLabel =
    spec.max !== undefined ? `${fmt(spec.min)}-${fmt(spec.max)}` : `${fmt(spec.min)}+`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">
        Tier {tier} <span className="text-slate-500 font-medium">{rangeLabel}</span>
      </h1>

      <p className="mt-2 text-sm text-slate-600">
        Add 3+ sets from this tier to unlock savings at checkout.
      </p>

      <p className="mt-2 text-sm text-slate-500">
        Showing <span className="font-semibold">{products.length}</span> product
        {products.length === 1 ? "" : "s"}.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => {
          const stockLevel =
            typeof p.stockLevel === "number" && Number.isFinite(p.stockLevel)
              ? p.stockLevel
              : null;

          return (
            <ProductCard
              key={p.sku}
              p={{
                slug: p.slug ?? slugify(`${deriveSetNumber(p)}-${p.name}`),
                setNumber: deriveSetNumber(p),
                name: p.name,
                msrpCents: p.msrpCents,
                imageUrl: toAbsImageUrl(p.primaryImagePath) ?? "/icon.png",
                themeSlug: p.theme ? slugify(p.theme) : undefined,
                stockLevel,
              }}
            />
          );
        })}
      </div>
    </main>
  );
}



