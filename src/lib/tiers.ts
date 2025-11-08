export type Tier = 1|2|3|4|5;

export const TIERS: Record<Tier, {min:number; max?:number}> = {
  1:{min:4.99,   max:25.99},
  2:{min:26,  max:60.99},
  3:{min:61,  max:100.99},
  4:{min:101, max:150.99},
  5:{min:151, max:300},
};

export function getTierForPrice(price:number): Tier {
  if (price >= 151) return 5;
  if (price >= 101) return 4;
  if (price >= 61)  return 3;
  if (price >= 26)  return 2;
  return 1;
}
export function tierLabelForPrice(price: number) {
  const t = getTierForPrice(price);
  return `Tier ${t}`;
}
/** Convert a dollars float → integer cents with proper rounding */
const toCents = (dollars: number) => Math.round(dollars * 100);

/** Get [min,max] in cents for a tier, suitable for Prisma queries */
export function tierRangeCents(tier: Tier): { minCents: number; maxCents?: number } {
  const spec = TIERS[tier];
  return {
    minCents: toCents(spec.min),
    maxCents: spec.max !== undefined ? toCents(spec.max) : undefined,
  };
}

/** Human label like "$4.99–$25.99" or "$151+" if max is omitted */
export function tierRangeLabel(tier: Tier, locale = "en-US"): string {
  const { min, max } = TIERS[tier];
  const fmt = (n: number) =>
    n.toLocaleString(locale, { style: "currency", currency: "USD", minimumFractionDigits: 2 });
  return max !== undefined ? `${fmt(min)}–${fmt(max)}` : `${fmt(min)}+`;
}
