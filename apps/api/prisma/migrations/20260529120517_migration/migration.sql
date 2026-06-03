-- CreateTable
CREATE TABLE "Asset" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "mimeType" VARCHAR(20) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_key_key" ON "Asset"("key");
