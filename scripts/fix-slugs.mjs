import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  const changes = [
    { from: "plant-cafe-&-flower-shop", to: "plant-cafe-flower-shop" },
    { from: "cmf-spiderman-across-the-spiderverse-series-random-pack", to: "cmf-spider-man-random-pack" },
  ];

  for (const { from, to } of changes) {
    const existing = await prisma.product.findUnique({ where: { slug: from } });
    if (!existing) {
      console.log(`No product found with slug "${from}"`);
      continue;
    }
    // make sure target slug not already used
    const clash = await prisma.product.findUnique({ where: { slug: to } });
    if (clash) {
      console.log(`Cannot rename "${from}" → "${to}" because "${to}" already exists.`);
      continue;
    }
    await prisma.product.update({ where: { slug: from }, data: { slug: to } });
    console.log(`Renamed "${from}" → "${to}"`);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
