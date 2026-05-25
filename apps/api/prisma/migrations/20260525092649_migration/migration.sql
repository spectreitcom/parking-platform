/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,organizationUserId]` on the table `OrganizationMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_organizationUserId_key" ON "OrganizationMember"("organizationId", "organizationUserId");
