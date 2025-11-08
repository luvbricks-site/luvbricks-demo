// src/lib/cartBus.ts
let bc: BroadcastChannel | null = null;

function getBC() {
  try {
    if (!bc) bc = new BroadcastChannel("luvbricks:cart");
  } catch {}
  return bc;
}

/** Fire all the signals that something changed in the cart. */
export function notifyCartChanged() {
  // 1) in-page custom event (same tab, instant)
  try { window.dispatchEvent(new Event("luvbricks:cart-ping")); } catch {}

  // 2) BroadcastChannel (same tab & other tabs, instant)
  try { getBC()?.postMessage("ping"); } catch {}

  // 3) localStorage (other tabs only; harmless here)
  try { localStorage.setItem("luvbricks:cart-ping", String(Date.now())); } catch {}
}

/** Subscribe to cart-change notifications. Returns an unsubscribe fn. */
export function subscribeCartChanged(cb: () => void) {
  const onPing = () => cb();

  window.addEventListener("luvbricks:cart-ping", onPing);
  const bc = getBC();
  if (bc) bc.onmessage = onPing;

  const onStorage = (e: StorageEvent) => {
    if (e.key === "luvbricks:cart-ping") cb();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener("luvbricks:cart-ping", onPing);
    window.removeEventListener("storage", onStorage);
    try { if (bc) bc.close(); } catch {}
  };
}
