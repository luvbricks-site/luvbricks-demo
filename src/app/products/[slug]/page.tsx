// src/app/products/[slug]/page.tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/currency";
import { tierLabelForPrice } from "@/lib/tiers";
import AddToCartButton from "@/components/cart/AddToCartButton";

export const revalidate = 60; // ISR: refresh product pages every minute

type Params = { params: { slug: string } };

// existing local helpers/types
type MaybeWeight = { weightLb?: number | null };

// inventory can be a single row or an array depending on your relation include
type InventoryRow = { qty?: number | null; quantity?: number | null } | null | undefined;
type ProductWithInventory = { inventory?: InventoryRow | InventoryRow[] };

function tierNumberForPrice(msrp: number): 1 | 2 | 3 | 4 | 5 {
  if (msrp <= 25.99) return 1;
  if (msrp <= 60.99) return 2;
  if (msrp <= 100.99) return 3;
  if (msrp <= 150.99) return 4;
  return 5; // $151–$300
}

export default async function ProductPage({ params }: Params) {
  // Make the slug URL-safe → true value
  const slug = decodeURIComponent(params.slug);

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      theme: true,
      images: { orderBy: { sortOrder: "asc" } },
      inventory: true,
    },
  });

  if (!product) return notFound();

  const msrp = formatCents(product.msrpCents);
  const price = product.msrpCents / 100;
  const tierLabel = tierLabelForPrice(price);
  const tierNum = tierNumberForPrice(price);

  const primary = product.images[0] ?? null;
  const imageUrl = primary?.url || "/icon.png";
  const setNumberStr = String(product.setNumber ?? "");
  const weightLb =
    "weightLb" in (product as object) ? (product as MaybeWeight).weightLb ?? null : null;

  // ── Normalize inventory and derive qty + inStock (no `any`) ──────────────
  const invSource = product as unknown as ProductWithInventory;
  const inv = invSource.inventory;

  let qty = 0;
  if (Array.isArray(inv)) {
    const first = inv[0] ?? null;
    qty = Number(first?.qty ?? first?.quantity ?? 0) || 0;
  } else if (inv) {
    qty = Number(inv.qty ?? inv.quantity ?? 0) || 0;
  }
  const inStock = qty > 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Gallery */}
      <section>
        <div className="relative aspect-[5/8] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200">
          {primary && (
            <Image
              src={primary.url}
              alt={primary.alt || product.name}
              fill
              className="object-contain"
              sizes="(min-width:1024px) 50vw, 100vw"
            />
          )}
        </div>
        {product.images.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {product.images.slice(1, 5).map((img) => (
              <div
                key={img.id}
                className="relative aspect-[4/3] rounded-lg overflow-hidden border"
              >
                <Image src={img.url} alt={img.alt || product.name} fill className="object-contain" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Details */}
      <section>
        <div className="text-xs text-slate-500">
          Set #{product.setNumber} · {product.theme.name}
        </div>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">{product.name}</h1>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl font-semibold">{msrp}</span>
          <span className="text-xs rounded-full border px-2 py-0.5 text-slate-700">
            {tierLabel} eligible
          </span>
        </div>

        <p className="mt-4 text-slate-700 leading-relaxed">
          {product.description || "Fantastic set for fans and collectors."}
        </p>

        {/* Policy/Points hints (MAP-safe) */}
        <ul className="mt-5 text-sm text-slate-700 space-y-1">
          <li>Bundle savings apply at checkout when you add 3+ sets in the same price tier.</li>
          <li>Registered members earn LuvPoints (1 pt per $1) on every purchase.</li>
          <li>Packed for collectors. Ships within 24 hours.</li>
        </ul>

        {/* Add to cart */}
        <div className="mt-6 flex items-center gap-3">
          <AddToCartButton
            productId={product.id}
            setNumber={setNumberStr}
            name={product.name}
            imageUrl={imageUrl}
            tier={tierNum}
            msrpCents={product.msrpCents}
            weightLb={weightLb}
            inStock={inStock}
          />

          {/* “Add to Bundle” can be wired later */}
          <button className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 px-5 py-3">
            Add to Bundle
          </button>
        </div>
      </section>
    </main>
  );
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    select: { slug: true },
  });
  return products.map((p) => ({ slug: p.slug }));
}
