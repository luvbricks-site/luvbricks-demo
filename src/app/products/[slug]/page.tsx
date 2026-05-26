// src/app/products/[slug]/page.tsx
import { notFound } from "next/navigation";
import { formatCents } from "@/lib/currency";
import { getTierForPrice, tierLabelForPrice } from "@/lib/tiers";
import AddToCartButton from "@/components/cart/AddToCartButton";

export const dynamic = "force-dynamic";
export const revalidate = 60;

type Params = { params: { slug: string } };

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

export default async function ProductPage({ params }: Params) {
  const slug = decodeURIComponent(params.slug);
  const base = backendBase();

  let product: CatalogProduct | null = null;
  try {
    product = await fetchJson<CatalogProduct>(
      joinUrl(base, `/catalog/products/${encodeURIComponent(slug)}`)
    );
  } catch {
    product = null;
  }

  if (!product) return notFound();

  // Stock: use catalog stockLevel (from products.json)
  const stockLevel =
    typeof product.stockLevel === "number" && Number.isFinite(product.stockLevel)
      ? product.stockLevel
      : 0;
  const qty = stockLevel;
  const inStock = stockLevel > 0;

  const msrp = formatCents(product.msrpCents);
  const price = product.msrpCents / 100;
  const tier = getTierForPrice(price);
  const tierLabel = tierLabelForPrice(price);

  const imageUrl = product.primaryImagePath
    ? joinUrl(base, product.primaryImagePath.replace(/\\/g, "/"))
    : "/icon.png";

  const setNumberStr = String(product.setNumber);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Image */}
      <section>
        <div className="relative aspect-[5/8] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center">
          {/* Using <img> avoids next/image remotePatterns config */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        </div>
      </section>

      {/* Details */}
      <section>
        <div className="text-xs text-slate-500">
          Set #{product.setNumber} - {product.theme}
        </div>

        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
          {product.name}
        </h1>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl font-semibold">{msrp}</span>
          {tier === 0 ? (
            <span className="text-xs rounded-full border px-2 py-0.5 text-slate-700">
              MSRP only
            </span>
          ) : (
            <span className="text-xs rounded-full border px-2 py-0.5 text-slate-700">
              {tierLabel} eligible
            </span>
          )}
          <span
            className={`text-xs rounded-full border px-2 py-0.5 ${
              inStock
                ? "text-emerald-700 border-emerald-200 bg-emerald-50"
                : "text-rose-700 border-rose-200 bg-rose-50"
            }`}
          >
            {inStock ? `${qty} in stock` : "Out of stock"}
          </span>
        </div>

        <div className="mt-4 text-sm text-slate-700 space-y-1">
          {typeof product.pieceCount === "number" && (
            <div>Pieces: {product.pieceCount}</div>
          )}
          {typeof product.ageMinimum === "number" && (
            <div>Age: {product.ageMinimum}+</div>
          )}
          {product.theme && <div>Theme: {product.theme}</div>}
        </div>

        {/* Policy/Points hints (MAP-safe) */}
        <ul className="mt-5 text-sm text-slate-700 space-y-1">
          <li>
            Bundle savings apply at checkout when you add 3+ sets in the same
            price tier.
          </li>
          <li>Registered members earn LuvPoints (1 pt per $1) on every purchase.</li>
          <li>Packed for collectors. Ships within 24 hours.</li>
        </ul>

        {/* Add to cart */}
        <div className="mt-6 flex items-center gap-3">
          <AddToCartButton
            productId={product.sku} // string product id for cart
            setNumber={setNumberStr}
            name={product.name}
            imageUrl={imageUrl}
            tier={tier}
            msrpCents={product.msrpCents}
            weightLb={null}
            inStock={inStock}
          />
        </div>
      </section>
    </main>
  );
}

