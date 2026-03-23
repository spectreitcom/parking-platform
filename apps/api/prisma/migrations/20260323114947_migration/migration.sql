-- DropIndex
DROP INDEX "ParkingAddonRead_name_price_priceInPln_idx";

-- CreateIndex
CREATE INDEX "ParkingAddonRead_name_priceInPln_idx" ON "ParkingAddonRead"("name", "priceInPln");
