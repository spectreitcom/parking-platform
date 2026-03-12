/*
  Warnings:

  - You are about to drop the `OrganizationRead` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "OrganizationRead";

-- CreateTable
CREATE TABLE "OrganizationOrganizationUser" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "displayName" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,

    CONSTRAINT "OrganizationOrganizationUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationListForAdmnRead" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "taxId" VARCHAR(120) NOT NULL,
    "members" JSONB NOT NULL,

    CONSTRAINT "OrganizationListForAdmnRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationOrganizationUser_userId_key" ON "OrganizationOrganizationUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationOrganizationUser_email_key" ON "OrganizationOrganizationUser"("email");

-- CreateIndex
CREATE INDEX "OrganizationListForAdmnRead_address_name_taxId_idx" ON "OrganizationListForAdmnRead"("address", "name", "taxId");
