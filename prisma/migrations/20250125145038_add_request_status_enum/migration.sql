/*
  Warnings:

  - Changed the type of `status` on the `Request` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'DELIVERED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "status",
ADD COLUMN     "status" "RequestStatus" NOT NULL;
