// scripts/seed-set-requests.ts
import { prisma } from "@/lib/db";
await prisma.setRequest.createMany({
  data: [
    { setNumber: 75362, name: "Star Wars X", msrpCents: 4499, theme: "Star Wars", tier: 1, source: "poll", status: "collecting", thresholdVotes: 100, thresholdDepos: 45 },
    { setNumber: 76409, name: "Harry Potter Y", msrpCents: 9999, theme: "Harry Potter", tier: 3, source: "poll", status: "collecting", thresholdVotes: 23, thresholdDepos: 10 },
    // …
  ]
});
