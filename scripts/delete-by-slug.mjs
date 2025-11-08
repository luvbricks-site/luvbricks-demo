import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Put the slugs you want to nuke here:
const SLUGS = ["hogwarts-castle", "friends-seaside-resort", "duplo-doctors-visit", "city-tall-tower", "marvel-logo-set", "cmf-series-27"];

async function run() {
  const victims = await prisma.product.findMany({
    where: { slug: { in: SLUGS } },
    select: { id: true, slug: true },
  });

  if (!victims.length) {
    console.log("No matching products found for", SLUGS);
    return;
  }
  console.log("Deleting:", victims.map(v => v.slug));

  await prisma.inventory.deleteMany({ where: { productId: { in: victims.map(v => v.id) } } });
  await prisma.productImage.deleteMany({ where: { productId: { in: victims.map(v => v.id) } } });
  await prisma.product.deleteMany({ where: { id: { in: victims.map(v => v.id) } } });

  console.log("Done.");
}
run().catch(console.error).finally(() => prisma.$disconnect());
