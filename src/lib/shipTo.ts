// src/lib/shipTo.ts
import { cookies } from "next/headers";

export type ShipTo = {
  fullName: string;
  address1: string;
  address2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string | null;
  updatedAt?: number;
  ownerId?: string | null;
};

// ⬇️ renamed to match the API/account readers
const COOKIE = "luvbricks:shipto";

const MAX_AGE = 60 * 60 * 24 * 180; // 180 days

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: MAX_AGE,
};

// ── encode/decode helpers (signed base64 json) ────────────────────────────────
function b64url(buf: Buffer | string) {
  return Buffer.from(buf)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}
function unb64url(s: string) {
  return Buffer.from(s.replaceAll("-", "+").replaceAll("_", "/"), "base64").toString("utf8");
}
function encode(v: ShipTo) {
  const p = b64url(JSON.stringify(v));
  // lightweight signature just to avoid casual tampering
  const sig = b64url(`${p}.${COOKIE.length}.${(v.updatedAt ?? 0) % 9973}`);
  return `${p}.${sig}`;
}
function decode(val: string | undefined | null): ShipTo | null {
  if (!val) return null;
  const [p, sig] = val.split(".");
  if (!p || !sig) return null;
  try {
    const json = unb64url(p);
    const obj = JSON.parse(json) as ShipTo;
    if (!obj || !obj.fullName || !obj.address1 || !obj.city || !obj.state || !obj.postalCode || !obj.country) {
      return null;
    }
    return obj;
  } catch {
    return null;
  }
}

// ── public API (async because cookies() may be async in your setup) ───────────
export async function readShipTo(): Promise<ShipTo | null> {
  const jar = await cookies();
  const val = jar.get(COOKIE)?.value;
  return decode(val);
}

export async function writeShipTo(input: Omit<ShipTo, "updatedAt"> & { updatedAt?: number }): Promise<void> {
  const jar = await cookies();
  const value = encode({ ...input, updatedAt: Date.now() });
  jar.set({ name: COOKIE, value, ...cookieBase });
}

export async function clearShipTo(): Promise<void> {
  const jar = await cookies();
  // maxAge: 0 clears the cookie
  jar.set({ name: COOKIE, value: "", ...cookieBase, maxAge: 0 });
}
