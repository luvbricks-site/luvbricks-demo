// src/app/themes/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import { DEMO_MODE } from "@/lib/demoMode";

export const revalidate = 60; // ISR: refresh every minute

type Params = { params: { slug: string } };

// Match what we actually select from Theme
type ThemeMeta = {
  id: string;
  name: string;
};

// Safely read a Prisma error code without using `any`
function getPrismaCode(err: unknown): string | undefined {
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as { code?: unknown }).code === "string"
  ) {
    return (err as { code: string }).code;
  }
  return undefined;
}

export default async function ThemePage({ params }: Params) {
  const slug = params.slug;

  // ---------- Load optional theme metadata ----------
  let theme: ThemeMeta | null = null;

  if (!DEMO_MODE) {
    try {
      const t = await prisma.theme.findUnique({
        where: { slug },
        select: { id: true, name: true },
      });
      theme = t ?? null;
    } catch (err) {
      const code = getPrismaCode(err);
      if (code !== "P2021") {
        // Real error in non-demo mode: surface it
        throw err;
      }
      // If P2021 (Theme table missing), continue with theme = null
    }
  }

  // ---------- Build product filter ----------
  // If we have a Theme row, filter by themeId; otherwise fall back to themeSlug.
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

  // Minimal shape we need for rendering Theme products
  type ProductForTheme = {
    id: string;
    slug: string;
    setNumber: number; // must be number to match ProductCard/ProductLite
    name: string;
    msrpCents: number;
    images: { url: string | null }[];
  };

  let products: ProductForTheme[] = [];

  try {
    const result = await prisma.product.findMany({
      where: productWhere,
      orderBy: { name: "asc" },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        inventory: true,
      },
    });

    // Map Prisma payload → the minimal shape our UI needs
    products = result.map((p) => ({
      id: p.id,
      slug: p.slug,
      // Normalize just in case schema/types drift; ensures `number`
      setNumber: typeof p.setNumber === "number" ? p.setNumber : Number(p.setNumber),
      name: p.name,
      msrpCents: p.msrpCents,
      images: p.images.map((img) => ({ url: img.url })),
    }));
  } catch (err: unknown) {
    const code = getPrismaCode(err);

    if (code === "P2021" && DEMO_MODE) {
      // Demo + missing Product table: show empty instead of failing
      products = [];
    } else {
      // Anything else: real error
      throw err;
    }
  }

  // If absolutely nothing exists, 404
  if (!theme && products.length === 0) {
    return notFound();
  }

  // ---------- UI bits ----------
  const title =
    theme?.name ??
    slug
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900">{title}</h1>

      {DEMO_MODE && !theme && (
        <p className="mt-1 text-[10px] text-amber-500">
          Demo mode: theme page is resolved by slug only; Theme table is
          optional.
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
              imageUrl: p.images[0]?.url || undefined,
              themeSlug: slug,
            }}
          />
        ))}
      </div>
    </main>
  );
}

/**
 * Static params for demo:
 *  - No Prisma calls here at all.
 *  - This is what fixes the P2021 build failure for /themes/[slug].
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
