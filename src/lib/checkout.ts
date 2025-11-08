
import { computeBundleDiscountCents, BundleItem } from "./bundle";
import { computeShipping, ShipItem } from "./shipping";

export type TotalsInput = {
  items: (BundleItem & ShipItem)[]; // merged shape: tier, msrpCents, qty, weightLb
  userPointsAvailable: number;      // integer points
  requestedRedeemPoints: number;    // from the UI
  taxRatePct?: number;              // e.g., 7.5 -> 7.5%
};

export type TotalsResult = {
  msrpSubtotalCents: number;

  redeemablePointsMax: number;       // max points allowed this order
  appliedRedeemPoints: number;        // multiple of 150
  appliedRedeemCents: number;         // 150 pts -> 500 cents

  bundleDiscountCents: number;        // positive number; show “-” in UI

  subAfterRewardsCents: number;
  subAfterRewardsAndBundleCents: number;

  taxCents: number;

  shippingBaseCents: number;
  shippingCreditCents: number;
  shippingFinalCents: number;

  grandTotalCents: number;
};

// Convert points to money: 150 → $5
function pointsToCents(points: number): number {
  const blocks = Math.floor(points / 150);
  return blocks * 500; // cents
}

export function computeTotals(input: TotalsInput): TotalsResult {
  const { items, userPointsAvailable, requestedRedeemPoints, taxRatePct = 0 } = input;

  // MSRP subtotal
  const msrpSubtotalCents = items.reduce(
    (sum, it) => sum + it.msrpCents * it.qty,
    0
  );

  // Rewards redemption
  const maxBlocksBySubtotal = Math.floor(msrpSubtotalCents / 500); // each block is $5
  const maxPointsBySubtotal = maxBlocksBySubtotal * 150;
  const redeemablePointsMax = Math.min(userPointsAvailable, maxPointsBySubtotal);

  const requestedBlocks = Math.floor(Math.max(0, requestedRedeemPoints) / 150);
  const appliedBlocks = Math.min(
    requestedBlocks,
    Math.floor(redeemablePointsMax / 150)
  );
  const appliedRedeemPoints = appliedBlocks * 150;
  const appliedRedeemCents = pointsToCents(appliedRedeemPoints); // ✅ use the helper

  const subAfterRewardsCents = Math.max(0, msrpSubtotalCents - appliedRedeemCents);

  // Bundle discount (order-level)
  const bundleDiscountCents = computeBundleDiscountCents(items);
  const subAfterRewardsAndBundleCents = Math.max(
    0,
    subAfterRewardsCents - bundleDiscountCents
  );

  // Taxes (placeholder flat %; swap in your real calc later)
  const taxCents = Math.round(subAfterRewardsAndBundleCents * (taxRatePct / 100));

  // Shipping (base and company credit)
  const ship = computeShipping(items);
  const shippingBaseCents = ship.baseShippingCents;
  const shippingCreditCents = ship.creditCents;
  const shippingFinalCents = ship.finalShippingCents;

  const grandTotalCents =
    subAfterRewardsAndBundleCents + taxCents + shippingFinalCents;

  return {
    msrpSubtotalCents,

    redeemablePointsMax,
    appliedRedeemPoints,
    appliedRedeemCents,

    bundleDiscountCents,

    subAfterRewardsCents,
    subAfterRewardsAndBundleCents,

    taxCents,

    shippingBaseCents,
    shippingCreditCents,
    shippingFinalCents,

    grandTotalCents,
  };
}
