-- CreateTable
CREATE TABLE "ParkingOrganizationRead" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,

    CONSTRAINT "ParkingOrganizationRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkingListForAdminRead" (
    "id" UUID NOT NULL,
    "parkingId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "placeId" UUID NOT NULL,
    "parkingName" VARCHAR(255) NOT NULL,
    "parkingAddress" VARCHAR(255) NOT NULL,
    "placeName" VARCHAR(255) NOT NULL,
    "parkingActive" BOOLEAN NOT NULL,
    "parkingSpotsNumber" INTEGER NOT NULL DEFAULT 0,
    "organizationName" VARCHAR(255) NOT NULL,

    CONSTRAINT "ParkingListForAdminRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParkingOrganizationRead_organizationId_key" ON "ParkingOrganizationRead"("organizationId");

-- CreateIndex
CREATE INDEX "ParkingListForAdminRead_parkingName_organizationName_placeN_idx" ON "ParkingListForAdminRead"("parkingName", "organizationName", "placeName");

-- CreateIndex
CREATE UNIQUE INDEX "ParkingListForAdminRead_parkingId_organizationId_key" ON "ParkingListForAdminRead"("parkingId", "organizationId");
