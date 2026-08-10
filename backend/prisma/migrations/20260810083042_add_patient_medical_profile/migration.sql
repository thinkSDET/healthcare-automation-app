-- CreateTable
CREATE TABLE "PatientMedicalProfile" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "medicalConditions" TEXT,
    "allergies" TEXT,
    "currentMedications" TEXT,
    "medicalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientMedicalProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientMedicalProfile_patientId_key" ON "PatientMedicalProfile"("patientId");

-- AddForeignKey
ALTER TABLE "PatientMedicalProfile" ADD CONSTRAINT "PatientMedicalProfile_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
