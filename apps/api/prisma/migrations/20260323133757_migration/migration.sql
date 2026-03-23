-- CreateTable
CREATE TABLE "ParkingFeatureRead" (
    "id" UUID NOT NULL,
    "parkingFeatureId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "levels" VARCHAR(60)[],
    "version" INTEGER NOT NULL,

    CONSTRAINT "ParkingFeatureRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParkingFeatureRead_parkingFeatureId_key" ON "ParkingFeatureRead"("parkingFeatureId");

-- CreateIndex
CREATE UNIQUE INDEX "ParkingFeatureRead_name_key" ON "ParkingFeatureRead"("name");

-- CreateIndex
CREATE INDEX "ParkingFeatureRead_name_idx" ON "ParkingFeatureRead"("name");
