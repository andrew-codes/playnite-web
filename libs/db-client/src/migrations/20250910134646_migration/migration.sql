-- CreateTable
CREATE TABLE "public"."SiteSettings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserSetting" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT,
    "dataType" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "permission" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Library" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playniteId" TEXT,
    "defaultCompletionStatusId" INTEGER,
    "platformPriority" INTEGER[] DEFAULT ARRAY[]::INTEGER[],

    CONSTRAINT "Library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Release" (
    "id" SERIAL NOT NULL,
    "libraryId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverId" INTEGER NOT NULL,
    "releaseDate" TIMESTAMP(3),
    "releaseYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "communityScore" DOUBLE PRECISION,
    "criticScore" DOUBLE PRECISION,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "completionStatusId" INTEGER,
    "playniteId" TEXT,
    "playtime" BIGINT DEFAULT 0,
    "runState" TEXT NOT NULL,
    "gameId" INTEGER,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Source" (
    "id" SERIAL NOT NULL,
    "libraryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "platformId" INTEGER NOT NULL,
    "playniteId" TEXT,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Platform" (
    "id" SERIAL NOT NULL,
    "libraryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playniteId" TEXT,
    "iconId" INTEGER,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Asset" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "ignId" TEXT,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Feature" (
    "id" SERIAL NOT NULL,
    "libraryId" INTEGER NOT NULL,
    "playniteId" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CompletionStatus" (
    "id" SERIAL NOT NULL,
    "libraryId" INTEGER NOT NULL,
    "playniteId" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompletionStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Playlist" (
    "id" SERIAL NOT NULL,
    "libraryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Game" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "libraryId" INTEGER NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" SERIAL NOT NULL,
    "libraryId" INTEGER NOT NULL,
    "playniteId" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ReleaseToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ReleaseToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_FeatureToRelease" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FeatureToRelease_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_GameReleases" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GameReleases_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_GameToPlaylist" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GameToPlaylist_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_id_key" ON "public"."SiteSettings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_name_key" ON "public"."SiteSettings"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserSetting_userId_name_key" ON "public"."UserSetting"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Library_userId_idx" ON "public"."Library"("userId");

-- CreateIndex
CREATE INDEX "Library_playniteId_userId_idx" ON "public"."Library"("playniteId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Library_playniteId_userId_key" ON "public"."Library"("playniteId", "userId");

-- CreateIndex
CREATE INDEX "Release_libraryId_idx" ON "public"."Release"("libraryId");

-- CreateIndex
CREATE INDEX "Release_sourceId_idx" ON "public"."Release"("sourceId");

-- CreateIndex
CREATE INDEX "Release_title_libraryId_idx" ON "public"."Release"("title", "libraryId");

-- CreateIndex
CREATE UNIQUE INDEX "Release_playniteId_libraryId_key" ON "public"."Release"("playniteId", "libraryId");

-- CreateIndex
CREATE INDEX "Source_libraryId_idx" ON "public"."Source"("libraryId");

-- CreateIndex
CREATE INDEX "Source_name_libraryId_idx" ON "public"."Source"("name", "libraryId");

-- CreateIndex
CREATE UNIQUE INDEX "Source_playniteId_libraryId_key" ON "public"."Source"("playniteId", "libraryId");

-- CreateIndex
CREATE UNIQUE INDEX "Source_name_libraryId_key" ON "public"."Source"("name", "libraryId");

-- CreateIndex
CREATE INDEX "Platform_libraryId_idx" ON "public"."Platform"("libraryId");

-- CreateIndex
CREATE INDEX "Platform_name_libraryId_idx" ON "public"."Platform"("name", "libraryId");

-- CreateIndex
CREATE UNIQUE INDEX "Platform_playniteId_libraryId_key" ON "public"."Platform"("playniteId", "libraryId");

-- CreateIndex
CREATE UNIQUE INDEX "Platform_name_libraryId_key" ON "public"."Platform"("name", "libraryId");

-- CreateIndex
CREATE INDEX "Asset_ignId_idx" ON "public"."Asset"("ignId");

-- CreateIndex
CREATE INDEX "Feature_name_libraryId_idx" ON "public"."Feature"("name", "libraryId");

-- CreateIndex
CREATE INDEX "Feature_libraryId_idx" ON "public"."Feature"("libraryId");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_name_libraryId_key" ON "public"."Feature"("name", "libraryId");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_playniteId_libraryId_key" ON "public"."Feature"("playniteId", "libraryId");

-- CreateIndex
CREATE INDEX "CompletionStatus_libraryId_idx" ON "public"."CompletionStatus"("libraryId");

-- CreateIndex
CREATE INDEX "CompletionStatus_name_libraryId_idx" ON "public"."CompletionStatus"("name", "libraryId");

-- CreateIndex
CREATE UNIQUE INDEX "CompletionStatus_name_libraryId_key" ON "public"."CompletionStatus"("name", "libraryId");

-- CreateIndex
CREATE UNIQUE INDEX "CompletionStatus_playniteId_libraryId_key" ON "public"."CompletionStatus"("playniteId", "libraryId");

-- CreateIndex
CREATE INDEX "Playlist_libraryId_idx" ON "public"."Playlist"("libraryId");

-- CreateIndex
CREATE INDEX "Playlist_name_libraryId_idx" ON "public"."Playlist"("name", "libraryId");

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_name_libraryId_key" ON "public"."Playlist"("name", "libraryId");

-- CreateIndex
CREATE INDEX "Game_libraryId_idx" ON "public"."Game"("libraryId");

-- CreateIndex
CREATE INDEX "Game_title_libraryId_idx" ON "public"."Game"("title", "libraryId");

-- CreateIndex
CREATE UNIQUE INDEX "Game_title_libraryId_key" ON "public"."Game"("title", "libraryId");

-- CreateIndex
CREATE INDEX "Tag_libraryId_idx" ON "public"."Tag"("libraryId");

-- CreateIndex
CREATE INDEX "Tag_libraryId_name_idx" ON "public"."Tag"("libraryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_playniteId_libraryId_key" ON "public"."Tag"("playniteId", "libraryId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_libraryId_key" ON "public"."Tag"("name", "libraryId");

-- CreateIndex
CREATE INDEX "_ReleaseToTag_B_index" ON "public"."_ReleaseToTag"("B");

-- CreateIndex
CREATE INDEX "_FeatureToRelease_B_index" ON "public"."_FeatureToRelease"("B");

-- CreateIndex
CREATE INDEX "_GameReleases_B_index" ON "public"."_GameReleases"("B");

-- CreateIndex
CREATE INDEX "_GameToPlaylist_B_index" ON "public"."_GameToPlaylist"("B");

-- AddForeignKey
ALTER TABLE "public"."UserSetting" ADD CONSTRAINT "UserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Library" ADD CONSTRAINT "Library_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Release" ADD CONSTRAINT "Release_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "public"."Library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Release" ADD CONSTRAINT "Release_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "public"."Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Release" ADD CONSTRAINT "Release_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Release" ADD CONSTRAINT "Release_completionStatusId_fkey" FOREIGN KEY ("completionStatusId") REFERENCES "public"."CompletionStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Source" ADD CONSTRAINT "Source_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "public"."Library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Source" ADD CONSTRAINT "Source_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "public"."Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Platform" ADD CONSTRAINT "Platform_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "public"."Library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Platform" ADD CONSTRAINT "Platform_iconId_fkey" FOREIGN KEY ("iconId") REFERENCES "public"."Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feature" ADD CONSTRAINT "Feature_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "public"."Library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompletionStatus" ADD CONSTRAINT "CompletionStatus_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "public"."Library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Playlist" ADD CONSTRAINT "Playlist_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "public"."Library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Game" ADD CONSTRAINT "Game_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "public"."Library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tag" ADD CONSTRAINT "Tag_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "public"."Library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ReleaseToTag" ADD CONSTRAINT "_ReleaseToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ReleaseToTag" ADD CONSTRAINT "_ReleaseToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FeatureToRelease" ADD CONSTRAINT "_FeatureToRelease_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FeatureToRelease" ADD CONSTRAINT "_FeatureToRelease_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_GameReleases" ADD CONSTRAINT "_GameReleases_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_GameReleases" ADD CONSTRAINT "_GameReleases_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_GameToPlaylist" ADD CONSTRAINT "_GameToPlaylist_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_GameToPlaylist" ADD CONSTRAINT "_GameToPlaylist_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
