/*
  Warnings:

  - A unique constraint covering the columns `[organizationId]` on the table `OrganizationListForAdmnRead` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OrganizationListForAdmnRead_organizationId_key" ON "OrganizationListForAdmnRead"("organizationId");
