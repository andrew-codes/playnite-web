import DataLoader from 'dataloader'
import { PrismaClient } from '../data/providers/postgres/client'

export type DataLoaders = {
  completionStatusLoader: DataLoader<number, any>
  assetLoader: DataLoader<number, any>
  releaseFeatureLoader: DataLoader<number, any[]>
  releaseTagLoader: DataLoader<number, any[]>
  gameLoader: DataLoader<number, any>
  platformLoader: DataLoader<number, any>
  sourceLoader: DataLoader<number, any>
  libraryLoader: DataLoader<number, any>
  releasesByGameLoader: DataLoader<number, any[]>
  platformBySourceLoader: DataLoader<number, any>
}

export function createDataLoaders(db: PrismaClient): DataLoaders {
  return {
    // Loads completion status by ID
    completionStatusLoader: new DataLoader(async (ids: readonly number[]) => {
      const statuses = await db.completionStatus.findMany({
        where: { id: { in: [...ids] } },
      })

      const statusMap = new Map(statuses.map((s) => [s.id, s]))
      return ids.map((id) => statusMap.get(id) ?? null)
    }),

    // Loads assets (covers, backgrounds, etc.) by ID
    assetLoader: new DataLoader(async (ids: readonly number[]) => {
      const assets = await db.asset.findMany({
        where: { id: { in: [...ids] } },
      })

      const assetMap = new Map(assets.map((a) => [a.id, a]))
      return ids.map((id) => assetMap.get(id) ?? null)
    }),

    // Loads features for multiple releases
    releaseFeatureLoader: new DataLoader(async (releaseIds: readonly number[]) => {
      const releases = await db.release.findMany({
        where: { id: { in: [...releaseIds] } },
        include: { Features: true },
      })

      const featuresByRelease = new Map<number, any[]>()
      for (const release of releases) {
        featuresByRelease.set(release.id, release.Features)
      }

      return releaseIds.map((id) => featuresByRelease.get(id) ?? [])
    }),

    // Loads tags for multiple releases
    releaseTagLoader: new DataLoader(async (releaseIds: readonly number[]) => {
      const releases = await db.release.findMany({
        where: { id: { in: [...releaseIds] } },
        include: { Tags: true },
      })

      const tagsByRelease = new Map<number, any[]>()
      for (const release of releases) {
        tagsByRelease.set(release.id, release.Tags)
      }

      return releaseIds.map((id) => tagsByRelease.get(id) ?? [])
    }),

    // Loads games by ID
    gameLoader: new DataLoader(async (ids: readonly number[]) => {
      const games = await db.game.findMany({
        where: { id: { in: [...ids] } },
      })

      const gameMap = new Map(games.map((g) => [g.id, g]))
      return ids.map((id) => gameMap.get(id) ?? null)
    }),

    // Loads platforms by ID
    platformLoader: new DataLoader(async (ids: readonly number[]) => {
      const platforms = await db.platform.findMany({
        where: { id: { in: [...ids] } },
      })

      const platformMap = new Map(platforms.map((p) => [p.id, p]))
      return ids.map((id) => platformMap.get(id) ?? null)
    }),

    // Loads sources by ID
    sourceLoader: new DataLoader(async (ids: readonly number[]) => {
      const sources = await db.source.findMany({
        where: { id: { in: [...ids] } },
      })

      const sourceMap = new Map(sources.map((s) => [s.id, s]))
      return ids.map((id) => sourceMap.get(id) ?? null)
    }),

    // Loads libraries by ID
    libraryLoader: new DataLoader(async (ids: readonly number[]) => {
      const libraries = await db.library.findMany({
        where: { id: { in: [...ids] } },
      })

      const libraryMap = new Map(libraries.map((l) => [l.id, l]))
      return ids.map((id) => libraryMap.get(id) ?? null)
    }),

    // Loads releases for multiple games
    releasesByGameLoader: new DataLoader(async (gameIds: readonly number[]) => {
      const gamesWithReleaseIds = await db.game.findMany({
        where: { id: { in: [...gameIds] } },
        select: {
          id: true,
          Releases: {
            select: { id: true },
          },
        },
      })

      const releaseIds = new Set<number>()
      for (const game of gamesWithReleaseIds) {
        for (const release of game.Releases) {
          releaseIds.add(release.id)
        }
      }

      const releases = await db.release.findMany({
        where: { id: { in: [...releaseIds] } },
      })

      const releasesById = new Map(releases.map((release) => [release.id, release]))

      const releasesByGame = new Map<number, any[]>()
      for (const game of gamesWithReleaseIds) {
        const releasesForGame = game.Releases.map(({ id }) => {
          const release = releasesById.get(id)

          if (!release) {
            return null
          }

          return {
            ...release,
            gameId: release.gameId ?? game.id,
          }
        }).filter(
          (release): release is (typeof releases)[number] & { gameId: number } =>
            release !== null,
        )

        releasesByGame.set(game.id, releasesForGame)
      }

      return gameIds.map((id) => releasesByGame.get(id) ?? [])
    }),

    // Loads platform by source ID
    platformBySourceLoader: new DataLoader(async (sourceIds: readonly number[]) => {
      const sources = await db.source.findMany({
        where: { id: { in: [...sourceIds] } },
        include: { Platform: true },
      })

      const platformBySource = new Map(
        sources.map((s) => [s.id, s.Platform]),
      )
      return sourceIds.map((id) => platformBySource.get(id) ?? null)
    }),
  }
}
