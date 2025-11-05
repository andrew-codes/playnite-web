/*
  Warnings:

  - You are about to drop the column `iconId` on the `Platform` table. All the data in the column will be lost.
  - You are about to drop the column `coverId` on the `Release` table. All the data in the column will be lost.
  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Platform" DROP CONSTRAINT "Platform_iconId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Release" DROP CONSTRAINT "Release_coverId_fkey";

-- AlterTable
ALTER TABLE "public"."Game" ADD COLUMN     "coverArt" TEXT;

-- AlterTable
ALTER TABLE "public"."Platform" DROP COLUMN "iconId";

-- AlterTable
ALTER TABLE "public"."Release" DROP COLUMN "coverId";

-- DropTable
DROP TABLE "public"."Asset";
