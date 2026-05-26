/*
  Warnings:

  - Added the required column `webPriceCents` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "channel" TEXT NOT NULL DEFAULT 'WEB';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "shortName" TEXT,
ADD COLUMN     "webPriceCents" INTEGER NOT NULL;
