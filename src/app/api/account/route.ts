// src/app/api/account/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromSession } from "@/lib/auth";

/**
 * GET  /api/account
 * Returns the signed-in user's account snapshot used by the Account page.
 */
export async function GET() {
  const user = await getUserFromSession();

  // Not signed in → return a safe, minimal shape the UI can handle.
  if (!user) {
    return NextResponse.json({
      me: { isAuthenticated: false, userId: null },
      addresses: [],
      activeOrders: [],
      pastOrders: [],
      cookiePrefs: { analytics: true },
    });
  }

  // ---- Fetch data in parallel ----
  const [addresses, ordersBase] = await Promise.all([
    prisma.address.findMany({
      where: { userId: user.id },
      // If your Address model doesn't have createdAt, sort by something that does exist.
      // We'll keep primary sort by default flag, then name for stability.
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        line1: true,
        line2: true,
        city: true,
        state: true,
        zip: true,
        isDefault: true,
      },
    }),

    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      // Your Order model (from your schema) does not have `status`.
      // Select fields you actually have; we'll synthesize a status below.
      select: {
        id: true,
        createdAt: true,
        totalCents: true,
        // Add other columns here if/when they exist.
      },
    }),
  ]);

  // Type what we selected from Prisma
  type OrderRow = {
    id: string;
    createdAt: Date;
    totalCents: number;
    // If you later add a real status column, keep it optional here:
    // status?: "Processing" | "Shipped" | "Delivered" | "Cancelled" | null;
  };
  // Add this above the mapper
type OrderStatus = "Processing" | "Shipped" | "Delivered" | "Cancelled";

type OrderUI = {
  id: string;
  date: Date;
  totalCents: number;
  status: OrderStatus;
};


  // Normalize order shape for the UI (inject a synthetic "Processing" status for now)
  const orders: OrderUI[] = (ordersBase as OrderRow[]).map((o) => ({
  id: o.id,
  date: o.createdAt,      // UI convenience alias
  totalCents: o.totalCents,
  status: "Processing" as OrderStatus, // until you add a real DB status
}));

  const activeOrders = orders.filter((o) => o.status !== "Delivered");
  const pastOrders = orders.filter((o) => o.status === "Delivered");

  return NextResponse.json({
    me: {
      isAuthenticated: true,
      userId: user.id,
      firstName: user.firstName ?? null,
      email: user.email,
      points: user.points, // ← correct field from your schema
    },
    addresses,
    activeOrders,
    pastOrders,
    cookiePrefs: { analytics: user.analyticsOptIn },
  });
}

/**
 * PATCH  /api/account
 * Body: { addressId: string; update: Record<string, unknown> }
 * Updates an address that belongs to the signed-in user.
 */
export async function PATCH(req: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { addressId?: string; update?: Record<string, unknown> };
  const { addressId, update } = body ?? {};
  if (!addressId || !update || typeof update !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Guard ownership
  const updated = await prisma.address.updateMany({
    where: { id: addressId, userId: user.id },
    data: update,
  });

  if (updated.count === 0) {
    return NextResponse.json(
      { error: "Address not found or not owned by user" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
