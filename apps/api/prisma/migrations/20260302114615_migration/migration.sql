-- CreateTable
CREATE TABLE "Place" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "address" VARCHAR(255) NOT NULL,
    "placeTypeId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Place_name_key" ON "Place"("name");

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_placeTypeId_fkey" FOREIGN KEY ("placeTypeId") REFERENCES "PlaceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
