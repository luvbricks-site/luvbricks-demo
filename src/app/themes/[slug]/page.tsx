// src/app/themes/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import { DEMO_MODE } from "@/lib/demoMode";

export const revalidate = 60; // ISR: refresh each minute

type Params = { params: { slug: string } };

// Minimal shape for what we render here
type ProductForTheme = {
  id: string;
  slug: string;
  setNumber: number;            // 🔁 FIX: number, not string
  name: string;
  msrpCents: number;
  images: { url: string | null }[];
};

export default async function ThemePage({ params }: Params) {
  const { slug } = params;

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

      if (code !== "P2021") throw err;
      // If P2021 (Theme table missing), ignore and continue.
    }
  }

  const productWhere = theme
    ? {
        themeId: theme.id,
        isActive: true,
        images: { some: {} },
      }
    : {
        themeSlug: slug,
        isActive: true,
        images: { some: {} },
      };

  let products: ProductForTheme[] = [];

  try {
    const result = await prisma.product.findMany({
      where: productWhere,
      orderBy: { name: "asc" },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        // inventory loaded but unused here
      },
    });

    products = result as ProductForTheme[];
  } catch (err: unknown) {
    const code =
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code;

    if (code === "P2021" && DEMO_MODE) {
      products = [];
    } else if (code === "P2021") {
      throw err;
    } else if (err) {
      throw err;
    }
  }

  if (!theme && products.length === 0) {
    return notFound();
  }

  const themeTitle =
    theme?.name ??
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
          Demo mode: Theme metadata is inferred from the URL; products are
          filtered by this theme slug when available.
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

/**
 * generateStaticParams:
 * For the demo, we DO NOT touch Prisma here at all.
 * We just return the list of theme slugs we care about.
 * This guarantees no build-time DB errors for /themes/[slug].
 */
export async function generateStaticParams() {
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
