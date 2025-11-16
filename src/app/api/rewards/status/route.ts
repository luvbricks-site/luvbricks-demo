// src/app/api/rewards/status/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromSession } from "@/lib/auth";

export async function GET() {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ completed: [] });
  }

  const rows = await prisma.pointsLedger.findMany({
    where: { userId: user.id, status: "posted" },
    select: { action: true },
  });

  const completed = Array.from(new Set(rows.map((r) => r.action)));
  return NextResponse.json({ completed });
}

