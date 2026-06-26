-- DropIndex
DROP INDEX "Search_featureIds_idx";

-- CreateIndex
CREATE INDEX "Search_featureIds_idx" ON "Search" USING GIN ("featureIds" array_ops);
