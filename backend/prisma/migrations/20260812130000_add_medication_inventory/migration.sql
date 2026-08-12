-- CreateEnum
CREATE TYPE "MedicationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ReplenishmentRequestStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'RECEIVED');

-- CreateTable
CREATE TABLE "Medication" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantityOnHand" INTEGER NOT NULL DEFAULT 0,
    "reorderLevel" INTEGER NOT NULL DEFAULT 0,
    "reorderQuantity" INTEGER NOT NULL DEFAULT 0,
    "status" "MedicationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplenishmentRequest" (
    "id" SERIAL NOT NULL,
    "requestNo" TEXT NOT NULL,
    "medicationId" INTEGER NOT NULL,
    "requestedQuantity" INTEGER NOT NULL,
    "status" "ReplenishmentRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "requestedByUserId" INTEGER NOT NULL,
    "reviewedByUserId" INTEGER,
    "rejectionReason" TEXT,
    "notes" TEXT,
    "receivedQuantity" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReplenishmentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" SERIAL NOT NULL,
    "medicationId" INTEGER NOT NULL,
    "movementType" TEXT NOT NULL,
    "quantityDelta" INTEGER NOT NULL,
    "quantityBefore" INTEGER NOT NULL,
    "quantityAfter" INTEGER NOT NULL,
    "reason" TEXT,
    "actorUserId" INTEGER NOT NULL,
    "replenishmentRequestId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Medication_sku_key" ON "Medication"("sku");

-- CreateIndex
CREATE INDEX "Medication_status_idx" ON "Medication"("status");

-- CreateIndex
CREATE INDEX "Medication_name_idx" ON "Medication"("name");

-- CreateIndex
CREATE INDEX "Medication_quantityOnHand_idx" ON "Medication"("quantityOnHand");

-- CreateIndex
CREATE UNIQUE INDEX "ReplenishmentRequest_requestNo_key" ON "ReplenishmentRequest"("requestNo");

-- CreateIndex
CREATE INDEX "ReplenishmentRequest_medicationId_idx" ON "ReplenishmentRequest"("medicationId");

-- CreateIndex
CREATE INDEX "ReplenishmentRequest_status_idx" ON "ReplenishmentRequest"("status");

-- CreateIndex
CREATE INDEX "ReplenishmentRequest_medicationId_status_idx" ON "ReplenishmentRequest"("medicationId", "status");

-- CreateIndex
CREATE INDEX "StockMovement_medicationId_idx" ON "StockMovement"("medicationId");

-- CreateIndex
CREATE INDEX "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");

-- CreateIndex
CREATE INDEX "StockMovement_replenishmentRequestId_idx" ON "StockMovement"("replenishmentRequestId");

-- AddForeignKey
ALTER TABLE "ReplenishmentRequest" ADD CONSTRAINT "ReplenishmentRequest_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplenishmentRequest" ADD CONSTRAINT "ReplenishmentRequest_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplenishmentRequest" ADD CONSTRAINT "ReplenishmentRequest_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_replenishmentRequestId_fkey" FOREIGN KEY ("replenishmentRequestId") REFERENCES "ReplenishmentRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
