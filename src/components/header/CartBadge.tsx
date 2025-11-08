"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { subscribeCartChanged } from "@/lib/cartBus";

export default function CartBadge() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let alive = true;
    let controller: AbortController | null = null;

    const refresh = async () => {
      try {
        controller?.abort();
        controller = new AbortController();
        const r = await fetch("/api/cart", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });
        const j = await r.json();
        const items: { qty: number }[] = j?.cart?.items ?? j?.items ?? [];
        const totalQty = items.reduce((s, it) => s + (Number(it.qty) || 0), 0);
        if (!alive) return;
        setCount(totalQty);
      } catch {
        /* ignore transient errors */
      }
    };

    // Initial load
    refresh();

    // Realtime bus (same-tab)
    const unsubscribe = subscribeCartChanged((detail?: { delta?: number }) => {
      // Optimistic bump for instant feedback
      if (typeof detail?.delta === "number") {
        setCount((c) => Math.max(0, c + detail.delta!));
      }
      // Then confirm with the server
      refresh();
    });

    // Cross-tab/localStorage backstop
    const onStorage = (e: StorageEvent) => {
      if (e.key === "luvbricks:cart-ping") refresh();
    };
    window.addEventListener("storage", onStorage);

    // Keep fresh when user returns to this tab
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVis);

    // Lightweight backstop every 5s
    const t = setInterval(refresh, 5_000);

    return () => {
      alive = false;
      unsubscribe();
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(t);
      controller?.abort();
    };
  }, []);

  return (
    <Link
      href="/cart"
      aria-label="Cart"
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white hover:bg-slate-50"
      title="Cart"
    >
      {/* cart icon */}
      <svg width="22" height="22" viewBox="0 0 24 24" className="text-slate-700">
        <path
          fill="currentColor"
          d="M7 18a2 2 0 1 0 0 4a2 2 0 0 0 0-4m10 0a2 2 0 1 0 0 4a2 2 0 0 0 0-4M7.2 14h9.9a2 2 0 0 0 1.94-1.52l1.84-7.36H6.42l-.33-1.32A2 2 0 0 0 4.14 2H2v2h2.14l2.72 10.87A2 2 0 0 0 8.8 16H19v-2H8.8z"
        />
      </svg>

      {/* qty badge */}
      {count > 0 && (
        <span className="absolute -top-1 -right-1 rounded-full bg-amber-500 text-white text-[10px] leading-[14px] px-1.5">
          {Math.min(count, 99)}
        </span>
      )}

      {/* hover pill */}
      <span className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
        Cart
      </span>
    </Link>
  );
}
