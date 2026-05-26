// src/lib/shipping.ts
import type { TierOrNone } from "./tiers";

export type ShipItem = {
  productId: string;
  tier: TierOrNone;
  qty: number;
  weightLb?: number | null;
};

export type ShippingResult = {
  isHeavy: boolean;
  baseShippingCents: number;
  creditCents: number;
  finalShippingCents: number;
  creditReason: "none" | "tier3" | "tier4" | "heavy";
};

/** Tier 1-2 customer-paid ground table (in cents) */
function groundRateByWeight(totalLb: number): number {
  if (totalLb <= 0.125) return 450; // 0-2 oz
  if (totalLb <= 0.375) return 600; // 2.01-6 oz
  if (totalLb <= 0.875) return 750; // 6.01-14 oz
  if (totalLb <= 1.0) return 950; // 14.01 oz - 1 lb
  if (totalLb <= 4.0) return 1500; // 1.01 - 4 lb
  if (totalLb <= 12.5) return 2000; // 4.01 - 12.5 lb
  return 3800; // safety cap
}

export function computeShipping(items: ShipItem[]): ShippingResult {
  // NEW: empty cart -> no shipping charge
  if (!items || items.length === 0) {
    return {
      isHeavy: false,
      baseShippingCents: 0,
      creditCents: 0,
      finalShippingCents: 0,
      creditReason: "none",
    };
  }

  let anyHeavy = false;
  let maxTier: ShipItem["tier"] = 0;
  let totalWeight = 0;

  for (const it of items) {
    if (it.tier > maxTier) maxTier = it.tier;
    const perUnit = Math.max(0, it.weightLb ?? 0);
    const w = perUnit * Math.max(0, it.qty);
    totalWeight += w;
    if (perUnit > 12.5 || w > 12.5) anyHeavy = true;
  }

  if (anyHeavy) {
    return {
      isHeavy: true,
      baseShippingCents: 3800,
      creditCents: 0,
      finalShippingCents: 3800,
      creditReason: "heavy",
    };
  }

  const base = groundRateByWeight(totalWeight);

  // Tier-based base override + credits (current rules)
  let baseCents = base;
  let credit = 0;
  let creditReason: ShippingResult["creditReason"] = "none";

  if (maxTier >= 4) {
    baseCents = 2000; // Tier 4 base $20.00
    credit = 1000; // $10 credit
    creditReason = "tier4";
  } else if (maxTier === 3) {
    baseCents = 1750; // Tier 3 base $17.50
    credit = 500; // $5 credit
    creditReason = "tier3";
  }

  const final = Math.max(0, baseCents - credit);

  return {
    isHeavy: false,
    baseShippingCents: baseCents,
    creditCents: credit,
    finalShippingCents: final,
    creditReason,
  };
}

