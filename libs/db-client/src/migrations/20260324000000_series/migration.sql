-- CreateTable
CREATE TABLE "Series" (
    "id" SERIAL NOT NULL,
    "libraryId" INTEGER NOT NULL,
    "playniteId" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ReleaseToSeries" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ReleaseToSeries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Series_name_libraryId_idx" ON "Series"("name", "libraryId");

-- CreateIndex
CREATE INDEX "Series_libraryId_idx" ON "Series"("libraryId");

-- CreateIndex
CREATE UNIQUE INDEX "Series_name_libraryId_key" ON "Series"("name", "libraryId");

-- CreateIndex
CREATE UNIQUE INDEX "Series_playniteId_libraryId_key" ON "Series"("playniteId", "libraryId");

-- CreateIndex
CREATE INDEX "_ReleaseToSeries_B_index" ON "_ReleaseToSeries"("B");

-- AddForeignKey
ALTER TABLE "Series" ADD CONSTRAINT "Series_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReleaseToSeries" ADD CONSTRAINT "_ReleaseToSeries_A_fkey" FOREIGN KEY ("A") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReleaseToSeries" ADD CONSTRAINT "_ReleaseToSeries_B_fkey" FOREIGN KEY ("B") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;
