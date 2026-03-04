-- CreateTable
CREATE TABLE "ParkingSpot" (
    "id" UUID NOT NULL,
    "price" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ParkingSpot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ParkingFeatureToParkingSpot" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ParkingFeatureToParkingSpot_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ParkingFeatureToParkingSpot_B_index" ON "_ParkingFeatureToParkingSpot"("B");

-- AddForeignKey
ALTER TABLE "_ParkingFeatureToParkingSpot" ADD CONSTRAINT "_ParkingFeatureToParkingSpot_A_fkey" FOREIGN KEY ("A") REFERENCES "ParkingFeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParkingFeatureToParkingSpot" ADD CONSTRAINT "_ParkingFeatureToParkingSpot_B_fkey" FOREIGN KEY ("B") REFERENCES "ParkingSpot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
