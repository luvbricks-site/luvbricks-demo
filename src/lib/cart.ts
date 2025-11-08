// src/lib/cart.ts
import { cookies } from "next/headers";
import { createHmac, randomUUID } from "crypto";

export type CartItem = {
  id: string;                    // cart-row id (not product id)
  productId: string;             // your product id
  setNumber: string;             // “60384”
  name: string;                  // full product name
  imageUrl: string;              // small img shown in cart
  tier: 1 | 2 | 3 | 4 | 5;       // bundle tier
  msrpCents: number;             // MSRP in cents
  qty: number;
  weightLb?: number | null;
};

export type Cart = {
  items: CartItem[];
  updatedAt: number;             // epoch ms
};

const COOKIE = "cart_v1";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: MAX_AGE,
};

function getSecret() {
  const s = process.env.CART_COOKIE_SECRET || process.env.AUTH_SECRET || "";
  if (!s) {
    // Dev fallback only
    return "dev-cart-secret-change-me";
  }
  return s;
}

function b64url(buf: Buffer | string) {
  return Buffer.from(buf)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function sign(payload: string) {
  const h = createHmac("sha256", getSecret()).update(payload).digest();
  return b64url(h);
}

function encode(cart: Cart) {
  const json = JSON.stringify(cart);
  const p = b64url(json);
  const s = sign(p);
  return `${p}.${s}`;
}

function decode(val: string | undefined | null): Cart | null {
  if (!val) return null;
  const [p, s] = val.split(".");
  if (!p || !s) return null;
  const good = sign(p) === s;
  if (!good) return null;
  try {
    const json = Buffer.from(
      p.replaceAll("-", "+").replaceAll("_", "/"),
      "base64"
    ).toString("utf8");
    const obj = JSON.parse(json) as Cart;
    if (!obj || !Array.isArray(obj.items)) return null;
    return obj;
  } catch {
    return null;
  }
}

/** Read cart from signed cookie (or return empty). */
export async function readCart(): Promise<Cart> {
  const c = (await cookies()).get(COOKIE)?.value;
  const parsed = decode(c);
  return parsed ?? { items: [], updatedAt: Date.now() };
}

/** Persist cart to signed cookie. */
export async function writeCart(cart: Cart): Promise<void> {
  const withMeta: Cart = { ...cart, updatedAt: Date.now() };
  const value = encode(withMeta);
  (await cookies()).set({
    name: COOKIE,
    value,
    ...cookieBase,
  });
}

/** Utility: create a cart row id. */
export function newRowId() {
  return randomUUID();
}

/** Upsert an item by productId (increasing qty). Returns new cart. */
export function upsertItem(
  cart: Cart,
  item: Omit<CartItem, "id"> & { id?: string },
  maxQtyPerRow = 99
): Cart {
  const existing = cart.items.find((i) => i.productId === item.productId);
  if (existing) {
    existing.qty = Math.max(
      1,
      Math.min(maxQtyPerRow, existing.qty + (item.qty || 1))
    );
    return { ...cart };
  }
  const row: CartItem = {
    id: item.id ?? newRowId(),
    productId: item.productId,
    setNumber: item.setNumber,
    name: item.name,
    imageUrl: item.imageUrl,
    tier: item.tier,
    msrpCents: item.msrpCents,
    qty: Math.max(1, Math.min(maxQtyPerRow, item.qty || 1)),
    weightLb: item.weightLb ?? null,
  };
  return { ...cart, items: [...cart.items, row] };
}

/** Update qty for a row id (<=0 removes). Returns new cart. */
export function setQty(cart: Cart, id: string, qty: number): Cart {
  const items = cart.items
    .map((it) => (it.id === id ? { ...it, qty } : it))
    .filter((it) => it.qty > 0);
  return { ...cart, items };
}

/** Remove a row id. */
export function removeRow(cart: Cart, id: string): Cart {
  return { ...cart, items: cart.items.filter((it) => it.id !== id) };
}

/** Clear cart. */
export function clearCart(): Cart {
  return { items: [], updatedAt: Date.now() };
}
