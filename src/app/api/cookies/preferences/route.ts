// src/app/api/cookies/preferences/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getUserFromSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // 1) Parse body safely
    const body = (await req.json()) as Partial<{ analytics: boolean }>;
    const analytics = Boolean(body?.analytics);

    // 2) Persist to cookie for immediate UI feedback (even if signed-out)
    const jar = await cookies();
    jar.set("analytics", analytics ? "1" : "0", {
      path: "/",
      httpOnly: false, // readable by client for toggles
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    // 3) If the user is signed in, persist to their account profile too
    let persistedToAccount = false;
    try {
      const user = await getUserFromSession();
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { analyticsOptIn: analytics },
        });
        persistedToAccount = true;
      }
    } catch {
      // no-op: being signed out is fine; cookie already set
    }

    // 4) Respond
    return NextResponse.json({ ok: true, analytics, persistedToAccount });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
