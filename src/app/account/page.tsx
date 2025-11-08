// src/app/account/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

/* ---------- core account types you still use ---------- */
type Me = {
  isAuthenticated: boolean;
  userId: string | null;
  firstName?: string | null;
  points?: number;
  email?: string | null;
};

type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
type Order = {
  id: string;
  number: string;
  date: string;
  status: OrderStatus;
  totalCents: number;
  trackingUrl?: string | null;
  items: { slug: string; name: string; qty: number; image?: string | null }[];
};

type AccountData = {
  me: Me;
  // addresses removed from UI; keep optional so fetch shape can include it without errors
  addresses?: unknown[];
  activeOrders: Order[];
  pastOrders: Order[];
  cookiePrefs: { analytics: boolean };
};

/* ---------- ShipTo cookie profile (cart page saves this) ---------- */
type ShipTo = {
  fullName: string;
  address1: string;
  address2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string | null;
  updatedAt?: number;
};

function usd(cents: number) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function AccountPage() {
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<string>('');

  // cookie-backed shipping
  const [shipTo, setShipTo] = useState<ShipTo | null>(null);
  const [shipToLoading, setShipToLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch('/api/account', { cache: 'no-store' });
        const json = await res.json();
        if (!alive) return;
        setData(json);
      } catch (err) {
        console.error(err);
        if (!alive) return;
        setData(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    (async () => {
    try {
      const r = await fetch(`/api/ship-to?ts=${Date.now()}`, {
        cache: "no-store",
        credentials: "include", // explicit
      });
      const j = await r.json();
      if (!alive) return;
      setShipTo(j?.shipTo ?? null);
    } catch {
      if (!alive) return;
      setShipTo(null);
    } finally {
      if (!alive) return;
      setShipToLoading(false);
    }
  })();

    return () => {
      alive = false;
    };
  }, []);

  const me = data?.me;
  const points = me?.points ?? 0;

  const helloName = useMemo(() => {
    if (!me?.isAuthenticated) return 'Guest';
    if (me.firstName?.trim()) return me.firstName.trim()!;
    if (me.email) return me.email.split('@')[0]!;
    return 'Friend';
  }, [me]);

  async function deleteShipTo() {
    try {
      setSaving('shipto:delete');
      setMsg('');
      const r = await fetch('/api/ship-to', { method: 'DELETE', credentials: 'same-origin' });
      if (!r.ok) throw new Error('Could not delete shipping address');
      setShipTo(null);
      setMsg('Saved shipping address deleted.');
    } catch (e) {
      console.error(e);
      setMsg('Sorry—could not delete that shipping address.');
    } finally {
      setSaving(null);
    }
  }

  async function updateCookiePrefs(analytics: boolean) {
    try {
      setSaving('cookies');
      setMsg('');
      const res = await fetch('/api/cookies/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analytics }),
      });
      if (!res.ok) throw new Error('Could not save preferences');
      setData((prev) => (prev ? { ...prev, cookiePrefs: { analytics } } : prev));
      setMsg('Cookie preferences updated.');
    } catch (err) {
      console.error(err);
      setMsg('Sorry—could not update cookie preferences.');
    } finally {
      setSaving(null);
    }
  }

  async function reorder(orderId: string) {
    try {
      setSaving(`reorder:${orderId}`);
      setMsg('');
      const res = await fetch('/api/orders/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Could not reorder');
      setMsg('Added to cart. You can adjust quantities at checkout.');
    } catch (err) {
      console.error(err);
      setMsg('Sorry—could not add those items to your cart.');
    } finally {
      setSaving(null);
    }
  }

  async function changePassword() {
    try {
      setSaving('password');
      setMsg('');
      const res = await fetch('/api/account/password', { method: 'POST' });
      if (!res.ok) throw new Error('Could not start password change');
      setMsg('Check your email for a secure password-change link.');
    } catch (err) {
      console.error(err);
      setMsg('Sorry—could not send password change email.');
    } finally {
      setSaving(null);
    }
  }

  async function deleteAccount() {
    const ok = confirm(
      'Are you sure you want to delete your account and all saved information? This cannot be undone.'
    );
    if (!ok) return;
    try {
      setSaving('delete');
      setMsg('');
      const res = await fetch('/api/account/delete', { method: 'POST' });
      if (!res.ok) throw new Error('Delete failed');
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      setMsg('Sorry—could not delete your account. Please contact support.');
    } finally {
      setSaving(null);
    }
  }

  async function logout() {
    try {
      setSaving('logout');
      setMsg('');
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch {
      setMsg('Sorry—could not log you out. Please try again.');
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="animate-pulse h-8 w-48 bg-slate-200 rounded" />
      </main>
    );
  }

  if (!me?.isAuthenticated) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-extrabold text-slate-900">Your LuvBricks Account</h1>
        <p className="mt-2 text-slate-700">
          Create an account or sign in to track orders, manage addresses, and earn LuvPoints.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/account/create"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
          >
            Create Account
          </Link>
          <Link
            href="/account/sign-in"
            className="inline-flex items-center rounded-md border px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      {/* HERO: Points */}
      <header className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-600">LuvPoints Balance</div>
          <div className="mt-1 text-4xl font-extrabold text-slate-900">{points.toLocaleString()}</div>
          <div className="mt-1 text-xs text-slate-500">
            Redeem 150 points for $5 off at checkout. Points post when orders ship.
          </div>
        </div>
        <Link
          href="/rewards"
          className="rounded-md bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
        >
          Rewards Info
        </Link>
      </header>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8">
        {/* LEFT: Orders */}
        <div className="space-y-8">
          {/* Active Orders */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900">In-Progress Orders</h2>
            <p className="text-sm text-slate-600 mt-1">
              Track shipments and see current status. We’ll email updates as they move.
            </p>
            <div className="mt-4 space-y-4">
              {(data?.activeOrders?.length ?? 0) === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                  No active orders right now.
                </div>
              ) : (
                data!.activeOrders.map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    onReorder={() => reorder(o.id)}
                    loading={saving === `reorder:${o.id}`}
                    showTrack
                  />
                ))
              )}
            </div>
          </section>

          {/* Past Orders */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900">Order History</h2>
            <p className="text-sm text-slate-600 mt-1">
              Reorder your favorites in a click or view receipts for details.
            </p>
            <div className="mt-4 space-y-4">
              {(data?.pastOrders?.length ?? 0) === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                  You haven’t placed an order yet—start with our{' '}
                  <Link href="/AllProducts" className="underline">
                    All Products
                  </Link>
                  .
                </div>
              ) : (
                data!.pastOrders.map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    onReorder={() => reorder(o.id)}
                    loading={saving === `reorder:${o.id}`}
                  />
                ))
              )}
            </div>
          </section>

          {msg && (
            <p className="text-sm text-slate-700" role="status">
              {msg}
            </p>
          )}
        </div>

        {/* RIGHT: Settings */}
        <aside className="space-y-8">
          {/* Profile snapshot */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h3 className="text-base font-semibold text-slate-900">Profile</h3>
            <div className="mt-2 text-sm text-slate-700">
              <div>
                <span className="text-slate-500">Name: </span>
                {helloName}
              </div>
              <div>
                <span className="text-slate-500">Email: </span>
                {me?.email}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={changePassword}
                disabled={saving === 'password'}
                className="rounded-md border px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {saving === 'password' ? 'Sending…' : 'Change Password'}
              </button>
              <button
                onClick={logout}
                disabled={saving === 'logout'}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {saving === 'logout' ? 'Log out…' : 'Log out'}
              </button>
            </div>
          </section>

          {/* Saved shipping (cookie-backed) */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h3 className="text-base font-semibold text-slate-900">Saved shipping address</h3>
            <p className="text-sm text-slate-600 mt-1">
            This address pre-fills at checkout. You can delete it here anytime.
            </p>

            <div className="mt-3">
              {shipToLoading ? (
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
              ) : !shipTo || !(
                  shipTo.fullName &&
                  shipTo.address1 &&
                  shipTo.city &&
                  shipTo.state &&
                  shipTo.postalCode &&
                  shipTo.country
                ) ? (
                <div className="text-sm text-slate-600">
                 No shipping address saved yet. Add one in your cart.
                </div>
              ) : (
                <div className="text-sm text-slate-800">
                  {/* Render clean, no stray commas */}
                  {[
                    shipTo.fullName,
                    [shipTo.address1, shipTo.address2].filter(Boolean).join(', '),
                    [shipTo.city, shipTo.state, shipTo.postalCode].filter(Boolean).join(' '),
                    shipTo.country,
                    shipTo.phone ? `Phone: ${shipTo.phone}` : null,
                  ]
                    .filter(Boolean)
                    .map((line, i) => (
                      <div key={i}>{line}</div>
                 ))}

                  <div className="mt-2 flex items-center justify-end">
                    <button
                      onClick={deleteShipTo}
                      disabled={saving === 'shipto:delete'}
                      className="text-xs text-red-600 hover:text-red-700 disabled:opacity-60"
                  >
                      {saving === 'shipto:delete' ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>

                  {shipTo.updatedAt && (
                    <div className="mt-1 text-[11px] text-slate-500">
                      Updated {new Date(shipTo.updatedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>


          {/* Privacy / Cookies */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h3 className="text-base font-semibold text-slate-900">Privacy & Cookies</h3>
            <p className="text-sm text-slate-600 mt-1">
              You can opt out of analytics cookies. Essential cookies remain on to keep login and cart working.
            </p>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium text-slate-900">Analytics cookies</div>
                <div className="text-slate-600">
                  Turn off to limit tracking. Some features may be less personalized.
                </div>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={!!data?.cookiePrefs.analytics}
                  onChange={(e) => updateCookiePrefs(e.target.checked)}
                />
                <span className="peer-checked:bg-blue-600 relative w-11 h-6 bg-slate-300 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-5" />
              </label>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Blocking essential cookies will break sign-in, cart, and checkout.
            </div>
          </section>

          {/* Danger zone */}
          <section className="rounded-2xl border border-rose-200 bg-rose-50 shadow-sm p-5">
            <h3 className="text-base font-semibold text-rose-900">Delete Account</h3>
            <p className="text-sm text-rose-900/80 mt-1">
              Permanently delete your account and all saved information. This action cannot be undone.
            </p>
            <div className="mt-3">
              <button
                onClick={deleteAccount}
                disabled={saving === 'delete'}
                className="rounded-md bg-rose-600 px-3 py-1.5 text-white font-semibold hover:bg-rose-700 disabled:opacity-60"
              >
                {saving === 'delete' ? 'Deleting…' : 'Delete my account'}
              </button>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

/* ---- UI bits ---- */

function OrderCard({
  order,
  onReorder,
  loading,
  showTrack,
}: {
  order: Order;
  onReorder: () => void;
  loading: boolean;
  showTrack?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">Order</div>
          <div className="font-semibold text-slate-900">{order.number}</div>
          <div className="text-xs text-slate-500">{new Date(order.date).toLocaleDateString()}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">Status</div>
          <div className="font-medium">{order.status}</div>
          <div className="text-sm font-semibold">{usd(order.totalCents)}</div>
        </div>
      </div>

      <ul className="mt-4 divide-y divide-slate-200">
        {order.items.map((it, i) => (
          <li key={i} className="py-2 flex items-center justify-between text-sm">
            <div className="min-w-0">
              <div className="font-medium text-slate-900 truncate">{it.name}</div>
              <div className="text-slate-600">Qty {it.qty}</div>
            </div>
            <Link href={`/products/${it.slug}`} className="text-blue-700 hover:underline">
              View
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        {showTrack && order.trackingUrl ? (
          <a
            href={order.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Track Order
          </a>
        ) : null}
        <button
          onClick={onReorder}
          disabled={loading}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? 'Adding…' : 'Reorder'}
        </button>
      </div>
    </div>
  );
}
