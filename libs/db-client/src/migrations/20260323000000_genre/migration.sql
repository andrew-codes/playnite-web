-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "libraryId" INTEGER NOT NULL,
    "playniteId" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GenreToRelease" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GenreToRelease_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Genre_name_libraryId_idx" ON "Genre"("name", "libraryId");

-- CreateIndex
CREATE INDEX "Genre_libraryId_idx" ON "Genre"("libraryId");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_libraryId_key" ON "Genre"("name", "libraryId");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_playniteId_libraryId_key" ON "Genre"("playniteId", "libraryId");

-- CreateIndex
CREATE INDEX "_GenreToRelease_B_index" ON "_GenreToRelease"("B");

-- AddForeignKey
ALTER TABLE "Genre" ADD CONSTRAINT "Genre_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToRelease" ADD CONSTRAINT "_GenreToRelease_A_fkey" FOREIGN KEY ("A") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToRelease" ADD CONSTRAINT "_GenreToRelease_B_fkey" FOREIGN KEY ("B") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;
