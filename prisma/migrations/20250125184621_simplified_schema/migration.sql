/*
  Warnings:

  - You are about to drop the column `creationIpAddress` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `deliveredAt` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryComment` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryUrl` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `planDescription` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `planTitle` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `requesterId` on the `Request` table. All the data in the column will be lost.
  - The `status` column on the `Request` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `avatarUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bannerUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `DailyUserRequestStats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PricePlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TotalUserRequestStats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `amount` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "DailyUserRequestStats" DROP CONSTRAINT "DailyUserRequestStats_userId_fkey";

-- DropForeignKey
ALTER TABLE "PricePlan" DROP CONSTRAINT "PricePlan_userId_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_requesterId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "TotalUserRequestStats" DROP CONSTRAINT "TotalUserRequestStats_userId_fkey";

-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "creationIpAddress",
DROP COLUMN "deliveredAt",
DROP COLUMN "deliveryComment",
DROP COLUMN "deliveryUrl",
DROP COLUMN "filePath",
DROP COLUMN "paidAt",
DROP COLUMN "planDescription",
DROP COLUMN "planTitle",
DROP COLUMN "price",
DROP COLUMN "requesterId",
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "senderId" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "receiverId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "avatarUrl",
DROP COLUMN "bannerUrl",
DROP COLUMN "bio",
DROP COLUMN "createdAt",
DROP COLUMN "displayName",
DROP COLUMN "stripeCustomerId",
DROP COLUMN "updatedAt",
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "name" TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropTable
DROP TABLE "DailyUserRequestStats";

-- DropTable
DROP TABLE "PricePlan";

-- DropTable
DROP TABLE "TotalUserRequestStats";

-- DropTable
DROP TABLE "VerificationToken";

-- DropEnum
DROP TYPE "RequestStatus";

-- CreateTable
CREATE TABLE "RequestFile" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestFile" ADD CONSTRAINT "RequestFile_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
