-- Insert default library settings (lastRoute) for all existing libraries
INSERT INTO "LibrarySetting" ("name", "value", "dataType", "libraryId")
SELECT
  'lastRoute' as name,
  NULL as value,
  'string' as "dataType",
  id as "libraryId"
FROM "Library"
WHERE NOT EXISTS (
  SELECT 1 FROM "LibrarySetting"
  WHERE "LibrarySetting"."libraryId" = "Library".id
  AND "LibrarySetting"."name" = 'lastRoute'
);
