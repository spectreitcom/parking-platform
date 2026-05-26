/*
  Warnings:

  - Added the required column `pricePLN` to the `ParkingSpotRead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ParkingSpotRead" ADD COLUMN     "pricePLN" INTEGER NOT NULL;
