// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { cookies } from "next/headers";

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

type Body = { email: string; password: string };

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json()) as Body;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    // Find user (get passwordHash for verification)
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, firstName: true,points: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Verify password
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create a server-side session (if your helper persists sessions)
    await createSession(user.id).catch(() => { /* ok if no-op */ });

    // Set login cookies the header/UI can read quickly
    const c = await cookies(); // IMPORTANT: await
    c.set({ name: "uid", value: user.id, ...cookieBase });
    if (user.firstName?.trim()) {
      c.set({ name: "firstName", value: user.firstName.trim(), ...cookieBase });
    }

    return NextResponse.json({ ok: true, userId: user.id });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

