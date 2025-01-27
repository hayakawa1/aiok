/*
  Warnings:

  - You are about to drop the column `stripeConnectAccountId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "stripeConnectAccountId",
ADD COLUMN     "stripeAccountId" TEXT;
