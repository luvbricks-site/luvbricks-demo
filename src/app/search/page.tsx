// src/app/search/page.tsx

import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/db";

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

  // helpers for the query
  const qSlug = slugify(raw);
  const qNum = /^\d+$/.test(raw) ? Number(raw) : undefined;

  // NOTE: Using mode: "insensitive" for case-insensitive search (supported on PostgreSQL)
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: raw, mode: "insensitive" } },
        { slug: { contains: qSlug, mode: "insensitive" } },
        ...(qNum ? [{ setNumber: qNum }] : []),
        { theme: { is: { name: { contains: raw, mode: "insensitive" } } } },
      ],
    },
    orderBy: { name: "asc" },
    take: 60, // cap results
    include: {
      theme: { select: { slug: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      inventory: true,
    },
  });

  type ProductResult = (typeof products)[number];

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
          {products.map((p: ProductResult) => (
            <ProductCard
              key={p.id}
              p={{
                slug: p.slug,
                setNumber: p.setNumber,
                name: p.name,
                msrpCents: p.msrpCents,
                imageUrl: p.images[0]?.url,
                themeSlug: p.theme?.slug ?? "",
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}

