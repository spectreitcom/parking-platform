/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ParkingAddonRead` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ParkingAddonRead` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ParkingAddonRead" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";
