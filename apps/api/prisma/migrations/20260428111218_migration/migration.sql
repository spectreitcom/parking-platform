/*
  Warnings:

  - You are about to drop the column `parkingAddons` on the `ParkingRead` table. All the data in the column will be lost.
  - You are about to drop the column `parkingFeatures` on the `ParkingRead` table. All the data in the column will be lost.
  - You are about to drop the column `place` on the `ParkingRead` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ParkingRead" DROP COLUMN "parkingAddons",
DROP COLUMN "parkingFeatures",
DROP COLUMN "place",
ADD COLUMN     "parkingAddonIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "parkingFeatureIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
