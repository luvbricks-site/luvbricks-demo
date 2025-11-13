// src/app/AllProducts/page.tsx
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import type { ComponentProps } from "react";

type ProductLite = ComponentProps<typeof ProductCard>["p"];

export const revalidate = 60; // ISR

export default async function AllProductsPage() {
  const [products, themes] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        // first image only for the card
        images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        // prefer relation for theme
        theme: { select: { slug: true } },
      },
    }),
    prisma.theme.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  // Map to exactly what ProductCard expects (ProductLite)
  const items: ProductLite[] = products.map((p) => {
    const sn =
      typeof p.setNumber === "string" ? Number(p.setNumber) : p.setNumber;

    return {
      slug: p.slug,
      setNumber: Number.isFinite(sn) ? (sn as number) : 0, // satisfy ProductLite (number)
      name: p.name,
      msrpCents: p.msrpCents,
      imageUrl: p.images[0]?.url ?? null,
      themeSlug: p.theme?.slug ?? "", // no `any` fallback
    };
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900">All Products</h1>

      {/* Simple theme tokens (static for now; wire up client filters later if you want) */}
      {themes.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-700">
          {themes.map((t) => (
            <span
              key={t.slug}
              className="rounded-full border border-slate-200 px-3 py-1"
              title={t.name}
            >
              {t.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.slug} p={p} />
        ))}
      </div>
    </main>
  );
}
