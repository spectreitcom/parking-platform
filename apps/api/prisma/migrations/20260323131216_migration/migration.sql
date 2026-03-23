-- DropIndex
DROP INDEX "ParkingAddonRead_parkingAddonId_name_code_priceInPln_idx";

-- CreateIndex
CREATE INDEX "ParkingAddonRead_name_code_priceInPln_idx" ON "ParkingAddonRead"("name", "code", "priceInPln");
