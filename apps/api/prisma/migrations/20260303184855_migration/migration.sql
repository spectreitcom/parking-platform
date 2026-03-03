/*
  Warnings:

  - You are about to drop the column `parkingAddonIds` on the `Parking` table. All the data in the column will be lost.
  - You are about to drop the column `parkingFeatureIds` on the `Parking` table. All the data in the column will be lost.
  - Added the required column `placeId` to the `Parking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Parking" DROP COLUMN "parkingAddonIds",
DROP COLUMN "parkingFeatureIds",
ADD COLUMN     "placeId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "_ParkingToParkingFeature" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ParkingToParkingFeature_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ParkingToParkingAddon" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ParkingToParkingAddon_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ParkingToParkingFeature_B_index" ON "_ParkingToParkingFeature"("B");

-- CreateIndex
CREATE INDEX "_ParkingToParkingAddon_B_index" ON "_ParkingToParkingAddon"("B");

-- AddForeignKey
ALTER TABLE "Parking" ADD CONSTRAINT "Parking_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParkingToParkingFeature" ADD CONSTRAINT "_ParkingToParkingFeature_A_fkey" FOREIGN KEY ("A") REFERENCES "Parking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParkingToParkingFeature" ADD CONSTRAINT "_ParkingToParkingFeature_B_fkey" FOREIGN KEY ("B") REFERENCES "ParkingFeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParkingToParkingAddon" ADD CONSTRAINT "_ParkingToParkingAddon_A_fkey" FOREIGN KEY ("A") REFERENCES "Parking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParkingToParkingAddon" ADD CONSTRAINT "_ParkingToParkingAddon_B_fkey" FOREIGN KEY ("B") REFERENCES "ParkingAddon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
