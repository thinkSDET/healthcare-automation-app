-- CreateTable
CREATE TABLE "PatientDocument" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientDocument_storedName_key" ON "PatientDocument"("storedName");

-- CreateIndex
CREATE INDEX "PatientDocument_patientId_idx" ON "PatientDocument"("patientId");

-- AddForeignKey
ALTER TABLE "PatientDocument" ADD CONSTRAINT "PatientDocument_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
