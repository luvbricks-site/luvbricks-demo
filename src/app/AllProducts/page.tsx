// src/app/AllProducts/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import type { Prisma } from "@prisma/client";
import { DEMO_MODE } from "@/lib/demoMode";

export const revalidate = 60; // ISR: refresh every minute

type PageProps = {
  searchParams: {
    theme?: string; // theme slug
    sort?: "price-asc" | "price-desc";
    age?: string; // "2" | "4" | ...
  };
};

export default async function AllProductsPage({ searchParams }: PageProps) {
  const themeSlug = (searchParams.theme ?? "").trim();
  const sort =
    (searchParams.sort as PageProps["searchParams"]["sort"]) ?? undefined;
  const ageMin = Number(searchParams.age ?? "");
  const ageFilter = Number.isFinite(ageMin) ? ageMin : undefined;

  // ----- Theme list for filter dropdown -----
  let themes: { slug: string; name: string }[] = [];

  if (DEMO_MODE) {
    // In demo mode, don't depend on a Theme table existing.
    themes = [
      { slug: "city", name: "City" },
      { slug: "marvel", name: "Marvel" },
      { slug: "friends", name: "Friends" },
      { slug: "harry-potter", name: "Harry Potter" },
      { slug: "star-wars", name: "Star Wars" },
      { slug: "cmf", name: "CMF" },
      { slug: "duplo", name: "Duplo" },
    ];
  } else {
    try {
      themes = await prisma.theme.findMany({
        orderBy: { name: "asc" },
        select: { slug: true, name: true },
      });
    } catch (err: unknown) {
      const code =
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code;

      if (code === "P2021") {
        // Theme table missing in this environment; fail soft and just hide filter options.
        themes = [];
      } else {
        throw err;
      }
    }
  }

  // ----- Product query -----
  const where: Prisma.ProductWhereInput = { isActive: true };
  if (themeSlug) where.theme = { slug: themeSlug };
  if (ageFilter !== undefined) where.ageMin = { gte: ageFilter };

  let orderBy: Prisma.ProductOrderByWithRelationInput = { name: "asc" };
  if (sort === "price-asc") orderBy = { msrpCents: "asc" };
  if (sort === "price-desc") orderBy = { msrpCents: "desc" };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      theme: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      inventory: { select: { qty: true }, take: 1 },
    },
    take: 200,
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-6">
        All Products
      </h1>

      {/* Filters */}
      <form
        action="/AllProducts"
        method="GET"
        className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {/* Theme */}
        <div>
          <label
            htmlFor="theme"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Theme
          </label>
          <select
            id="theme"
            name="theme"
            defaultValue={themeSlug}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">All themes</option>
            {themes.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort by price */}
        <div>
          <label
            htmlFor="sort"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Sort by price
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">Relevance</option>
            <option value="price-asc">Low to High</option>
            <option value="price-desc">High to Low</option>
          </select>
        </div>

        {/* Age min */}
        <div>
          <label
            htmlFor="age"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Age recommendation (min)
          </label>
          <select
            id="age"
            name="age"
            defaultValue={ageFilter?.toString() ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">Any</option>
            <option value="2">1½+</option>
            {[4, 6, 9, 13, 18].map((a) => (
              <option key={a} value={a.toString()}>
                {a}+
              </option>
            ))}
          </select>
        </div>

        {/* Submit/Clear */}
        <div className="sm:col-span-3">
          <button
            type="submit"
            className="rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700"
          >
            Apply Filters
          </button>
          {!!(themeSlug || sort || ageFilter) && (
            <Link
              href="/AllProducts"
              className="ml-3 text-sm text-slate-600 hover:text-slate-900 underline"
            >
              Clear all
            </Link>
          )}
        </div>
      </form>

      {/* Result count */}
      <p className="text-sm text-slate-600 mb-4">
        Showing <span className="font-semibold">{products.length}</span> product
        {products.length === 1 ? "" : "s"}
        {themeSlug ? (
          <>
            {" "}
            in <span className="font-semibold">{themeSlug}</span>
          </>
        ) : null}
        {ageFilter ? (
          <>
            {" "}
            for age <span className="font-semibold">{ageFilter}+</span>
          </>
        ) : null}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              }}
            />
          );
        })}
      </div>
    </main>
  );
}
