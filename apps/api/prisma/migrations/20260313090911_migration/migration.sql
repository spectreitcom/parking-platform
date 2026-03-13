-- CreateTable
CREATE TABLE "ParkingOrganization" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,

    CONSTRAINT "ParkingOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationOrganizationUser" (
    "id" UUID NOT NULL,
    "organizationUserId" UUID NOT NULL,
    "displayName" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,

    CONSTRAINT "OrganizationOrganizationUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParkingOrganization_organizationId_key" ON "ParkingOrganization"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationOrganizationUser_organizationUserId_key" ON "OrganizationOrganizationUser"("organizationUserId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationOrganizationUser_email_key" ON "OrganizationOrganizationUser"("email");

-- CreateIndex
CREATE INDEX "OrganizationOrganizationUser_organizationUserId_displayName_idx" ON "OrganizationOrganizationUser"("organizationUserId", "displayName", "email");
