// src/app/themes/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import { DEMO_MODE } from "@/lib/demoMode";

export const revalidate = 60; // ISR: refresh each minute

type Params = { params: { slug: string } };

export default async function ThemePage({ params }: Params) {
  const { slug } = params;

  // Try to load Theme row only when not in demo mode.
  // If the Theme table is missing (P2021), we fall back gracefully.
  let theme:
    | {
        id: string;
        name: string;
        slug: string;
        description?: string | null;
      }
    | null = null;

  if (!DEMO_MODE) {
    try {
      theme = await prisma.theme.findUnique({
        where: { slug },
      });
    } catch (err: unknown) {
      const code =
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code;

      // If it's not "table does not exist", rethrow.
      if (code !== "P2021") {
        throw err;
      }
      // If P2021, leave theme = null and continue with fallback logic.
    }
  }

  // Build product filter:
  // - If we have a real Theme row, use themeId.
  // - Otherwise (demo / missing table), fall back to themeSlug = [slug].
  const where = theme
    ? {
        themeId: theme.id,
        isActive: true,
        images: { some: {} },
      }
    : {
        // Fallback: this assumes your products store a themeSlug matching the URL.
        themeSlug: slug,
        isActive: true,
        images: { some: {} },
      };

  const products = await prisma.product.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      inventory: true,
    },
  });

  // If we have no theme metadata and no products, treat as 404.
  if (!theme && products.length === 0) {
    return notFound();
  }

  // Title: prefer DB theme name; otherwise prettify slug.
  const themeTitle =
    theme?.name ||
    slug
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");

  const themeDescription = theme?.description ?? null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900">{themeTitle}</h1>
      {themeDescription && (
        <p className="mt-1 text-sm text-slate-600">{themeDescription}</p>
      )}
      {DEMO_MODE && !theme && (
        <p className="mt-1 text-[10px] text-amber-500">
          Demo mode: theme content is based on the URL slug and demo catalog.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            p={{
              slug: p.slug,
              setNumber: p.setNumber,
              name: p.name,
              msrpCents: p.msrpCents,
              imageUrl: p.images[0]?.url,
              themeSlug: slug,
            }}
          />
        ))}
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  // In demo mode, avoid relying on a Theme table that may not exist.
  if (DEMO_MODE) {
    // Hardcode the theme slugs you actually link to in nav.
    return [
      { slug: "city" },
      { slug: "marvel" },
      { slug: "friends" },
      { slug: "harry-potter" },
      { slug: "star-wars" },
      { slug: "cmf" },
      { slug: "duplo" },
    ];
  }

  try {
    const themes = await prisma.theme.findMany({
      select: { slug: true },
    });
    return themes.map((t) => ({ slug: t.slug }));
  } catch (err: unknown) {
    // If the Theme table is missing (P2021), fail gracefully instead of breaking the build.
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2021"
    ) {
      return [];
    }
    throw err;
  }
}
