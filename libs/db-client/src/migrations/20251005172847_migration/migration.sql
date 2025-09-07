/*
  Warnings:

  - You are about to drop the column `ignId` on the `Asset` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Asset_ignId_idx";

-- AlterTable
ALTER TABLE "public"."Asset" DROP COLUMN "ignId",
ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE INDEX "Asset_slug_idx" ON "public"."Asset"("slug");
