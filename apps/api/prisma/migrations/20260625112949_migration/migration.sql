-- CreateTable
CREATE TABLE "Search" (
    "id" UUID NOT NULL,
    "parkingId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "placeId" UUID NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "hasAvailableParkingSpots" BOOLEAN NOT NULL DEFAULT false,
    "assetIds" UUID[] DEFAULT ARRAY[]::UUID[],
    "placeTypeId" UUID NOT NULL,
    "parkingFeatureIds" UUID[] DEFAULT ARRAY[]::UUID[],
    "parkingFeatures" JSONB NOT NULL,
    "parkingSpotFeatureIds" UUID[] DEFAULT ARRAY[]::UUID[],
    "parkingSpotFeatures" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "distance" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Search_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Search_placeId_placeTypeId_idx" ON "Search"("placeId", "placeTypeId");

-- CreateIndex
CREATE INDEX "Search_parkingFeatureIds_idx" ON "Search"("parkingFeatureIds");

-- CreateIndex
CREATE INDEX "Search_parkingSpotFeatureIds_idx" ON "Search"("parkingSpotFeatureIds");

-- CreateIndex
CREATE INDEX "Search_hasAvailableParkingSpots_idx" ON "Search"("hasAvailableParkingSpots");
