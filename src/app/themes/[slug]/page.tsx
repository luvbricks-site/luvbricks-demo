import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60; // ISR: refresh each minute

type Params = { params: { slug: string } };

export default async function ThemePage({ params }: Params) {
  const theme = await prisma.theme.findUnique({ where: { slug: params.slug } });
  if (!theme) return notFound();

  const products = await prisma.product.findMany({
  where: {
    themeId: theme.id,
    isActive: true,
    images: { some: {} },           // ← move it inside `where`
  },
  orderBy: { name: "asc" },
  include: {
    images: { orderBy: { sortOrder: "asc" }, take: 1 },
    inventory: true,
  },
});


  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900">{theme.name}</h1>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <ProductCard
            key={p.id}
            p={{
              slug: p.slug,
              setNumber: p.setNumber,
              name: p.name,
              msrpCents: p.msrpCents,
              imageUrl: p.images[0]?.url,
              themeSlug: params.slug,
            }}
          />
        ))}
      </div>
    </main>
  );
}

// (optional) pre-generate paths in production builds
export async function generateStaticParams() {
  const themes = await prisma.theme.findMany({ select: { slug: true } });
  return themes.map(t => ({ slug: t.slug }));
}
