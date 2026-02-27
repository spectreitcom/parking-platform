/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ParkingType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ParkingType_name_key" ON "ParkingType"("name");
