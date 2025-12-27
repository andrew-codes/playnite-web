/*
  Warnings:

  - A unique constraint covering the columns `[libraryId,name]` on the table `LibrarySetting` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LibrarySetting_libraryId_name_key" ON "LibrarySetting"("libraryId", "name");
