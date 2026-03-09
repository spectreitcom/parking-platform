-- CreateTable
CREATE TABLE "PlaceRead" (
    "id" UUID NOT NULL,
    "placeId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "active" BOOLEAN NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "placeTypeId" UUID NOT NULL,
    "placeTypeName" VARCHAR(60) NOT NULL,

    CONSTRAINT "PlaceRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlaceRead_placeId_key" ON "PlaceRead"("placeId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaceRead_name_key" ON "PlaceRead"("name");

-- CreateIndex
CREATE INDEX "PlaceRead_name_longitude_latitude_address_placeTypeId_idx" ON "PlaceRead"("name", "longitude", "latitude", "address", "placeTypeId");
