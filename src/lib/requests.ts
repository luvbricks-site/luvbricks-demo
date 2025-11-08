// src/lib/requests.ts
import type { SetRequest, SetSupport } from "@prisma/client";

export function computeProgress(req: SetRequest & { supports: SetSupport[] }) {
  const votes = req.supports.filter(s => s.type === "vote").length;
  const deposits = req.supports.filter(s => s.type === "deposit" && !s.refundedAt).length;

  // Weight deposits as 2 votes (they convert better). Tweak as desired.
  const weighted = votes + deposits * 2;

  const target = Math.min(req.thresholdVotes, req.thresholdDepos ?? req.thresholdVotes);
  const pct = target > 0 ? Math.min(100, Math.round((weighted / target) * 100)) : 0;

  return { votes, deposits, weighted, target, pct };
}

// Quick USD formatter
export const money = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
