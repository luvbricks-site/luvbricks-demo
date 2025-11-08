// src/lib/auth.ts
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/db"; // your existing prisma client

const SESSION_COOKIE = "session";
const SESSION_TTL_DAYS = 30; // persistent login window
const SLIDING_RENEW_DAYS = 7; // renew if expiring soon

// ----- Password helpers -----
export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

// ----- Session helpers -----
export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = addDays(new Date(), SESSION_TTL_DAYS);

  await prisma.session.create({ data: { userId, token, expiresAt } });

  // Next 15: cookies() is async in route/SA contexts
  const c = await cookies();
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    c.set(SESSION_COOKIE, "", { path: "/", expires: new Date(0) });
  }
}

export async function getUserFromSession() {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const now = new Date();
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < now) {
    // expired or not found
    await prisma.session.deleteMany({ where: { token } }).catch(() => {});
    c.set(SESSION_COOKIE, "", { path: "/", expires: new Date(0) });
    return null;
  }

  // Sliding renewal if close to expiry
  const renewBoundary = addDays(now, SLIDING_RENEW_DAYS);
  if (session.expiresAt < renewBoundary) {
    const newExp = addDays(now, SESSION_TTL_DAYS);
    await prisma.session.update({
      where: { token },
      data: { expiresAt: newExp },
    });
    c.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: newExp,
    });
  }

  return session.user;
}

// ----- Points helper -----
// NOTE: Your schema has User.points (not pointsTotal) and PointsLedger has no "notes".
export async function awardPoints(
  userId: string,
  points: number,
  action: string
) {
  await prisma.$transaction([
    prisma.pointsLedger.create({
      data: { userId, points, action },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { points: { increment: points } }, // matches your schema
    }),
  ]);
}
