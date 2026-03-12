-- CreateTable
CREATE TABLE "OrganizationRead" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "taxId" VARCHAR(120) NOT NULL,
    "members" JSONB NOT NULL,

    CONSTRAINT "OrganizationRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganizationRead_address_name_taxId_idx" ON "OrganizationRead"("address", "name", "taxId");
