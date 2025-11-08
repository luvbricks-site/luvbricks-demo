// src/app/bundle/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Bundle Program | LuvBricks",
  description:
    "Save automatically when you buy 3 or more sets in the same price tier. Discounts are order-level, line-item prices stay at/above MSRP. Stacks with LuvPoints redemptions.",
};

export default function BundleProgramPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-extrabold text-slate-900">Bundle Program</h1>
        <p className="mt-3 text-slate-700">
          Our Tiered Bundling makes it easy to save—no coupons or math required. Add{" "}
          <strong>3 or more sets from the same price tier</strong> to your cart and a
          <strong> Bundle Discount</strong> is applied at checkout automatically. Line-item
          prices remain at MSRP (collector-safe); the savings appear as an order-level
          discount. Best of all, bundle savings <strong>stack with LuvPoints</strong> redemptions,
          so you can combine your bundle with a points reward for extra value. 
        </p>

        <ul className="mt-4 list-disc pl-5 text-sm text-slate-700 space-y-1.5">
            <li>Bundle discounts are <strong>available</strong> for <strong>non registered guests</strong></li>
          <li>Discount triggers when <strong>3+ sets</strong> in the same price tier are in the cart.</li>
          <li>Shown at checkout as an order-level “Bundle Discount.”</li>
          <li>Works alongside LuvPoints—redeem points and keep your bundle savings.</li>
          <li>Line-item prices stay at MSRP.</li>
        </ul>
      </header>

      {/* Table */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">Tiered Bundling System</h2>
        <p className="mt-1 text-sm text-slate-600">
          Auto-applied when 3+ sets in the same price tier are in the cart.
        </p>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Tier #</th>
                <th className="px-4 py-2 text-left font-semibold">Price Range (MSRP)</th>
                <th className="px-4 py-2 text-left font-semibold">Buy 3</th>
                <th className="px-4 py-2 text-left font-semibold">Buy 4</th>
                <th className="px-4 py-2 text-left font-semibold">Buy 5+</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">1</td>
                <td className="px-4 py-3">$4.99 – $25.99</td>
                <td className="px-4 py-3">9%</td>
                <td className="px-4 py-3">10%</td>
                <td className="px-4 py-3">11%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">2</td>
                <td className="px-4 py-3">$26 – $60.99</td>
                <td className="px-4 py-3">8%</td>
                <td className="px-4 py-3">9%</td>
                <td className="px-4 py-3">10%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">3</td>
                <td className="px-4 py-3">$61 – $100.99</td>
                <td className="px-4 py-3">6%</td>
                <td className="px-4 py-3">7%</td>
                <td className="px-4 py-3">8%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">4</td>
                <td className="px-4 py-3">$101 – $150.99</td>
                <td className="px-4 py-3">5%</td>
                <td className="px-4 py-3">6%</td>
                <td className="px-4 py-3">7%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">5</td>
                <td className="px-4 py-3">$151 – $300</td>
                <td className="px-4 py-3">3%</td>
                <td className="px-4 py-3">4%</td>
                <td className="px-4 py-3">5%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Discounts are calculated on eligible items in the same tier at checkout. Line-item prices
          remain at MSRP; the savings appear as a single order-level Bundle Discount.
        </p>
      </section>

      {/* Helpful links */}
      <section className="mt-10 flex flex-wrap items-center gap-3">
        <Link
          href="/tiers"
          className="rounded-md bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
        >
          Shop by Tier
        </Link>
        <Link
          href="/rewards"
          className="rounded-md border px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
        >
          LuvPoints Rewards
        </Link>
        <Link
          href="/customer-service"
          className="rounded-md border px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
        >
          Customer Service
        </Link>
      </section>
    </main>
  );
}
