// src/lib/bundle.ts
//
// Tiered Bundling System — exactly as specified.
// One discount per tier applies based on how many sets in that SAME TIER
// are in-cart: 3+, 4, or 5+ items. Discount is applied on the tier-subtotal.
//
// NOTE: We assume every cart line has { msrpCents:number, tier:number }.

// Percent helper
const pct = (baseCents: number, percent: number) =>
  Math.round(baseCents * (percent / 100));

export type BundleTier = 1 | 2 | 3 | 4 | 5;

export type BundleItem = {
  productId: string;
  name: string;
  setNumber?: number | null;
  tier: BundleTier;        // 1..5 (derived from MSRP range)
  msrpCents: number;       // integer cents
  qty: number;             // integer >= 1
};

// Your exact discount table (by tier/quantity)
const DISCOUNTS: Record<BundleTier, { buy3: number; buy4: number; buy5plus: number }> = {
  1: { buy3: 9,  buy4: 10, buy5plus: 11 },
  2: { buy3: 8,  buy4: 9,  buy5plus: 10 },
  3: { buy3: 6,  buy4: 7,  buy5plus: 8 },
  4: { buy3: 5,  buy4: 6,  buy5plus: 7 },
  5: { buy3: 3,  buy4: 4,  buy5plus: 5 },
};

export function groupByTier(items: BundleItem[]) {
  const byTier: Record<BundleTier, { count: number; subtotalCents: number }> = {
    1: { count: 0, subtotalCents: 0 },
    2: { count: 0, subtotalCents: 0 },
    3: { count: 0, subtotalCents: 0 },
    4: { count: 0, subtotalCents: 0 },
    5: { count: 0, subtotalCents: 0 },
  };
  for (const it of items) {
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
export function tierFromMsrp(msrpDollars: number): BundleTier {
  if (msrpDollars <= 25.99) return 1;
  if (msrpDollars <= 60.99) return 2;
  if (msrpDollars <= 100.99) return 3;
  if (msrpDollars <= 150.99) return 4;
  return 5;
}
