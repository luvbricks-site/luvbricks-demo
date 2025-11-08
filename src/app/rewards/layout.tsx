// src/app/rewards/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LuvPoints Rewards",
  description:
    "Earn points for purchases and simple actions. Redeem for discounts on LEGO sets.",
};

export default function RewardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // You can add shared layout wrappers for the rewards section here if desired
  return children;
}
