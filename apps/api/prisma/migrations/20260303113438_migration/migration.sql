/*
  Warnings:

  - You are about to drop the column `level` on the `ParkingFeature` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ParkingFeature" DROP COLUMN "level",
ADD COLUMN     "levels" VARCHAR(60)[];
