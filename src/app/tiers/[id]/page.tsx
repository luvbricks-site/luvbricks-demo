// src/app/tiers/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import { TIERS, type Tier } from "@/lib/tiers";

export const revalidate = 60;

type Props = { params: { id: string } };

function isTier(x: string): x is `${Tier}` {
  return ["1", "2", "3", "4", "5"].includes(x);
}

export default async function TierPage({ params }: Props) {
  if (!isTier(params.id)) return notFound();
  const tier = Number(params.id) as Tier;
  const spec = TIERS[tier];

  // safer to query in cents if your column is msrpCents
  const minCents = Math.round(spec.min * 100);
  const maxCents = spec.max !== undefined ? Math.round(spec.max * 100) : undefined;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      msrpCents: { gte: minCents, ...(maxCents ? { lte: maxCents } : {}) },
    },
    orderBy: { name: "asc" },
    include: {
      theme: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      inventory: { select: { qty: true }, take: 1 },
    },
    take: 200,
  });

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
  const rangeLabel = spec.max !== undefined ? `${fmt(spec.min)}–${fmt(spec.max)}` : `${fmt(spec.min)}+`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">
        Tier {tier} <span className="text-slate-500 font-medium">({rangeLabel})</span>
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Add 3+ sets from this tier to unlock savings at checkout.
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Showing <span className="font-semibold">{products.length}</span> product{products.length === 1 ? "" : "s"}.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => {
          const qty = p.inventory?.[0]?.qty ?? 0;
          const inStock = qty > 0;
          return (
            <ProductCard
              key={p.id}
              p={{
                slug: p.slug,
                setNumber: p.setNumber,
                name: p.name,
                msrpCents: p.msrpCents,
                imageUrl: p.images[0]?.url,
                themeSlug: p.theme?.slug,
                inStock,
                qty,
              }}
            />
          );
        })}
      </div>
    </main>
  );
}
