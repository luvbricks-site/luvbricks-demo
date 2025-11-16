// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

type Body = {
  firstName?: string | null;
  email: string;
  password: string;
  newsletterOptIn?: boolean;
};

// keep this in sync with your rewards system
const SIGNUP_ACTION = "account_create_join_email";
const SIGNUP_POINTS = 125;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const firstName = (body.firstName ?? "").trim();
    const email = (body.email ?? "").trim().toLowerCase();
    const { password, newsletterOptIn = false } = body;

    // --- Basic validation
    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // --- Duplicate guard
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    // --- Create user
    const passwordHash = await hashPassword(password);
    const created = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: firstName || null,
        analyticsOptIn: true, // default; user can change later
      },
      select: { id: true, firstName: true, points: true },
    });

    // --- If they opted into email, award signup+email bonus immediately
    if (newsletterOptIn) {
      await prisma.$transaction(async (tx) => {
        // Ensure RewardRule exists
        let rule = await tx.rewardRule.findUnique({ where: { action: SIGNUP_ACTION } });
        if (!rule) {
          rule = await tx.rewardRule.create({
            data: {
              action: SIGNUP_ACTION,
              points: SIGNUP_POINTS,
              maxPerUser: 1,
              cooldownHours: 0,
              verification: "manual",
            },
          });
        }

        // Skip if already posted (defensive)
        const already = await tx.pointsLedger.count({
          where: { userId: created.id, action: SIGNUP_ACTION, status: "posted" },
        });
        if (already === 0) {
          await tx.pointsLedger.create({
            data: {
              userId: created.id,
              action: SIGNUP_ACTION,
              points: rule.points,
              sourceId: null,
              uniqueKey: `${SIGNUP_ACTION}:${created.id}`,
              status: "posted",
            },
          });
          await tx.user.update({
            where: { id: created.id },
            data: { points: { increment: rule.points } },
          });
        }
      });
    }

    // --- Create session (writes DB session + httpOnly cookie)
    await createSession(created.id).catch(() => { /* no-op if helper is stubbed in dev */ });

    // --- Build response and set cookies on the response (not cookies())
    const res = NextResponse.json({ ok: true, userId: created.id }, { status: 201 });

    res.cookies.set({ name: "uid", value: created.id, ...cookieBase });
    if (created.firstName) {
      res.cookies.set({ name: "firstName", value: created.firstName, ...cookieBase });
    }

    return res;
  } catch {
    return NextResponse.json({ error: "Could not create account" }, { status: 500 });
  }
}
