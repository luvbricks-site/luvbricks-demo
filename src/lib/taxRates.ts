// src/lib/taxRates.ts
// Base state-level sales tax rates (decimal). City/county add-ons vary
// by locality; this table is just the *state* component for estimates.
// Update anytime — cart will pick up changes automatically.

export type USState =
  | "AL" | "AK" | "AZ" | "AR" | "CA" | "CO" | "CT" | "DE" | "FL" | "GA"
  | "HI" | "ID" | "IL" | "IN" | "IA" | "KS" | "KY" | "LA" | "ME" | "MD"
  | "MA" | "MI" | "MN" | "MS" | "MO" | "MT" | "NE" | "NV" | "NH" | "NJ"
  | "NM" | "NY" | "NC" | "ND" | "OH" | "OK" | "OR" | "PA" | "RI" | "SC"
  | "SD" | "TN" | "TX" | "UT" | "VT" | "VA" | "WA" | "WV" | "WI" | "WY" | "DC";

// NOTE: These are common base state rates (rounded). You should verify before launch.
// Local add-ons are not included; this is for an *estimate* at cart.
export const TAX_RATES: Record<USState, number> = {
  AL: 0.04,  AK: 0.00,  AZ: 0.056, AR: 0.056, CA: 0.075,
  CO: 0.029, CT: 0.0635, DE: 0.00,  FL: 0.06,  GA: 0.04,
  HI: 0.04,  ID: 0.06,  IL: 0.0625, IN: 0.07,  IA: 0.06,
  KS: 0.065, KY: 0.06,  LA: 0.04, ME: 0.055, MD: 0.06,
  MA: 0.0625, MI: 0.06, MN: 0.0688, MS: 0.07,  MO: 0.04225,
  MT: 0.00,  NE: 0.055, NV: 0.0685, NH: 0.00,  NJ: 0.07,
  NM: 0.05125, NY: 0.04,  NC: 0.0475, ND: 0.05,  OH: 0.0575,
  OK: 0.045, OR: 0.00,  PA: 0.06,  RI: 0.07,  SC: 0.06,
  SD: 0.04, TN: 0.07,  TX: 0.0625, UT: 0.0595, VT: 0.06,
  VA: 0.053, WA: 0.065, WV: 0.06,  WI: 0.05,  WY: 0.04, DC: 0.06
};

export function rateForState(state: string | undefined | null): number {
  const s = (state || "").toUpperCase() as USState;
  return (TAX_RATES as Record<string, number>)[s] ?? 0;
}
