import Image from "next/image";
import Link from "next/link";
import { formatCents } from "@/lib/currency";
import { tierLabelForPrice } from "@/lib/tiers";

type ProductLite = {
  slug: string;
  setNumber: number;
  name: string;
  msrpCents: number;
  imageUrl?: string | null;
  themeSlug?: string;

  /** Optional stock hints — pass one of these from your list queries */
  qty?: number | null;        // e.g. inventory.qty
  inStock?: boolean | null;   // or a precomputed flag
};

export default function ProductCard({ p }: { p: ProductLite }) {
  const tier = tierLabelForPrice(p.msrpCents / 100);

  // Decide out-of-stock (prefer explicit boolean; otherwise, infer from qty if present)
  const outOfStock =
    (typeof p.inStock === "boolean" ? !p.inStock : false) ||
    (typeof p.qty === "number" ? p.qty <= 0 : false);

  return (
    <Link
      href={`/products/${p.slug}`}
      className={[
        "group rounded-2xl overflow-hidden",
        "bg-white border border-slate-200 hover:border-slate-300",
        "shadow-sm hover:shadow-md transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
      ].join(" ")}
    >
      {/* IMAGE (no decorative rails) */}
      <div className="relative aspect-[5/8] bg-slate-50">
        {p.imageUrl ? (
          <Image
            src={p.imageUrl}
            alt={`${p.name} box art`}
            fill
            className="object-contain"
            sizes="(min-width:1024px) 25vw, 50vw"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-slate-400">
            No image
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="p-4">
        <div className="text-xs text-slate-500">Set #{p.setNumber}</div>

        <h3 className="mt-1 text-base font-semibold text-slate-900 line-clamp-2">
          {p.name}
        </h3>

        {/* Bottom row: price (left) + pill(s) (right) */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-slate-900 font-semibold">
            {formatCents(p.msrpCents)}
          </div>

          <div className="ml-0 sm:ml-3 flex flex-wrap items-center gap-2">
            {/* Tier is always shown */}
            <span className="shrink-0 rounded-full bg-blue-50 text-blue-700 text-xs px-2.5 py-1">
              {tier} eligible
            </span>

            {/* OOS appears in addition, when applicable */}
            {outOfStock && (
              <span
                className="shrink-0 rounded-full bg-slate-100 text-slate-700 text-xs px-2.5 py-1"
                title="This item is currently out of stock"
              >
                Temporarily Out of Stock
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
