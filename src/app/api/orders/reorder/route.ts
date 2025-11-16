// src/app/api/orders/reorder/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromSession } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { orderId?: string };
  const orderId = body?.orderId;
  if (!orderId || typeof orderId !== "string") {
    return NextResponse.json({ error: "Missing or invalid orderId" }, { status: 400 });
  }

  // Make sure the order exists and belongs to this user
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Order not found for this account" },
      { status: 404 }
    );
  }

  /**
   * TODO (Cart integration):
   * When you add OrderItem + Cart models/services, do something like:
   *
   * const items = await prisma.orderItem.findMany({ where: { orderId } });
   * for (const it of items) {
   *   await cartService.add(user.id, { productId: it.productId, qty: it.qty });
   * }
   *
   * Or, if you store the cart in a session cookie, hydrate it here and return it.
   */

  return NextResponse.json({
    ok: true,
    orderId,
    // cart: cartState (optional once implemented)
    message: "Items queued for re-add to cart (stub).",
  });
}

