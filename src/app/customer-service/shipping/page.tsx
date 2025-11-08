export default function Page() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Shipping (U.S. Only)</h2>
      {/* Policy summary */}
<p className="mt-2 text-med text-slate-700">
  Our shipping is tier-linked and fully transparent, no surprises. When you buy
  <strong> 3+ sets in the same tier</strong>, your checkout rate is:
  <strong> Tier 1–3:</strong> you pay standard ground by packed weight (see table below).
  <strong> Tier 4:</strong> a flat <strong>$12.50</strong> after a <strong>$5 LuvBricks credit</strong>
  (full ground for this tier averages ≈ <strong>$17.50</strong>).
  <strong> Tier 5:</strong> a flat <strong>$10.00</strong> after a <strong>$10 LuvBricks credit</strong>
  (full ground for this tier averages ≈ <strong>$20.00</strong>).
  If a packed shipment in <em>any</em> tier weighs over <strong>12.5 lb</strong>, we charge a flat
  <strong> $38.00 FedEx Express Saver</strong> instead of the tier rates above. Every order ships within 24 hours
  on business days with tracking and careful, collector-grade packing. Any non-bundle orders will be charged the standard ground rate by weight (see table below).
</p>


{/* Tier 1–3 weight table */}
<div className="mt-6">
  <div className="text-sm font-semibold text-slate-900">Tier 1–3 Ground Rates (Customer Pays)</div>
  <table className="mt-2 w-full text-sm text-slate-700 border-collapse">
    <thead>
      <tr className="text-left">
        <th className="border-b border-slate-200 py-2 pr-4">Packed Weight</th>
        <th className="border-b border-slate-200 py-2">Shipping</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className="py-2 pr-4 border-b border-slate-100">0–2 oz</td>
        <td className="py-2 border-b border-slate-100">$4.50</td>
      </tr>
      <tr>
        <td className="py-2 pr-4 border-b border-slate-100">2.01–6 oz</td>
        <td className="py-2 border-b border-slate-100">$6.00</td>
      </tr>
      <tr>
        <td className="py-2 pr-4 border-b border-slate-100">6.01–14 oz</td>
        <td className="py-2 border-b border-slate-100">$7.50</td>
      </tr>
      <tr>
        <td className="py-2 pr-4 border-b border-slate-100">14.01 oz–1 lb</td>
        <td className="py-2 border-b border-slate-100">$9.50</td>
      </tr>
      <tr>
        <td className="py-2 pr-4 border-b border-slate-100">1.01–4 lb</td>
        <td className="py-2 border-b border-slate-100">$15.00</td>
      </tr>
      <tr>
        <td className="py-2 pr-4 border-b border-slate-100">4.01–12.5 lb</td>
        <td className="py-2 border-b border-slate-100">$20.00</td>
      </tr>
      <tr>
        <td className="py-2 pr-4">≥ 12.5 lb (any tier)</td>
        <td className="py-2">$38.00 (FedEx Express Saver)</td>
      </tr>
    </tbody>
  </table>
  <p className="mt-2 text-sm text-slate-500">
    Rates apply to the packed shipment weight (we combine items in the same order). Tier 4 and Tier 5 carts
    show the flat rate and the LuvBricks shipping credit applied automatically at checkout.
  </p>
</div>



      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="font-semibold text-slate-900">Carriers</div>
          <ul className="mt-2 list-disc pl-5 text-med text-slate-700">
            <li>USPS First Class / Priority</li>
            <li>UPS Ground / 2-Day (when available)</li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="font-semibold text-slate-900">Tracking & Insurance</div>
          <p className="mt-2 text-med text-slate-700">
            All orders include tracking. Orders under $100 are insured automatically. A small optional insurance fee applies on orders over $100. Just check the box at checkout to see the rate.
          </p>
        </div>
      </div>
    </div>
  );
}
