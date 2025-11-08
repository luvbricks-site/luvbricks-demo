// src/app/api/me/route.ts
import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // 1) Prefer the real server session
    const user = await getUserFromSession();
    if (user) {
      return NextResponse.json({
        isAuthenticated: true,
        userId: user.id,
        firstName: user.firstName ?? null,
        points: typeof user.points === "number" ? user.points : 0,
      });
    }

    // 2) Fallback: read lightweight UI cookies so the header can render nicely
    const c = await cookies();
    const uid = c.get("uid")?.value ?? null;
    const firstName = c.get("firstName")?.value ?? null;

    return NextResponse.json({
      isAuthenticated: false,
      userId: uid,           // may be null; useful for gentle UI hints
      firstName,             // may be null
      points: 0,             // no session → no points balance
    });
  } catch {
    // Last-ditch, safe default
    return NextResponse.json(
      { isAuthenticated: false, userId: null, firstName: null, points: 0 },
      { status: 200 }
    );
  }
}

