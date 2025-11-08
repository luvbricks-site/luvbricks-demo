// src/app/api/cart/route.ts
import { NextResponse } from "next/server";
import {
  readCart,
  writeCart,
  upsertItem,
  setQty,
  removeRow as removeRowFromCart,
  clearCart as clearAll,
  type Cart,
} from "@/lib/cart";
import { DEMO_MODE } from '@/lib/demoMode';

/* ---------------------------------- GET ---------------------------------- */
/** Read cart (for hydration) */
export async function GET() {
  if (DEMO_MODE) {
    return NextResponse.json(
      {
        error:
          'Demo mode: reorder is disabled in this preview environment.',
      },
      { status: 403 }
    );
  }
  const cart = await readCart(); // treat as async to satisfy TS either way
  return NextResponse.json({ ok: true, cart });
}

/* --------------------------------- POST ---------------------------------- */
/** Add or upsert items */
type AddItemInput = {
  productId: string;
  setNumber: string;
  name: string;
  imageUrl: string;
  tier: 1 | 2 | 3 | 4 | 5;
  msrpCents: number;
  qty: number;
  weightLb?: number | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as
      | { item: AddItemInput }
      | { items: AddItemInput[] };

    let cart: Cart = await readCart();

    if ("item" in body) {
      cart = upsertItem(cart, body.item);
    } else if ("items" in body) {
      for (const it of body.items) {
        cart = upsertItem(cart, it);
      }
    }

    await writeCart(cart);
    return NextResponse.json({ ok: true, cart });
  } catch (err) {
    console.error("Cart POST error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* -------------------------------- PATCH ---------------------------------- */
/** Set qty for a row id (≤0 removes the row) */
export async function PATCH(req: Request) {
  try {
    const { id, qty } = (await req.json()) as { id: string; qty: number };
    if (!id || typeof qty !== "number") {
      return NextResponse.json({ error: "id and qty required" }, { status: 400 });
    }

    let cart = await readCart();
    cart = setQty(cart, id, qty); // setQty is pure/sync
    await writeCart(cart);

    return NextResponse.json({ ok: true, cart });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* -------------------------------- DELETE --------------------------------- */
/** Remove a single row (?id=...) or clear the cart if no id provided */
export async function DELETE(req: Request) {
  try {
    // Prefer query param ?id=...
    const { searchParams } = new URL(req.url);
    let id: string | null = searchParams.get("id");

    // Optional: accept JSON body { id } as well
    if (!id) {
      try {
        const b = await req.json().catch(() => null);
        if (b && typeof b.id === "string") id = b.id;
      } catch {
        /* ignore */
      }
    }

    if (id) {
      const current = await readCart();
      const cart = removeRowFromCart(current, id);
      await writeCart(cart);
      return NextResponse.json({ ok: true, cart });
    }

    // No id → clear all
    const empty = clearAll();
    await writeCart(empty);
    return NextResponse.json({ ok: true, cart: empty });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
