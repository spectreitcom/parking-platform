-- CreateTable
CREATE TABLE "PlaceTypeRead" (
    "id" UUID NOT NULL,
    "placeTypeId" UUID NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "version" INTEGER NOT NULL,

    CONSTRAINT "PlaceTypeRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlaceTypeRead_placeTypeId_key" ON "PlaceTypeRead"("placeTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaceTypeRead_name_key" ON "PlaceTypeRead"("name");

-- CreateIndex
CREATE INDEX "PlaceTypeRead_name_idx" ON "PlaceTypeRead"("name");
