-- CreateTable
CREATE TABLE "ParkingAddonRead" (
    "id" UUID NOT NULL,
    "parkingAddonId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "priceInPln" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParkingAddonRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParkingAddonRead_parkingAddonId_key" ON "ParkingAddonRead"("parkingAddonId");

-- CreateIndex
CREATE INDEX "ParkingAddonRead_name_price_priceInPln_idx" ON "ParkingAddonRead"("name", "price", "priceInPln");
