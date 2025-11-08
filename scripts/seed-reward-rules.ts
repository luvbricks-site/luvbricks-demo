// scripts/seed-reward-rules.ts
import { prisma } from "@/lib/db";

async function main() {
  const rules = [
    { action: "social_follow_instagram", points: 25, cooldownHours: 0, maxPerUser: 1, verification: "manual" },
    { action: "social_subscribe_youtube", points: 25, cooldownHours: 0, maxPerUser: 1, verification: "manual" },
    { action: "newsletter_subscribed", points: 25, cooldownHours: 0, maxPerUser: 1, verification: "webhook" },
    // Example: purchase points (awarded when an order ships)
    { action: "order_shipped", points: 0, cooldownHours: 0, maxPerUser: 999999, verification: "webhook" },
  ];

  for (const r of rules) {
    await prisma.rewardRule.upsert({
      where: { action: r.action },
      update: r,
      create: r,
    });
  }

  console.log("Reward rules seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
