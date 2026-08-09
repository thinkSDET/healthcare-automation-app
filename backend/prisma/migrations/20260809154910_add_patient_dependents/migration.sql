-- CreateTable
CREATE TABLE "PatientDependent" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientDependent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PatientDependent_patientId_idx" ON "PatientDependent"("patientId");

-- AddForeignKey
ALTER TABLE "PatientDependent" ADD CONSTRAINT "PatientDependent_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
