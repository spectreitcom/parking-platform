/*
  Warnings:

  - You are about to alter the column `priceInPln` on the `ParkingAddonRead` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "ParkingAddonRead" ALTER COLUMN "priceInPln" SET DATA TYPE DECIMAL(10,2);
