/*
  Warnings:

  - Added the required column `version` to the `ParkingAddon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `Place` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `PlaceType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ParkingAddon" ADD COLUMN     "version" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "version" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PlaceType" ADD COLUMN     "version" INTEGER NOT NULL;
