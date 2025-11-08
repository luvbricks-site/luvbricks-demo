// src/app/api/rewards/award/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromSession } from "@/lib/auth";
import { DEMO_MODE } from '@/lib/demoMode';

/**
 * Built-in catalog of supported actions. If a RewardRule isn't found in DB,
 * we create it from here so you don't see "Unknown action".
 */
const RULES: Record<
  string,
  { points: number; maxPerUser: number; cooldownHours: number; verification: "manual" | "webhook" | "oauth" }
> = {
  account_create_join_email: { points: 125, maxPerUser: 1, cooldownHours: 0, verification: "manual" },
  social_follow_tiktok:      { points: 25,  maxPerUser: 1, cooldownHours: 0, verification: "manual" },
  social_follow_instagram:   { points: 25,  maxPerUser: 1, cooldownHours: 0, verification: "manual" },
  social_follow_facebook:    { points: 25,  maxPerUser: 1, cooldownHours: 0, verification: "manual" },
  share_store_social:        { points: 50,  maxPerUser: 1, cooldownHours: 0, verification: "manual" },
  social_subscribe_youtube:  { points: 50,  maxPerUser: 1, cooldownHours: 0, verification: "manual" },
};

export async function POST(req: Request) {
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
    const { action, sourceId } = (await req.json()) as { action: string; sourceId?: string };

    // 0) Auth
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!action) {
      return NextResponse.json({ error: "Action required" }, { status: 400 });
    }

    // 1) Find or create RewardRule
    let rule = await prisma.rewardRule.findUnique({ where: { action } });
    if (!rule) {
      const def = RULES[action];
      if (!def) {
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
      }
      rule = await prisma.rewardRule.create({
        data: {
          action,
          points: def.points,
          maxPerUser: def.maxPerUser,
          cooldownHours: def.cooldownHours,
          verification: def.verification,
        },
      });
    }

    // 2) Enforce maxPerUser (already posted)
    const priorPosted = await prisma.pointsLedger.count({
      where: { userId: user.id, action, status: "posted" },
    });
    if (priorPosted >= rule.maxPerUser) {
      return NextResponse.json({ ok: true, status: "already_posted" }, { status: 200 });
    }

    // 3) Enforce cooldown (if you make any action repeatable later)
    if (rule.cooldownHours > 0) {
      const since = new Date(Date.now() - rule.cooldownHours * 3600 * 1000);
      const recent = await prisma.pointsLedger.count({
        where: { userId: user.id, action, createdAt: { gte: since } },
      });
      if (recent > 0) {
        return NextResponse.json({ ok: false, error: "Try again later" }, { status: 429 });
      }
    }

    // 4) Decide verification path
    // For now: everything except 'webhook' is awarded immediately ("posted").
    let status: "pending" | "posted" = "posted";
    let uniqueKey = `${action}:${user.id}`;

    if (rule.verification === "webhook") {
      if (!sourceId) {
        return NextResponse.json(
          { error: "Missing sourceId for webhook-verified action" },
          { status: 400 }
        );
      }
      uniqueKey = `${action}:${sourceId}`;
      status = "pending";
    }

    // 5) Award (idempotent-ish via uniqueKey) and update user's running total
    const result = await prisma.$transaction(async (tx) => {
      const existingUnique = await tx.pointsLedger.findUnique({
        where: { uniqueKey },
      });
      if (existingUnique) {
        // If somehow already present, treat as already posted when status is posted.
        if (existingUnique.status === "posted") {
          return { status: "already_posted" as const, newBalance: user.points };
        }
        // If pending, just echo back pending.
        return { status: "pending" as const, newBalance: user.points };
      }

      const entry = await tx.pointsLedger.create({
        data: {
          userId: user.id,
          action,
          points: rule.points,
          sourceId: sourceId ?? null,
          uniqueKey,
          status,
        },
      });

      let newBalance = user.points;
      if (entry.status === "posted") {
        const updated = await tx.user.update({
          where: { id: user.id },
          data: { points: { increment: rule.points } },
          select: { points: true },
        });
        newBalance = updated.points;
      }

      return { status: entry.status as "posted" | "pending", newBalance };
    });

    return NextResponse.json({ ok: true, status: result.status, pointsBalance: result.newBalance }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    console.error("Rewards award error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
