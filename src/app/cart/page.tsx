// src/app/cart/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { computeTotals, type TotalsInput } from '@/lib/checkout';
import type { CartItem } from '@/lib/cart';
import {
  getCart as apiGetCart,
  setQty as apiSetQty,
  removeRow as apiRemoveRow,
  clearCart as apiClearCart,
} from '@/lib/cartClient';
import { notifyCartChanged } from '@/lib/cartBus';
import { SiPaypal, SiStripe } from 'react-icons/si';
import ShippingForm from '@/components/checkout/ShippingForm';

const LS_TAX_ZIP = 'luvbricks:taxZip';

type Me = {
  isAuthenticated: boolean;
  points?: number | null;
};

type CartData = { items: CartItem[]; updatedAt: number };
type CartAPIResponse = CartData | { cart: CartData };
const normalizeCart = (data: CartAPIResponse): CartData =>
  'cart' in data ? data.cart : data;

const fmtMoney = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});
const cents = (n: number) => fmtMoney.format((n || 0) / 100);

export default function CartPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [redeemInput, setRedeemInput] = useState<string>(''); // raw text
  const [loading, setLoading] = useState(false);
  const [taxZip, setTaxZip] = useState<string>('');
  const [taxState, setTaxState] = useState<string>('');
  const [taxRate, setTaxRate] = useState<number>(0); // decimal (e.g., 0.0625)
  const [taxLoading, setTaxLoading] = useState(false);
  const [taxErr, setTaxErr] = useState<string | null>(null);

  // NEW: shipping insurance checkbox (persisted)
  const [insure, setInsure] = useState<boolean>(false);
  useEffect(() => {
    const saved =
      typeof window !== 'undefined'
        ? localStorage.getItem('luvbricks:insure')
        : null;
    if (saved === '1') setInsure(true);
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luvbricks:insure', insure ? '1' : '0');
    }
  }, [insure]);

  // Load cart + me
  useEffect(() => {
    let alive = true;

    async function loadAll() {
      try {
        const [cartData, meRes] = await Promise.all([
          apiGetCart() as Promise<CartAPIResponse>,
          fetch('/api/me', { cache: 'no-store' }),
        ]);
        const meJson = await meRes.json();
        if (!alive) return;

        setCart(normalizeCart(cartData));
        setMe(
          meJson?.isAuthenticated !== undefined
            ? (meJson as Me)
            : meJson?.me?.isAuthenticated !== undefined
            ? (meJson.me as Me)
            : null
        );
      } catch {
        if (!alive) return;
        setCart({ items: [], updatedAt: Date.now() });
        setMe(null);
      }
    }

    loadAll();

    // [tax] prefill ZIP from localStorage or saved ship-to cookie
    (async () => {
      try {
        const lsZip = localStorage.getItem(LS_TAX_ZIP) || '';
        if (lsZip) {
          setTaxZip(lsZip);
          await estimateTax(lsZip);
          return;
        }
        const r = await fetch('/api/ship-to', { cache: 'no-store' });
        const j = await r.json();
        const z = j?.shipTo?.postalCode?.toString().slice(0, 5);
        if (z && /^\d{5}$/.test(z)) {
          setTaxZip(z);
          await estimateTax(z);
        }
      } catch {
        /* ignore */
      }
    })();

    // Live refresh across tabs
    function onPing(e: StorageEvent) {
      if (e.key === 'luvbricks:cart-ping') loadAll();
    }
    window.addEventListener('storage', onPing);
    const t = setInterval(loadAll, 60_000); // soft auto-refresh each minute

    return () => {
      alive = false;
      window.removeEventListener('storage', onPing);
      clearInterval(t);
    };
  }, []);

  // Helpers to mutate cart
  async function setQty(id: string, qty: number) {
    setLoading(true);
    try {
      await apiSetQty(id, qty);
      notifyCartChanged(); // instant badge updates (same tab + other tabs)
      const data = (await apiGetCart()) as CartAPIResponse;
      setCart(normalizeCart(data));
    } finally {
      setLoading(false);
    }
  }

  async function removeRow(id: string) {
    setLoading(true);
    try {
      await apiRemoveRow(id);
      notifyCartChanged();
      const data = (await apiGetCart()) as CartAPIResponse;
      setCart(normalizeCart(data));
    } finally {
      setLoading(false);
    }
  }

  async function clearCart() {
    setLoading(true);
    try {
      await apiClearCart();
      notifyCartChanged();
      const data = (await apiGetCart()) as CartAPIResponse;
      setCart(normalizeCart(data));
    } finally {
      setLoading(false);
    }
  }

  const userPoints = Math.max(0, Number(me?.points ?? 0));
  const requestedRedeemPoints = useMemo(() => {
    // clamp to multiples of 150; computeTotals also guards, but this keeps the UI clean
    const n = Math.max(0, Math.floor(Number(redeemInput || '0')));
    return Math.floor(n / 150) * 150;
  }, [redeemInput]);

  // [tax] Estimate handler (ZIP -> state/rate)
  async function estimateTax(zip: string) {
    setTaxErr(null);
    setTaxLoading(true);
    try {
      if (!/^\d{5}$/.test(zip)) {
        setTaxRate(0);
        setTaxState('');
        return;
      }
      const r = await fetch(`/api/geo/zip?zip=${zip}`, { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error || 'Lookup failed');
      setTaxState(j.state);
      setTaxRate(Number(j.rate) || 0);
      localStorage.setItem(LS_TAX_ZIP, zip);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Could not estimate tax';
      setTaxRate(0);
      setTaxState('');
      setTaxErr(msg);
    } finally {
      setTaxLoading(false);
    }
  }

  const totals = useMemo(() => {
    const items: TotalsInput['items'] = (cart?.items ?? [])
      .filter((it) => it.qty > 0)
      .map((it) => ({
        // BundleItem shape
        name: it.name,
        msrpCents: it.msrpCents,
        tier: it.tier,
        qty: it.qty,
        // ShipItem shape
        productId: it.productId,
        weightLb: it.weightLb ?? 0,
      }));

    const taxRatePct = taxRate * 100;

    const input: TotalsInput = {
      items,
      userPointsAvailable: userPoints,
      requestedRedeemPoints,
      taxRatePct,
    };
    return computeTotals(input);
  }, [cart, userPoints, requestedRedeemPoints, taxRate]);

  // Points accrue on merchandise subtotal AFTER rewards & bundle discounts (excludes tax/shipping).
  // 1 point per $1 => floor(cents / 100). Clamp at 0 for safety.
  const pointsEarned = useMemo(() => {
    const centsVal = totals?.subAfterRewardsAndBundleCents ?? 0;
    return Math.max(0, Math.floor(centsVal / 100));
  }, [totals?.subAfterRewardsAndBundleCents]);

  const hasItems = (cart?.items?.some((i) => i.qty > 0) ?? false);
  const authed = !!me?.isAuthenticated;
  const disableRedeem = !authed || totals.redeemablePointsMax <= 0;

  // ensure $0 shipping when cart is empty
  const shippingBaseDisplay = hasItems ? totals.shippingBaseCents : 0;
  const shippingCreditDisplay = hasItems ? totals.shippingCreditCents : 0;
  const shippingFinalDisplay = hasItems ? totals.shippingFinalCents : 0;

  const totalSavingsCents =
    (totals.appliedRedeemCents || 0) +
    (totals.bundleDiscountCents || 0) +
    (shippingCreditDisplay || 0);

  // NEW: Insurance amount ($1 per $100 of merchandise subtotal, rounded up)
  const merchandiseCents = totals.subAfterRewardsAndBundleCents;
  const insuranceCents = useMemo(() => {
    if (!insure) return 0;
    const units = Math.ceil(
      Math.max(0, merchandiseCents) / 10_000
    ); // 10,000 cents = $100
    return units * 100; // 100 cents = $1 per $100 block
  }, [insure, merchandiseCents]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8">

      {/* Left: cart list */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">Your Cart</h1>
          {(cart?.items?.length ?? 0) > 0 && (
            <button
              onClick={clearCart}
              disabled={loading}
              className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-60"
            >
              Clear cart
            </button>
          )}
        </div>

        {(!cart || cart.items.length === 0) && (
          <div className="px-5 pb-6 text-slate-600">
            Your cart is empty.{' '}
            <Link href="/AllProducts" className="underline">
              Browse sets
            </Link>
            .
          </div>
        )}

        <ul className="divide-y divide-slate-200">
          {(cart?.items ?? []).map((row) => (
            <li key={row.id} className="p-5 flex gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border">
                <Image
                  src={row.imageUrl || '/icon.png'}
                  alt={row.name}
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-slate-900">
                      {row.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      Set #{row.setNumber}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    {cents(row.msrpCents * row.qty)}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <label className="text-xs text-slate-600">Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={row.qty}
                    onChange={(e) =>
                      setQty(
                        row.id,
                        Math.max(0, Number(e.target.value))
                      )
                    }
                    className="h-8 w-16 rounded-md border px-2 text-sm"
                  />
                  <button
                    onClick={() => removeRow(row.id)}
                    className="text-xs text-slate-600 hover:text-slate-900"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Right: checkout summary */}
      <aside className="rounded-2xl border border-slate-200 bg-slate-50 shadow-sm h-fit p-5">
        <h2 className="text-base font-semibold text-slate-900">Checkout</h2>

        <Row label="Items (MSRP)" value={cents(totals.msrpSubtotalCents)} />

        {/* Redeem points input */}
        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-medium text-slate-900">
              Redeem points
            </label>
            <small className="text-xs text-slate-500">
              150 pts = $5. Multiples of 150 only.
            </small>
          </div>
          <div className="mt-1 flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={redeemInput}
              onChange={(e) => setRedeemInput(e.target.value)}
              disabled={disableRedeem}
              className="h-10 w-40 rounded-md border bg-white px-3 text-sm disabled:opacity-60"
            />
            <div className="text-xs text-slate-600 self-center">
              Available:{' '}
              <span className="font-medium">
                {authed ? userPoints : 0}
              </span>
            </div>
          </div>
        </div>

        <Row
          label="Subtotal after rewards"
          value={cents(totals.subAfterRewardsCents)}
          className="mt-3"
        />
        <Row
          label="Bundle savings"
          value={`– ${cents(totals.bundleDiscountCents)}`}
        />
        <Row
          label={<span className="text-slate-900">Subtotal</span>}
          value={cents(totals.subAfterRewardsAndBundleCents)}
        />
        <Row
          label="Points you'll earn"
          value={`${pointsEarned.toLocaleString()} pts`}
        />

        {/* NEW: Shipping insurance (before tax) */}
        <div className="mt-2 flex items-start justify-between">
          <label className="text-sm text-slate-600 inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={insure}
              onChange={(e) => setInsure(e.target.checked)}
              className="h-4 w-4"
            />
            <span>
              Add shipping insurance ($1 per $100, rounded up)
            </span>
          </label>
          <span className="text-sm text-slate-900">
            {cents(insuranceCents)}
          </span>
        </div>

        {/* [tax] ZIP-based estimator */}
        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-medium text-slate-900">
              Estimate tax by ZIP
            </label>
            {taxState ? (
              <small className="text-xs text-slate-500">
                State: {taxState} · Rate:{' '}
                {(taxRate * 100).toFixed(2)}%
              </small>
            ) : null}
          </div>
          <div className="mt-1 flex gap-2">
            <input
              inputMode="numeric"
              maxLength={5}
              placeholder="ZIP (5 digits)"
              value={taxZip}
              onChange={(e) => {
                const v = e.target.value
                  .replace(/\D/g, '')
                  .slice(0, 5);
                setTaxZip(v);
              }}
              onBlur={() => estimateTax(taxZip)}
              className="h-10 w-40 rounded-md border bg-white px-3 text-sm"
            />
            <button
              type="button"
              onClick={() => estimateTax(taxZip)}
              disabled={
                taxLoading || !/^\d{5}$/.test(taxZip)
              }
              className="h-10 rounded-md border px-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
            >
              {taxLoading ? 'Looking up…' : 'Apply'}
            </button>
          </div>
          {taxErr && (
            <div className="mt-1 text-xs text-red-600">
              {taxErr}
            </div>
          )}
        </div>

        {/* Replace fixed “Estimated tax” with computed one */}
        <Row label="Estimated tax" value={cents(totals.taxCents)} />

        {/* Shipping rows – show $0 when empty */}
        <Row
          label="Shipping"
          value={cents(shippingBaseDisplay)}
        />
        {shippingCreditDisplay > 0 && (
          <Row
            label="Shipping credit"
            value={`– ${cents(shippingCreditDisplay)}`}
          />
        )}

        {/* Total savings line */}
        <Row
          label={
            <span className="text-emerald-700">
              Total savings
            </span>
          }
          value={
            <span className="text-emerald-700">
              – {cents(totalSavingsCents)}
            </span>
          }
        />

        <Row
          label="Shipping total"
          value={cents(shippingFinalDisplay)}
        />

        <div className="mt-4 border-t border-slate-200 pt-3">
          <Row
            label={
              <span className="text-lg font-semibold">
                Total
              </span>
            }
            value={
              <span className="text-lg font-semibold">
                {cents(
                  totals.grandTotalCents + insuranceCents
                )}
              </span>
            }
          />
        </div>

        {/* Shipping address form */}
        <ShippingForm
          onSaved={() => {
            // keep UI in sync if needed later
          }}
        />

        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            {/* Stripe */}
            <button
              type="button"
              disabled={!hasItems || loading}
              onClick={async () => {
                await window.luvbricks_saveShipTo?.();
                alert(
                  'Stripe checkout would start here. Shipping address saved.'
                );
              }}
              className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              title="Pay with Stripe"
            >
              <SiStripe
                size={18}
                aria-hidden
                className="opacity-80"
              />
            </button>

            {/* PayPal */}
            <button
              type="button"
              disabled={!hasItems || loading}
              onClick={async () => {
                await window.luvbricks_saveShipTo?.();
                alert(
                  'PayPal checkout would start here. Shipping address saved.'
                );
              }}
              className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              title="Pay with PayPal"
            >
              <SiPaypal
                size={18}
                aria-hidden
                className="opacity-80"
              />
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            In this demo environment, checkout and payment are
            disabled. On launch, third-party payments will be
            processed securely by PayPal or Stripe; LuvBricks will
            only store the minimal tokenized information required
            to fulfill orders.
          </p>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Bundle Discounts are applied at the order level;
          line-item MSRP remains at/above MAP. Shipping credits
          follow the tier &amp; weight policy.
        </p>
      </aside>
    </main>
  );
}

function Row({
  label,
  value,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mt-2 flex items-baseline justify-between ${
        className || ''
      }`}
    >
      <span className="text-sm text-slate-600">
        {label}
      </span>
      <span className="text-sm text-slate-900">
        {value}
      </span>
    </div>
  );
}
