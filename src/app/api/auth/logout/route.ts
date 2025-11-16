// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { cookies } from "next/headers";
import { clearShipTo } from "@/lib/shipTo"; // ✅ clear saved shipping info on logout

export async function POST() {
  
  try {
    // End the server-side session (no-op safe)
    await destroySession().catch(() => {});

    // Proactively clear the small UI cookies we set at login
    const c = await cookies(); // IMPORTANT: await in Next 15+
    const base = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0), // expire immediately
    };

    // Clear any UI/info cookies you set
    c.set({ name: "uid", value: "", ...base });
    c.set({ name: "firstName", value: "", ...base });
    // If you have a custom "session" cookie, clear it here too:
    // c.set({ name: "session", value: "", ...base });

    // ✅ also clear the saved shipping cookie for this browser
    await clearShipTo();

    const res = NextResponse.json({ ok: true });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch {
    const res = NextResponse.json({ ok: false, error: "Logout failed" }, { status: 500 });
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
}

