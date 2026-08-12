-- CreateEnum
CREATE TYPE "LabTestOrderStatus" AS ENUM ('REQUESTED', 'SAMPLE_COLLECTED', 'PROCESSING', 'RESULT_AVAILABLE', 'ACKNOWLEDGED', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LabResultFlag" AS ENUM ('NORMAL', 'ABNORMAL', 'CRITICAL');

-- CreateTable
CREATE TABLE "LabTestOrder" (
    "id" SERIAL NOT NULL,
    "orderNo" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "appointmentId" INTEGER,
    "testName" TEXT NOT NULL,
    "status" "LabTestOrderStatus" NOT NULL DEFAULT 'REQUESTED',
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdByUserId" INTEGER NOT NULL,
    "resultSummary" TEXT,
    "resultFlag" "LabResultFlag",
    "resultOriginalName" TEXT,
    "resultStoredName" TEXT,
    "resultMimeType" TEXT,
    "resultSize" INTEGER,
    "resultFilePath" TEXT,
    "resultUploadedAt" TIMESTAMP(3),
    "resultUploadedByUserId" INTEGER,
    "resultDocumentId" INTEGER,
    "acknowledgedByUserId" INTEGER,
    "acknowledgedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabTestOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LabTestOrder_orderNo_key" ON "LabTestOrder"("orderNo");

-- CreateIndex
CREATE UNIQUE INDEX "LabTestOrder_resultDocumentId_key" ON "LabTestOrder"("resultDocumentId");

-- CreateIndex
CREATE INDEX "LabTestOrder_patientId_idx" ON "LabTestOrder"("patientId");

-- CreateIndex
CREATE INDEX "LabTestOrder_doctorId_idx" ON "LabTestOrder"("doctorId");

-- CreateIndex
CREATE INDEX "LabTestOrder_status_idx" ON "LabTestOrder"("status");

-- CreateIndex
CREATE INDEX "LabTestOrder_orderedAt_idx" ON "LabTestOrder"("orderedAt");

-- CreateIndex
CREATE INDEX "LabTestOrder_patientId_status_idx" ON "LabTestOrder"("patientId", "status");

-- AddForeignKey
ALTER TABLE "LabTestOrder" ADD CONSTRAINT "LabTestOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTestOrder" ADD CONSTRAINT "LabTestOrder_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTestOrder" ADD CONSTRAINT "LabTestOrder_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTestOrder" ADD CONSTRAINT "LabTestOrder_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTestOrder" ADD CONSTRAINT "LabTestOrder_resultUploadedByUserId_fkey" FOREIGN KEY ("resultUploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTestOrder" ADD CONSTRAINT "LabTestOrder_acknowledgedByUserId_fkey" FOREIGN KEY ("acknowledgedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTestOrder" ADD CONSTRAINT "LabTestOrder_resultDocumentId_fkey" FOREIGN KEY ("resultDocumentId") REFERENCES "PatientDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
