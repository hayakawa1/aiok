/*
  Warnings:

  - Added the required column `updatedAt` to the `RequestFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RequestFile" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "password" TEXT;

-- AlterTable
ALTER TABLE "RequestFile" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "RequestFile_requestId_idx" ON "RequestFile"("requestId");
