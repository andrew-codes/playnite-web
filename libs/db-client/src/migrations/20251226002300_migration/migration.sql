-- AlterTable SiteSettings: Convert value from TEXT to JSONB
-- Step 1: Rename the existing column
ALTER TABLE "SiteSettings" RENAME COLUMN "value" TO "value_old";

-- Step 2: Add the new JSONB column
ALTER TABLE "SiteSettings" ADD COLUMN "value" JSONB;

-- Step 3: Convert existing data - assume strings are JSON strings, convert to proper JSON
UPDATE "SiteSettings" SET "value" =
  CASE
    WHEN "value_old" IS NULL THEN NULL
    -- If the string is already valid JSON, use it as-is
    WHEN "value_old"::text ~ '^\s*[\{\[]' THEN "value_old"::jsonb
    -- Otherwise, wrap the string value in quotes to make it a JSON string
    ELSE to_jsonb("value_old"::text)
  END;

-- Step 4: Make the column NOT NULL (matching schema requirement)
ALTER TABLE "SiteSettings" ALTER COLUMN "value" SET NOT NULL;

-- Step 5: Drop the old column
ALTER TABLE "SiteSettings" DROP COLUMN "value_old";

-- AlterTable UserSetting: Convert value from TEXT to JSONB
-- Step 1: Rename the existing column
ALTER TABLE "UserSetting" RENAME COLUMN "value" TO "value_old";

-- Step 2: Add the new JSONB column
ALTER TABLE "UserSetting" ADD COLUMN "value" JSONB;

-- Step 3: Convert existing data - assume strings are JSON strings, convert to proper JSON
UPDATE "UserSetting" SET "value" =
  CASE
    WHEN "value_old" IS NULL THEN NULL
    -- If the string is already valid JSON, use it as-is
    WHEN "value_old"::text ~ '^\s*[\{\[]' THEN "value_old"::jsonb
    -- Otherwise, wrap the string value in quotes to make it a JSON string
    ELSE to_jsonb("value_old"::text)
  END;

-- Step 4: Drop the old column
ALTER TABLE "UserSetting" DROP COLUMN "value_old";

-- CreateTable
CREATE TABLE "LibrarySetting" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" JSONB,
    "dataType" TEXT NOT NULL,
    "libraryId" INTEGER NOT NULL,

    CONSTRAINT "LibrarySetting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LibrarySetting" ADD CONSTRAINT "LibrarySetting_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
