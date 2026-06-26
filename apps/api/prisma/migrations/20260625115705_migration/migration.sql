/*
  Warnings:

  - A unique constraint covering the columns `[parkingId]` on the table `Search` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Search_parkingId_key" ON "Search"("parkingId");
