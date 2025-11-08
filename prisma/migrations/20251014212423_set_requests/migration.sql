-- CreateTable
CREATE TABLE "SetRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "setNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "theme" TEXT,
    "msrpCents" INTEGER NOT NULL,
    "tier" INTEGER NOT NULL,
    "casePack" INTEGER,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "thresholdVotes" INTEGER NOT NULL,
    "thresholdDepos" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SetSupport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "setRequestId" TEXT NOT NULL,
    "userToken" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amountCents" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refundedAt" DATETIME,
    CONSTRAINT "SetSupport_setRequestId_fkey" FOREIGN KEY ("setRequestId") REFERENCES "SetRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SetSupport_setRequestId_userToken_type_key" ON "SetSupport"("setRequestId", "userToken", "type");
