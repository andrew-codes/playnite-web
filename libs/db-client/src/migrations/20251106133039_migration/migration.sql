/*
  Warnings:

  - You are about to drop the `_GameReleases` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `releaseGameId` to the `Release` table without a default value. This is not possible if the table is not empty.

*/
-- Clear all data from Release table before adding non-nullable column
DELETE FROM "public"."Release";

-- Clear all data from Games table, to accommodate new grouping by case insensitive title
DELETE FROM "public"."Game";

-- DropForeignKey
ALTER TABLE "public"."_GameReleases" DROP CONSTRAINT "_GameReleases_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_GameReleases" DROP CONSTRAINT "_GameReleases_B_fkey";

-- AlterTable
ALTER TABLE "public"."Release" ADD COLUMN     "releaseGameId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."_GameReleases";

-- AddForeignKey
ALTER TABLE "public"."Release" ADD CONSTRAINT "Release_releaseGameId_fkey" FOREIGN KEY ("releaseGameId") REFERENCES "public"."Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
