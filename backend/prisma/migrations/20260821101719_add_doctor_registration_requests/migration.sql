-- CreateEnum
CREATE TYPE "DoctorRegistrationRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "DoctorRegistrationRequest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "status" "DoctorRegistrationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorRegistrationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DoctorRegistrationRequest_userId_key" ON "DoctorRegistrationRequest"("userId");

-- CreateIndex
CREATE INDEX "DoctorRegistrationRequest_status_idx" ON "DoctorRegistrationRequest"("status");

-- CreateIndex
CREATE INDEX "DoctorRegistrationRequest_createdAt_idx" ON "DoctorRegistrationRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "DoctorRegistrationRequest" ADD CONSTRAINT "DoctorRegistrationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorRegistrationRequest" ADD CONSTRAINT "DoctorRegistrationRequest_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
