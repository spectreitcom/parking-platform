/*
  Warnings:

  - You are about to drop the column `statue` on the `Parking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Parking" DROP COLUMN "statue",
ADD COLUMN     "statute" TEXT;
