// src/app/api/ship-to/route.ts
import { NextResponse } from "next/server";
import { readShipTo, writeShipTo, clearShipTo, type ShipTo } from "@/lib/shipTo";

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function GET() {
  const shipTo = await readShipTo();
  const res = NextResponse.json({ ok: true, shipTo });
  return noStore(res);
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as Partial<ShipTo>;

    // basic validation – require core fields
    const required = ["fullName", "address1", "city", "state", "postalCode", "country"] as const;
    for (const k of required) {
      if (!body[k] || String(body[k]).trim() === "") {
        const res = NextResponse.json({ ok: false, error: `Missing ${k}` }, { status: 400 });
        return noStore(res);
      }
    }

    // write cookie with correct scope
    await writeShipTo({
      fullName: String(body.fullName).trim(),
      address1: String(body.address1).trim(),
      address2: (body.address2 ?? "").toString().trim(),
      city: String(body.city).trim(),
      state: String(body.state).trim(),
      postalCode: String(body.postalCode).trim(),
      country: String(body.country).trim(),
      phone: (body.phone ?? "").toString().trim(),
    });

    const saved = await readShipTo();
    const res = NextResponse.json({ ok: true, shipTo: saved });
    return noStore(res);
  } catch {
    const res = NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    return noStore(res);
  }
}

export async function DELETE() {
  await clearShipTo();
  const res = NextResponse.json({ ok: true });
  return noStore(res);
}
