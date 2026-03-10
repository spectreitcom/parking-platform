/*
  Warnings:

  - You are about to drop the `ParkingOrganizationRead` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ParkingOrganizationRead";

-- CreateTable
CREATE TABLE "ParkingOrganization" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,

    CONSTRAINT "ParkingOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParkingOrganization_organizationId_key" ON "ParkingOrganization"("organizationId");
