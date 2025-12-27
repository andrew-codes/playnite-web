/*
  Warnings:

  - A unique constraint covering the columns `[libraryId,name]` on the table `LibrarySetting` will be added. If there are existing duplicate values, this will fail.

*/

-- Insert default library settings (onDeck) for all existing libraries
INSERT INTO "LibrarySetting" ("name", "value", "dataType", "libraryId")
SELECT
  'onDeck' as name,
  '[]'::jsonb as value,
  'array' as "dataType",
  id as "libraryId"
FROM "Library"
WHERE NOT EXISTS (
  SELECT 1 FROM "LibrarySetting"
  WHERE "LibrarySetting"."libraryId" = "Library".id
  AND "LibrarySetting"."name" = 'onDeck'
);
