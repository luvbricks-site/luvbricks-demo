// src/lib/cartClient.ts
export type AddItemInput = {
  productId: string;
  setNumber: string;
  name: string;
  imageUrl: string | null;
  tier: 1 | 2 | 3 | 4 | 5;
  msrpCents: number;
  qty: number;
  weightLb: number | null;
};

type ApiOk<T> = { ok: true; cart: T };
type ApiErr = { ok?: false; error?: string };

async function j<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Request failed');
  return data as T;
}

// ----- READ -----
export async function getCart() {
  const res = await fetch('/api/cart', { cache: 'no-store', credentials: 'same-origin' });
  return j(res);
}

// ----- ADD -----
export async function addToCart(item: AddItemInput) {
  const res = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ item }),
  });
  return (await res.json()) as ApiOk<unknown> | ApiErr;
}

// ----- SET QTY -----
export async function setQty(id: string, qty: number) {
  const res = await fetch('/api/cart', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ id, qty }),
  });
  return j(res);
}

// remove ONE row
export async function removeRow(id: string) {
  return fetch(`/api/cart?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'same-origin',
    cache: 'no-store',
  });
}

// clear ALL rows
export async function clearCart() {
  return fetch('/api/cart', {
    method: 'DELETE',
    credentials: 'same-origin',
    cache: 'no-store',
  });
}
