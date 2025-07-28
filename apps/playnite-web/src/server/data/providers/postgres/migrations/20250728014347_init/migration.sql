-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameLibrary" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Release" (
    "id" SERIAL NOT NULL,
    "libraryId" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "coverId" INTEGER,
    "releaseDate" TIMESTAMP(3),
    "releaseYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playniteId" TEXT,
    "platformDeviceId" INTEGER,
    "sourceId" INTEGER NOT NULL,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" SERIAL NOT NULL,
    "libraryId" INTEGER NOT NULL,
    "playniteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformDevice" (
    "id" SERIAL NOT NULL,
    "libraryId" INTEGER NOT NULL,
    "platformId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Platform" (
    "id" SERIAL NOT NULL,
    "libraryId" INTEGER NOT NULL,
    "playniteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cover" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" SERIAL NOT NULL,
    "libraryId" INTEGER NOT NULL,
    "playniteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PlatformToRelease" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PlatformToRelease_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FeatureToRelease" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FeatureToRelease_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GameLibrary_userId_key" ON "GameLibrary"("userId");

-- CreateIndex
CREATE INDEX "GameLibrary_userId_idx" ON "GameLibrary"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Release_playniteId_key" ON "Release"("playniteId");

-- CreateIndex
CREATE INDEX "Release_libraryId_idx" ON "Release"("libraryId");

-- CreateIndex
CREATE INDEX "Release_platformDeviceId_libraryId_idx" ON "Release"("platformDeviceId", "libraryId");

-- CreateIndex
CREATE INDEX "Release_sourceId_libraryId_idx" ON "Release"("sourceId", "libraryId");

-- CreateIndex
CREATE INDEX "Release_name_libraryId_idx" ON "Release"("name", "libraryId");

-- CreateIndex
CREATE INDEX "Release_platform_libraryId_idx" ON "Release"("platform", "libraryId");

-- CreateIndex
CREATE INDEX "Release_releaseYear_libraryId_idx" ON "Release"("releaseYear", "libraryId");

-- CreateIndex
CREATE UNIQUE INDEX "Source_playniteId_key" ON "Source"("playniteId");

-- CreateIndex
CREATE UNIQUE INDEX "Source_name_key" ON "Source"("name");

-- CreateIndex
CREATE INDEX "Source_name_libraryId_idx" ON "Source"("name", "libraryId");

-- CreateIndex
CREATE INDEX "Source_libraryId_idx" ON "Source"("libraryId");

-- CreateIndex
CREATE INDEX "PlatformDevice_libraryId_idx" ON "PlatformDevice"("libraryId");

-- CreateIndex
CREATE INDEX "PlatformDevice_libraryId_platformId_idx" ON "PlatformDevice"("libraryId", "platformId");

-- CreateIndex
CREATE UNIQUE INDEX "Platform_playniteId_key" ON "Platform"("playniteId");

-- CreateIndex
CREATE UNIQUE INDEX "Platform_name_key" ON "Platform"("name");

-- CreateIndex
CREATE INDEX "Platform_name_libraryId_idx" ON "Platform"("name", "libraryId");

-- CreateIndex
CREATE INDEX "Platform_libraryId_idx" ON "Platform"("libraryId");

-- CreateIndex
CREATE UNIQUE INDEX "Cover_url_key" ON "Cover"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_playniteId_key" ON "Feature"("playniteId");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_name_key" ON "Feature"("name");

-- CreateIndex
CREATE INDEX "Feature_name_libraryId_idx" ON "Feature"("name", "libraryId");

-- CreateIndex
CREATE INDEX "Feature_libraryId_idx" ON "Feature"("libraryId");

-- CreateIndex
CREATE INDEX "_PlatformToRelease_B_index" ON "_PlatformToRelease"("B");

-- CreateIndex
CREATE INDEX "_FeatureToRelease_B_index" ON "_FeatureToRelease"("B");

-- AddForeignKey
ALTER TABLE "GameLibrary" ADD CONSTRAINT "GameLibrary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "GameLibrary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "Cover"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_platformDeviceId_fkey" FOREIGN KEY ("platformDeviceId") REFERENCES "PlatformDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "GameLibrary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformDevice" ADD CONSTRAINT "PlatformDevice_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "GameLibrary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformDevice" ADD CONSTRAINT "PlatformDevice_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Platform" ADD CONSTRAINT "Platform_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "GameLibrary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "GameLibrary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlatformToRelease" ADD CONSTRAINT "_PlatformToRelease_A_fkey" FOREIGN KEY ("A") REFERENCES "Platform"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlatformToRelease" ADD CONSTRAINT "_PlatformToRelease_B_fkey" FOREIGN KEY ("B") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeatureToRelease" ADD CONSTRAINT "_FeatureToRelease_A_fkey" FOREIGN KEY ("A") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeatureToRelease" ADD CONSTRAINT "_FeatureToRelease_B_fkey" FOREIGN KEY ("B") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;
