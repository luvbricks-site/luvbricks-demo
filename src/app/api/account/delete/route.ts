// src/app/api/account/delete/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { clearShipTo } from "@/lib/shipTo"; // ← add
import { DEMO_MODE } from '@/lib/demoMode';

export async function POST() {
  if (DEMO_MODE) {
    return NextResponse.json(
      {
        error:
          'Demo mode: reorder is disabled in this preview environment.',
      },
      { status: 403 }
    );
  }
  try {
    const c = await cookies();
    const token = c.get("session")?.value;

    // Find the user via session token
    const session = token
      ? await prisma.session.findUnique({ where: { token }, include: { user: true } })
      : null;

    // Helper to clear client cookies (ship-to + cart + session)
    const clearClientCookies = async () => {
      // ship-to cookie (helper handles httpOnly/sameSite/etc.)
      await clearShipTo();

      // cart cookie
      c.set({
        name: "cart_v1",
        value: "",
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 0, // delete
      });

      // session cookie (you already had this; keep it)
      c.set("session", "", { path: "/", expires: new Date(0) });
    };

    if (!session?.user) {
      c.set("session", "", { path: "/", expires: new Date(0) });
      await clearShipTo();
      await clearClientCookies();
      return NextResponse.json({ ok: true });
    }

    const userId = session.user.id;

    // Keep order rows for bookkeeping but anonymize them
    await prisma.$transaction([
      prisma.pointsLedger.deleteMany({ where: { userId } }),
      prisma.address.deleteMany({ where: { userId } }),
      prisma.order.updateMany({ where: { userId }, data: { userId: null } }), // anonymize
      prisma.session.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    // clear cookies (ship-to, cart, session)
    await clearClientCookies();

    // Clear cookies
    c.set("session", "", { path: "/", expires: new Date(0) });
    await clearShipTo();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

