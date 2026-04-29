-- CreateTable
CREATE TABLE "ParkingRead" (
    "id" UUID NOT NULL,
    "parkingId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "statute" TEXT,
    "description" TEXT,
    "organizationId" UUID NOT NULL,
    "assetIds" UUID[] DEFAULT ARRAY[]::UUID[],
    "parkingFeatures" JSONB NOT NULL,
    "parkingAddons" JSONB NOT NULL,
    "placeId" UUID NOT NULL,
    "place" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "address" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ParkingRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParkingRead_parkingId_key" ON "ParkingRead"("parkingId");

-- CreateIndex
CREATE UNIQUE INDEX "ParkingRead_name_key" ON "ParkingRead"("name");

-- CreateIndex
CREATE INDEX "ParkingRead_name_organizationId_placeId_idx" ON "ParkingRead"("name", "organizationId", "placeId");
