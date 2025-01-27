/*
  Warnings:

  - The primary key for the `Request` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RequestFile` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "RequestFile" DROP CONSTRAINT "RequestFile_requestId_fkey";

-- AlterTable
ALTER TABLE "Request" DROP CONSTRAINT "Request_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Request_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Request_id_seq";

-- AlterTable
ALTER TABLE "RequestFile" DROP CONSTRAINT "RequestFile_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "requestId" SET DATA TYPE TEXT,
ADD CONSTRAINT "RequestFile_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "RequestFile_id_seq";

-- AddForeignKey
ALTER TABLE "RequestFile" ADD CONSTRAINT "RequestFile_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
