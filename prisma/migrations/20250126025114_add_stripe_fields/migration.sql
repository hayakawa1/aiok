-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hourlyRate" INTEGER,
ADD COLUMN     "stripeConnectAccountId" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT;
