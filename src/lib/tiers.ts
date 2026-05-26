export type Tier = 1 | 2 | 3 | 4;
export type TierOrNone = Tier | 0;

export const TIERS: Record<Tier, { min: number; max?: number }> = {
  1: { min: 26, max: 60.99 },
  2: { min: 61, max: 100.99 },
  3: { min: 101, max: 150.99 },
  4: { min: 151, max: 300 },
};

export function getTierForPrice(price: number): TierOrNone {
  if (!Number.isFinite(price)) return 0;
  if (price < 26) return 0;
  if (price <= 60.99) return 1;
  if (price <= 100.99) return 2;
  if (price <= 150.99) return 3;
  if (price <= 300) return 4;
  return 0;
}

export function tierLabelForPrice(price: number) {
  const t = getTierForPrice(price);
  return t === 0 ? "MSRP only" : `Tier ${t}`;
}

/** Convert a dollars float -> integer cents with proper rounding */
const toCents = (dollars: number) => Math.round(dollars * 100);

/** Get [min,max] in cents for a tier, suitable for Prisma queries */
export function tierRangeCents(tier: Tier): { minCents: number; maxCents?: number } {
  const spec = TIERS[tier];
  return {
    minCents: toCents(spec.min),
    maxCents: spec.max !== undefined ? toCents(spec.max) : undefined,
  };
}

/** Human label like "$26.00-$60.99" */
export function tierRangeLabel(tier: Tier, locale = "en-US"): string {
  const { min, max } = TIERS[tier];
  const fmt = (n: number) =>
    n.toLocaleString(locale, { style: "currency", currency: "USD", minimumFractionDigits: 2 });
  return max !== undefined ? `${fmt(min)}-${fmt(max)}` : `${fmt(min)}+`;
}

