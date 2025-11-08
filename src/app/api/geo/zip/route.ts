// src/app/api/geo/zip/route.ts
import { NextResponse } from "next/server";
// NOTE: zipcodes is CommonJS. Use default import (with our shim) or require().
import zipcodes from "zipcodes";
import { rateForState } from "@/lib/taxRates";

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store");
  return res;
}

type ZipInfo = { zip: string; state: string; city?: string };
const ZIPCODES: { lookup: (z: string) => ZipInfo | null | undefined } =
  zipcodes as unknown as { lookup: (z: string) => ZipInfo | null | undefined };

export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const zip = (searchParams.get("zip") || "").trim();

  if (!/^\d{5}$/.test(zip)) {
    return noStore(NextResponse.json({ ok: false, error: "Invalid ZIP" }, { status: 400 }));
  }

  const info = ZIPCODES.lookup(zip);
  if (!info || !info.state) {
    return noStore(NextResponse.json({ ok: false, error: "ZIP not found" }, { status: 404 }));
  }

  const state = info.state.toUpperCase();
  const rate = rateForState(state); // decimal, e.g., 0.0625

  return noStore(NextResponse.json({ ok: true, zip, state, rate }));
}
