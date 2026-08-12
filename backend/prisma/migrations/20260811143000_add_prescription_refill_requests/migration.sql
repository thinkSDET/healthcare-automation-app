-- CreateEnum
CREATE TYPE "RefillRequestType" AS ENUM ('REFILL', 'RENEWAL');

-- CreateEnum
CREATE TYPE "RefillRequestStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'FULFILLED');

-- CreateTable
CREATE TABLE "PrescriptionRefillRequest" (
    "id" SERIAL NOT NULL,
    "requestNo" TEXT NOT NULL,
    "prescriptionId" INTEGER NOT NULL,
    "patientId" INTEGER NOT NULL,
    "requestType" "RefillRequestType" NOT NULL,
    "status" "RefillRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "requestedByUserId" INTEGER NOT NULL,
    "reviewedByUserId" INTEGER,
    "rejectionReason" TEXT,
    "notes" TEXT,
    "orderId" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrescriptionRefillRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrescriptionRefillRequest_requestNo_key" ON "PrescriptionRefillRequest"("requestNo");

-- CreateIndex
CREATE UNIQUE INDEX "PrescriptionRefillRequest_orderId_key" ON "PrescriptionRefillRequest"("orderId");

-- CreateIndex
CREATE INDEX "PrescriptionRefillRequest_prescriptionId_idx" ON "PrescriptionRefillRequest"("prescriptionId");

-- CreateIndex
CREATE INDEX "PrescriptionRefillRequest_patientId_idx" ON "PrescriptionRefillRequest"("patientId");

-- CreateIndex
CREATE INDEX "PrescriptionRefillRequest_status_idx" ON "PrescriptionRefillRequest"("status");

-- CreateIndex
CREATE INDEX "PrescriptionRefillRequest_requestType_idx" ON "PrescriptionRefillRequest"("requestType");

-- CreateIndex
CREATE INDEX "PrescriptionRefillRequest_prescriptionId_status_idx" ON "PrescriptionRefillRequest"("prescriptionId", "status");

-- AddForeignKey
ALTER TABLE "PrescriptionRefillRequest" ADD CONSTRAINT "PrescriptionRefillRequest_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionRefillRequest" ADD CONSTRAINT "PrescriptionRefillRequest_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionRefillRequest" ADD CONSTRAINT "PrescriptionRefillRequest_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionRefillRequest" ADD CONSTRAINT "PrescriptionRefillRequest_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionRefillRequest" ADD CONSTRAINT "PrescriptionRefillRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
