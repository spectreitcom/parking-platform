/*
  Warnings:

  - You are about to drop the `OrganizationListForAdmnRead` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "OrganizationListForAdmnRead";

-- CreateTable
CREATE TABLE "OrganizationListForAdminRead" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "taxId" VARCHAR(120) NOT NULL,
    "members" JSONB NOT NULL,

    CONSTRAINT "OrganizationListForAdminRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationListForAdminRead_organizationId_key" ON "OrganizationListForAdminRead"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationListForAdminRead_address_name_taxId_idx" ON "OrganizationListForAdminRead"("address", "name", "taxId");
