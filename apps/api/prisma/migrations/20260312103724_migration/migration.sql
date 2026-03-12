-- DropIndex
DROP INDEX "OrganizationOrganizationUser_organizationUserId_idx";

-- CreateIndex
CREATE INDEX "OrganizationOrganizationUser_organizationUserId_displayName_idx" ON "OrganizationOrganizationUser"("organizationUserId", "displayName", "email");
