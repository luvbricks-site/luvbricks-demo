// src/components/AddToCartButton.tsx
'use client';

import { useState } from 'react';
import { addToCart } from '@/lib/cartClient';
import { notifyCartChanged } from '@/lib/cartBus';

type Props = {
  productId: string;
  setNumber: string;
  name: string;
  imageUrl?: string;               // will default to '/icon.png'
  tier: 1 | 2 | 3 | 4 | 5;
  msrpCents: number;
  weightLb?: number | null;
  /** Pass false when the product is out of stock; omit/true keeps button enabled */
  inStock?: boolean;
  className?: string;
};

export default function AddToCartButton(props: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Treat as available unless explicitly false
  const available = props.inStock !== false;
  const disabled = busy || !available;

  async function onAdd() {
    if (disabled) return; // no-ops when busy or OOS
    setBusy(true);
    setMsg(null);

    try {
      const img = props.imageUrl ?? '/icon.png';

      const res = await addToCart({
        productId: props.productId,
        setNumber: props.setNumber,
        name: props.name,
        imageUrl: img,
        tier: props.tier,
        msrpCents: props.msrpCents,
        qty: 1,
        weightLb: props.weightLb ?? null,
      });

      if (!res?.ok) {
        if (res?.error === 'OUT_OF_STOCK') {
          throw new Error('This item is currently out of stock.');
        }
        throw new Error(res?.error || 'Could not add to cart');
      }

      setMsg('Added!');
      notifyCartChanged();
      try {
        localStorage.setItem('luvbricks:cart-ping', String(Date.now()));
      } catch {
        /* ignore localStorage issues */
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sorry—could not add that.';
      setMsg(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        aria-disabled={disabled}
        title={available ? 'Add to cart' : 'Temporarily out of stock'}
        className={
          props.className ??
          [
            'rounded-xl px-5 py-3 font-semibold transition',
            disabled
              ? 'cursor-not-allowed bg-slate-200 text-slate-400'
              : 'bg-blue-600 text-white hover:bg-blue-700',
          ].join(' ')
        }
      >
        {available ? (busy ? 'Adding…' : 'Add to Cart') : 'Out of stock'}
      </button>

      {msg && (
        <span className="text-xs text-slate-600" aria-live="polite">
        {msg}
        </span>
      )}
    </div>
  );
}
