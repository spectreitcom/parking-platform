-- DropIndex
DROP INDEX "ParkingSpotRead_organizationId_parkingId_key";

-- CreateIndex
CREATE INDEX "ParkingSpotRead_organizationId_parkingId_idx" ON "ParkingSpotRead"("organizationId", "parkingId");
