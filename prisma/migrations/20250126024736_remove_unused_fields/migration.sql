/*
  Warnings:

  - You are about to drop the column `hourlyRate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeConnectAccountId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "hourlyRate",
DROP COLUMN "stripeConnectAccountId",
DROP COLUMN "stripeCustomerId";
