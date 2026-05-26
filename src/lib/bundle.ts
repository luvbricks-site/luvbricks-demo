// src/lib/bundle.ts
//
// Tiered Bundling System — exactly as specified.
// One discount per tier applies based on how many sets in that SAME TIER
// are in-cart: 3+, 4, or 5+ items. Discount is applied on the tier-subtotal.
//
// NOTE: We assume every cart line has { msrpCents:number, tier:number }.

import { getTierForPrice, type Tier, type TierOrNone } from "./tiers";

// Percent helper
const pct = (baseCents: number, percent: number) =>
  Math.round(baseCents * (percent / 100));

export type BundleTier = Tier;
export type BundleTierOrNone = TierOrNone;

export type BundleItem = {
  productId: string;
  name: string;
  setNumber?: number | null;
  tier: BundleTierOrNone; // 0 or 1..4 (derived from MSRP range)
  msrpCents: number; // integer cents
  qty: number; // integer >= 1
};

// Your exact discount table (by tier/quantity)
const DISCOUNTS: Record<BundleTier, { buy3: number; buy4: number; buy5plus: number }> = {
  1: { buy3: 3, buy4: 4, buy5plus: 5 },
  2: { buy3: 5, buy4: 6, buy5plus: 7 },
  3: { buy3: 6, buy4: 7, buy5plus: 8 },
  4: { buy3: 8, buy4: 9, buy5plus: 10 },
};

function isBundleTier(tier: number): tier is BundleTier {
  return tier >= 1 && tier <= 4;
}

export function groupByTier(items: BundleItem[]) {
  const byTier: Record<BundleTier, { count: number; subtotalCents: number }> = {
    1: { count: 0, subtotalCents: 0 },
    2: { count: 0, subtotalCents: 0 },
    3: { count: 0, subtotalCents: 0 },
    4: { count: 0, subtotalCents: 0 },
  };
  for (const it of items) {
    if (!isBundleTier(it.tier)) continue;
    const line = it.msrpCents * it.qty;
    byTier[it.tier].count += it.qty;
    byTier[it.tier].subtotalCents += line;
  }
  return byTier;
}

/**
 * Returns the total bundle-discount in cents (negative number for display is up to the UI).
 * The bundle-discount never changes line item prices; it is an order-level discount.
 */
export function computeBundleDiscountCents(items: BundleItem[]): number {
  const byTier = groupByTier(items);

  let totalDiscount = 0;
  (Object.keys(byTier) as unknown as BundleTier[]).forEach((tier) => {
    const { count, subtotalCents } = byTier[tier];
    if (count < 3) return; // no bundle discount for this tier

    const d = DISCOUNTS[tier];
    const percent =
      count >= 5 ? d.buy5plus :
      count === 4 ? d.buy4 :
      d.buy3;

    totalDiscount += pct(subtotalCents, percent);
  });

  return totalDiscount;
}

/**
 * Utility: derive tier number from a product's MSRP dollars.
 * (If you already store tier on Product, you DO NOT need this.)
 */
export function tierFromMsrp(msrpDollars: number): BundleTierOrNone {
  return getTierForPrice(msrpDollars);
}

