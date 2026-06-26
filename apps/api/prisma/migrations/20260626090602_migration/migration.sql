/*
  Warnings:

  - You are about to drop the column `parkingFeatureIds` on the `Search` table. All the data in the column will be lost.
  - You are about to drop the column `parkingFeatures` on the `Search` table. All the data in the column will be lost.
  - You are about to drop the column `parkingSpotFeatureIds` on the `Search` table. All the data in the column will be lost.
  - You are about to drop the column `parkingSpotFeatures` on the `Search` table. All the data in the column will be lost.
  - You are about to drop the column `placeTypeId` on the `Search` table. All the data in the column will be lost.
  - Added the required column `features` to the `Search` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Search_hasAvailableParkingSpots_idx";

-- DropIndex
DROP INDEX "Search_parkingFeatureIds_idx";

-- DropIndex
DROP INDEX "Search_parkingSpotFeatureIds_idx";

-- DropIndex
DROP INDEX "Search_placeId_placeTypeId_idx";

-- AlterTable
ALTER TABLE "Search" DROP COLUMN "parkingFeatureIds",
DROP COLUMN "parkingFeatures",
DROP COLUMN "parkingSpotFeatureIds",
DROP COLUMN "parkingSpotFeatures",
DROP COLUMN "placeTypeId",
ADD COLUMN     "featureIds" UUID[] DEFAULT ARRAY[]::UUID[],
ADD COLUMN     "features" JSONB NOT NULL;

-- CreateIndex
CREATE INDEX "Search_placeId_idx" ON "Search"("placeId");

-- CreateIndex
CREATE INDEX "Search_featureIds_idx" ON "Search"("featureIds");
