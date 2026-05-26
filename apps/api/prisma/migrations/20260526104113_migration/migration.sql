-- CreateTable
CREATE TABLE "ParkingSpotRead" (
    "id" UUID NOT NULL,
    "parkingSpotId" UUID NOT NULL,
    "price" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parkingSpotFeatureIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "organizationId" UUID NOT NULL,
    "parkingId" UUID NOT NULL,

    CONSTRAINT "ParkingSpotRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParkingSpotRead_parkingSpotId_key" ON "ParkingSpotRead"("parkingSpotId");

-- CreateIndex
CREATE INDEX "ParkingSpotRead_parkingId_idx" ON "ParkingSpotRead"("parkingId");

-- CreateIndex
CREATE UNIQUE INDEX "ParkingSpotRead_organizationId_parkingId_key" ON "ParkingSpotRead"("organizationId", "parkingId");
