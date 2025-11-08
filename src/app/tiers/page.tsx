// src/app/tiers/page.tsx
import Link from "next/link";
import Image from "next/image";
import { TIERS, type Tier } from "@/lib/tiers";

export const revalidate = 60;

const TIER_IDS: Tier[] = [1, 2, 3, 4, 5];

// Option A (string paths from /public)
const TIER_IMAGES: Record<Tier, string> = {
  1: "/tiers/tier1_promo_image.png",
  2: "/tiers/tier2_promo_image.png",
  3: "/tiers/tier3_promo_image.png",
  4: "/tiers/tier4_promo_image.png",
  5: "/tiers/tier5_promo_image.png",
};

// Helpers
const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const rangeLabel = (id: Tier) => {
  const { min, max } = TIERS[id];
  return max !== undefined ? `${money(min)}–${money(max)}` : `${money(min)}+`;
};

export default function TiersPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">Build Your Bundle</h1>
      <p className="mt-2 text-slate-600">
        Add 3+ sets from a single tier to unlock savings at checkout. Guests can bundle too; create a free
        account to earn LuvPoints.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {TIER_IDS.map((id) => (
          <Link
            key={id}
            href={`/tiers/${id}`}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {/* IMAGE */}
            <div className="relative aspect-[6/8] bg-slate-100">
              <Image
                src={TIER_IMAGES[id]}
                alt={`Tier ${id} promo`}
                fill
                className="object-cover"
                sizes="(min-width:1024px) 18vw, (min-width:640px) 45vw, 90vw"
                priority={id === 1} // preload the first one, optional
              />
            </div>

            <div className="p-4">
              <div className="text-sm text-slate-500">Tier {id}</div>
              <div className="mt-0.5 text-base font-semibold text-slate-900">{rangeLabel(id)}</div>

              <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#0F172A] group-hover:underline">
              Shop Tier
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </p>

            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

