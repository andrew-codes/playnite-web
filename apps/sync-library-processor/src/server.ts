import MQTT from 'async-mqtt'
import prisma from 'db-client'
import logger from 'dev-logger'
import express from 'express'
import fs from 'fs'
import { groupBy } from 'lodash-es'
import path from 'path'
import { IgnSourcedAssets } from 'sourced-assets/ign'
import { isRateLimitError } from 'sourced-assets/errors'
import { CoverArtService } from './services/coverArtService.js'
// Import test mocks - this file will setup mocks when TEST=E2E
import './testSetup'

// Setup coverage collection for E2E tests
const isE2E = process.env.TEST === 'E2E'

if (isE2E) {
  const nycOutputDir = path.join(process.cwd(), '.nyc_output')
  if (!fs.existsSync(nycOutputDir)) {
    fs.mkdirSync(nycOutputDir, { recursive: true })
  }

  const coverageFile = path.join(nycOutputDir, `coverage-${process.pid}.json`)

  function saveCoverage() {
    console.log('[E2E] saveCoverage() called')
    console.log(
      `[E2E] Coverage exists: ${typeof (global as any).__coverage__ !== 'undefined'}`,
    )
    if (typeof (global as any).__coverage__ !== 'undefined') {
      const coverageData = (global as any).__coverage__
      const fileCount = Object.keys(coverageData).length
      console.log(`[E2E] Coverage data has ${fileCount} files`)
      console.log(`[E2E] Writing to: ${coverageFile}`)
      try {
        fs.writeFileSync(coverageFile, JSON.stringify(coverageData))
        const written = fs.readFileSync(coverageFile, 'utf-8')
        console.log(
          `[E2E] Coverage data saved to ${coverageFile} (${written.length} bytes)`,
        )
      } catch (err) {
        console.error('[E2E] Failed to write coverage data:', err)
      }
    } else {
      console.warn('[E2E] No coverage data found in global.__coverage__')
    }
  }

  // Save coverage on various exit signals
  console.log('[E2E] Registering exit handlers')

  // The exit event fires when process is about to exit - synchronous only
  process.on('exit', (code) => {
    console.log(`[E2E] Exit event fired with code ${code}`)
    saveCoverage()
  })

  // SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('[E2E] SIGINT received')
    saveCoverage()
    process.exit(130)
  })

  // SIGTERM (graceful shutdown)
  process.on('SIGTERM', () => {
    console.log('[E2E] SIGTERM received')
    saveCoverage()
    process.exit(143)
  })

  // Uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.log('[E2E] Uncaught exception')
    saveCoverage()
    throw err
  })

  // Unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    console.log('[E2E] Unhandled rejection')
    saveCoverage()
    console.error('Unhandled rejection:', reason)
    process.exit(1)
  })

  // Save coverage periodically as backup
  const saveInterval = setInterval(() => {
    console.log('[E2E] Periodic coverage save')
    saveCoverage()
  }, 5000)

  // Don't let interval prevent exit
  saveInterval.unref()

  console.log('[E2E] Coverage collection enabled with periodic saves every 5s')
}

async function run() {
  logger.info(
    `Starting Playnite Web Sync Library Processor...${process.env.PORT ?? 3001}`,
  )
  const app = express()
  const port = process.env.PORT ?? 3001

  try {
    const ignSourcedAssets = new IgnSourcedAssets()
    const coverArtService = new CoverArtService(prisma)
    await coverArtService.initialize()

    const mqtt = await MQTT.connectAsync(
      `tcp://${process.env.MQTT_HOST ?? 'localhost'}:${process.env.MQTT_PORT ?? '1883'}`,
      {
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
      },
    )
    await mqtt.subscribe('playnite-web/library/sync', { qos: 1 })
    await mqtt.subscribe('playnite-web/library/cover-art-retry', { qos: 1 })

    mqtt.on('message', async (topic, message) => {
      try {
        if (topic === 'playnite-web/library/cover-art-retry') {
          const { libraryId, userId, retryGames, attemptNumber = 1 } =
            JSON.parse(message.toString())

          logger.info(
            `Processing cover art retry (attempt ${attemptNumber}) for ${retryGames.length} games in library ${libraryId}`,
          )

          const stillRateLimitedGames: typeof retryGames = []

          for (const game of retryGames) {
            try {
              const ignCoverArtUrl = await ignSourcedAssets.getImageUrl({
                title: game.title,
              })

              if (ignCoverArtUrl) {
                logger.debug(`Found IGN cover art URL for game: ${game.title}`)
                await coverArtService.persistGameCoverArt(game, ignCoverArtUrl)
              } else {
                logger.debug(
                  `No IGN cover art URL found for game: ${game.title}`,
                )
              }
            } catch (error) {
              if (isRateLimitError(error)) {
                logger.info(
                  `Still rate limited for game: ${game.title} on attempt ${attemptNumber}`,
                )
                stillRateLimitedGames.push(game)
              } else {
                logger.warn(
                  `Failed to process cover art for game: ${game.title}`,
                  error,
                )
              }
            }
          }

          // If we still have rate-limited games and haven't exceeded max retries, schedule another retry
          const maxRetries = 5
          if (
            stillRateLimitedGames.length > 0 &&
            attemptNumber < maxRetries
          ) {
            // Exponential backoff: 5s, 10s, 20s, 40s, 80s
            const retryDelay = 5000 * Math.pow(2, attemptNumber - 1)

            logger.info(
              `${stillRateLimitedGames.length} games still rate-limited. Scheduling retry ${attemptNumber + 1} in ${retryDelay}ms`,
            )

            setTimeout(async () => {
              const retryMessage = {
                libraryId,
                userId,
                retryGames: stillRateLimitedGames,
                attemptNumber: attemptNumber + 1,
              }

              await mqtt.publish(
                'playnite-web/library/cover-art-retry',
                JSON.stringify(retryMessage),
                { qos: 1 },
              )
            }, retryDelay)
          } else if (stillRateLimitedGames.length > 0) {
            logger.warn(
              `Max retries (${maxRetries}) reached for ${stillRateLimitedGames.length} games. Giving up on: ${stillRateLimitedGames.map((g) => g.title).join(', ')}`,
            )
          } else {
            logger.info(
              `All games successfully processed after ${attemptNumber} attempt(s)`,
            )
          }
        } else if (topic === 'playnite-web/library/sync') {
          const { libraryId, userId, libraryData } = JSON.parse(
            message.toString(),
          )

          logger.info(
            `Processing library sync for library ${libraryId}, user ${userId}`,
          )

          // Removals
          // Releases
          logger.debug(
            `Removing releases from library ${libraryId}`,
            libraryData.remove.releases,
          )
          const removedReleases = await prisma.release.deleteMany({
            where: {
              libraryId,
              playniteId: {
                in: libraryData.remove.releases,
              },
            },
          })
          logger.debug(`Removed ${removedReleases.count} releases.`)

          // Features
          logger.debug(
            `Removing features from library ${libraryId}`,
            libraryData.remove.features,
          )
          const removedFeatures = await prisma.feature.deleteMany({
            where: {
              libraryId,
              playniteId: {
                in: libraryData.remove.features,
              },
            },
          })
          logger.debug(`Removed ${removedFeatures.count} features.`)

          //  Sources
          logger.debug(
            `Removing sources from library ${libraryId}`,
            libraryData.remove.sources,
          )
          const removedSources = await prisma.source.deleteMany({
            where: {
              libraryId,
              playniteId: {
                in: libraryData.remove.sources,
              },
            },
          })
          logger.debug(`Removed ${removedSources.count} sources.`)

          // Platforms
          logger.debug(
            `Removing platforms from library ${libraryId}`,
            libraryData.remove.platforms,
          )
          const deletedPlatforms = await prisma.platform.deleteMany({
            where: {
              libraryId,
              playniteId: {
                in: libraryData.remove.platforms,
              },
            },
          })
          logger.debug(`Removed ${deletedPlatforms.count} platforms.`)

          // Tags
          logger.debug(
            `Removing tags from library ${libraryId}`,
            libraryData.remove.tags,
          )
          const tagsRemoved = await prisma.tag.deleteMany({
            where: {
              libraryId,
              playniteId: {
                in: libraryData.remove.tags,
              },
            },
          })
          logger.debug(`Removed ${tagsRemoved.count} tags.`)

          // CompletionStates
          logger.debug(
            `Removing completion states from library ${libraryId}`,
            libraryData.remove.completionStates,
          )
          const completionStatesRemoved =
            await prisma.completionStatus.deleteMany({
              where: {
                libraryId,
                playniteId: {
                  in: libraryData.remove.completionStates,
                },
              },
            })
          logger.debug(
            `Removed ${completionStatesRemoved.count} completion states.`,
          )

          // Updates
          logger.debug(
            `Updating library ${libraryId} with new features`,
            libraryData.update.features,
          )
          // Features - batch upsert
          if (libraryData.update.features.length > 0) {
            const now = new Date()
            await prisma.$executeRaw`
              INSERT INTO "Feature" ("playniteId", "name", "libraryId", "createdAt", "updatedAt")
              SELECT *
              FROM ROWS FROM (
                UNNEST(${libraryData.update.features.map((f) => f.id)}::text[]),
                UNNEST(${libraryData.update.features.map((f) => f.name)}::text[]),
                UNNEST(${Array(libraryData.update.features.length).fill(libraryId)}::integer[]),
                UNNEST(${Array(libraryData.update.features.length).fill(now)}::timestamp[]),
                UNNEST(${Array(libraryData.update.features.length).fill(now)}::timestamp[])
              ) AS t("playniteId", "name", "libraryId", "createdAt", "updatedAt")
              ON CONFLICT ("playniteId", "libraryId")
              DO UPDATE SET
                "name" = EXCLUDED."name",
                "updatedAt" = EXCLUDED."updatedAt"
            `
          }

          logger.debug(
            `Updating library ${libraryId} with new platforms`,
            libraryData.update.platforms,
          )
          // Platforms - batch upsert
          if (libraryData.update.platforms.length > 0) {
            const now = new Date()
            await prisma.$executeRaw`
              INSERT INTO "Platform" ("playniteId", "name", "libraryId", "createdAt", "updatedAt")
              SELECT *
              FROM ROWS FROM (
                UNNEST(${libraryData.update.platforms.map((p) => p.id)}::text[]),
                UNNEST(${libraryData.update.platforms.map((p) => p.name)}::text[]),
                UNNEST(${Array(libraryData.update.platforms.length).fill(libraryId)}::integer[]),
                UNNEST(${Array(libraryData.update.platforms.length).fill(now)}::timestamp[]),
                UNNEST(${Array(libraryData.update.platforms.length).fill(now)}::timestamp[])
              ) AS t("playniteId", "name", "libraryId", "createdAt", "updatedAt")
              ON CONFLICT ("playniteId", "libraryId")
              DO UPDATE SET
                "name" = EXCLUDED."name",
                "updatedAt" = EXCLUDED."updatedAt"
            `
          }

          logger.debug(
            `Updating library ${libraryId} with new sources`,
            libraryData.update.sources,
          )
          // Sources - batch upsert
          const platforms = await prisma.platform.findMany({
            where: { libraryId },
            select: { id: true, playniteId: true },
            orderBy: {
              name: 'asc',
            },
          })
          const platformMap = new Map(
            platforms.map((p) => [p.playniteId, p.id]),
          )

          const validSources = libraryData.update.sources.filter((source) => {
            return platformMap.has(source.platform)
          })

          if (validSources.length > 0) {
            const now = new Date()
            await prisma.$executeRaw`
              INSERT INTO "Source" ("playniteId", "name", "libraryId", "platformId", "createdAt", "updatedAt")
              SELECT *
              FROM ROWS FROM (
                UNNEST(${validSources.map((s) => s.id)}::text[]),
                UNNEST(${validSources.map((s) => s.name)}::text[]),
                UNNEST(${Array(validSources.length).fill(libraryId)}::integer[]),
                UNNEST(${validSources.map((s) => platformMap.get(s.platform))}::integer[]),
                UNNEST(${Array(validSources.length).fill(now)}::timestamp[]),
                UNNEST(${Array(validSources.length).fill(now)}::timestamp[])
              ) AS t("playniteId", "name", "libraryId", "platformId", "createdAt", "updatedAt")
              ON CONFLICT ("playniteId", "libraryId")
              DO UPDATE SET
                "name" = EXCLUDED."name",
                "platformId" = EXCLUDED."platformId",
                "updatedAt" = EXCLUDED."updatedAt"
            `
          }

          logger.debug(
            `Updating library ${libraryId} with new tags`,
            libraryData.update.tags,
          )
          // Tags - batch upsert
          if (libraryData.update.tags.length > 0) {
            const now = new Date()
            await prisma.$executeRaw`
              INSERT INTO "Tag" ("playniteId", "name", "libraryId", "createdAt", "updatedAt")
              SELECT *
              FROM ROWS FROM (
                UNNEST(${libraryData.update.tags.map((t) => t.id)}::text[]),
                UNNEST(${libraryData.update.tags.map((t) => t.name)}::text[]),
                UNNEST(${Array(libraryData.update.tags.length).fill(libraryId)}::integer[]),
                UNNEST(${Array(libraryData.update.tags.length).fill(now)}::timestamp[]),
                UNNEST(${Array(libraryData.update.tags.length).fill(now)}::timestamp[])
              ) AS t("playniteId", "name", "libraryId", "createdAt", "updatedAt")
              ON CONFLICT ("playniteId", "libraryId")
              DO UPDATE SET
                "name" = EXCLUDED."name",
                "updatedAt" = EXCLUDED."updatedAt"
            `
          }

          logger.debug(
            `Updating library ${libraryId} with new completion states`,
            libraryData.update.completionStates,
          )
          // CompletionStates - batch upsert
          if (libraryData.update.completionStates.length > 0) {
            const now = new Date()
            await prisma.$executeRaw`
              INSERT INTO "CompletionStatus" ("playniteId", "name", "libraryId", "createdAt", "updatedAt")
              SELECT *
              FROM ROWS FROM (
                UNNEST(${libraryData.update.completionStates.map((s) => s.id)}::text[]),
                UNNEST(${libraryData.update.completionStates.map((s) => s.name)}::text[]),
                UNNEST(${Array(libraryData.update.completionStates.length).fill(libraryId)}::integer[]),
                UNNEST(${Array(libraryData.update.completionStates.length).fill(now)}::timestamp[]),
                UNNEST(${Array(libraryData.update.completionStates.length).fill(now)}::timestamp[])
              ) AS t("playniteId", "name", "libraryId", "createdAt", "updatedAt")
              ON CONFLICT ("playniteId", "libraryId")
              DO UPDATE SET
                "name" = EXCLUDED."name",
                "updatedAt" = EXCLUDED."updatedAt"
            `
          }

          logger.debug(
            `Persisting ${libraryData.update.releases.length} release assets for library ${libraryId}`,
          )

          // Releases
          const sources = await prisma.source.findMany({
            where: { libraryId },
            select: { id: true, playniteId: true, platformId: true },
          })
          const completionStates = await prisma.completionStatus.findMany({
            where: { libraryId },
            select: { id: true, playniteId: true },
          })

          // Process all releases concurrently
          const releasesToUpdate = libraryData.update.releases.filter(
            (release) => {
              return [
                sources.some((s) => s.playniteId === release.source),
              ].every(Boolean)
            },
          )

          logger.debug(
            `Processing ${releasesToUpdate.length} releases for library ${libraryId}`,
          )

          const sourceMap = new Map(sources.map((s) => [s.playniteId, s.id]))
          const completionStatusMap = new Map(
            completionStates.map((cs) => [cs.playniteId, cs.id]),
          )

          // Prepare release data for batch insert
          const releaseData = releasesToUpdate.map((release) => {
            let releaseDate: Date | null = null
            if (release.releaseDate) {
              const date = new Date(release.releaseDate)
              if (isNaN(date.getTime())) {
                logger.warn(
                  `Invalid release date for release ${release.id}, ${release.title}: ${release.releaseDate}`,
                )
                releaseDate = null
              } else {
                releaseDate = date
              }
            }

            return {
              playniteId: release.id,
              title: release.title,
              description: release.description,
              releaseDate,
              releaseYear: releaseDate?.getFullYear() ?? null,
              criticScore: release.criticScore,
              playtime: BigInt(release.playtime ?? '0'),
              communityScore: release.communityScore,
              hidden: release.hidden ?? false,
              sourceId: sourceMap.get(release.source),
              completionStatusId:
                release.completionStatus &&
                release.completionStatus !==
                  '00000000-0000-0000-0000-000000000000'
                  ? completionStatusMap.get(release.completionStatus)
                  : null,
              features: release.features ?? [],
              tags: release.tags ?? [],
            }
          })

          // First upsert games before releases (group by lowercase title for case-insensitive matching)
          const games = groupBy(libraryData.update.releases, (release) =>
            release.title.toLowerCase(),
          )
          logger.debug(
            `Upserting ${Object.keys(games).length} games for library ${libraryId}`,
          )

          const gameEntries = Object.entries(games)
          if (gameEntries.length > 0) {
            // Use the first release's title from each group (preserves original casing)
            const gameTitles = gameEntries.map(
              ([_key, releases]) => releases[0].title,
            )
            await prisma.$executeRaw`
              INSERT INTO "Game" ("title", "libraryId")
              SELECT *
              FROM ROWS FROM (
                UNNEST(${gameTitles}::text[]),
                UNNEST(${Array(gameEntries.length).fill(libraryId)}::integer[])
              ) AS t("title", "libraryId")
              ON CONFLICT ("title", "libraryId")
              DO NOTHING
            `
          }

          // Get all game IDs
          const insertedGames = await prisma.game.findMany({
            where: {
              libraryId,
              title: { in: releasesToUpdate.map((r) => r.title) },
            },
            select: { id: true, title: true, coverArt: true },
          })

          // Map with lowercase keys for case-insensitive lookups
          const gameIdMap = new Map(
            insertedGames.map((g) => [g.title.toLowerCase(), g.id]),
          )

          // Batch upsert releases using raw SQL
          if (releaseData.length > 0) {
            const now = new Date()

            // Add releaseGameId to releaseData
            const releaseDataWithGameId = releaseData.map((r, idx) => ({
              ...r,
              releaseGameId:
                gameIdMap.get(releasesToUpdate[idx].title.toLowerCase()) ??
                null,
            }))

            // Upsert releases with releaseGameId and gameId
            await prisma.$executeRaw`
              INSERT INTO "Release" (
                "playniteId", "title", "description", "releaseDate", "releaseYear",
                "criticScore", "playtime", "communityScore", "hidden", "sourceId",
                "completionStatusId", "libraryId", "runState", "releaseGameId", "gameId", "createdAt", "updatedAt"
              )
              SELECT
                rd.playnite_id, rd.title, rd.description, rd.release_date, rd.release_year,
                rd.critic_score, rd.playtime, rd.community_score, rd.hidden, rd.source_id,
                rd.completion_status_id, ${libraryId}, 'stopped', rd.release_game_id, rd.game_id,
                ${now}::timestamp, ${now}::timestamp
              FROM ROWS FROM (
                UNNEST(${releaseDataWithGameId.map((r) => r.playniteId)}::text[]),
                UNNEST(${releaseDataWithGameId.map((r) => r.title)}::text[]),
                UNNEST(${releaseDataWithGameId.map((r) => r.description)}::text[]),
                UNNEST(${releaseDataWithGameId.map((r) => r.releaseDate)}::timestamp[]),
                UNNEST(${releaseDataWithGameId.map((r) => r.releaseYear)}::integer[]),
                UNNEST(${releaseDataWithGameId.map((r) => r.criticScore)}::float[]),
                UNNEST(${releaseDataWithGameId.map((r) => r.playtime.toString())}::bigint[]),
                UNNEST(${releaseDataWithGameId.map((r) => r.communityScore)}::float[]),
                UNNEST(${releaseDataWithGameId.map((r) => r.hidden)}::boolean[]),
                UNNEST(${releaseDataWithGameId.map((r) => r.sourceId)}::integer[]),
                UNNEST(${releaseDataWithGameId.map((r) => r.completionStatusId)}::integer[]),
                UNNEST(${releaseDataWithGameId.map((r) => r.releaseGameId)}::integer[]),
                UNNEST(${releaseDataWithGameId.map((r) => r.gameId)}::integer[])
              ) AS rd(
                playnite_id, title, description, release_date, release_year,
                critic_score, playtime, community_score, hidden, source_id,
                completion_status_id, release_game_id, game_id
              )
              ON CONFLICT ("playniteId", "libraryId")
              DO UPDATE SET
                "title" = EXCLUDED."title",
                "description" = EXCLUDED."description",
                "releaseDate" = EXCLUDED."releaseDate",
                "releaseYear" = EXCLUDED."releaseYear",
                "criticScore" = EXCLUDED."criticScore",
                "communityScore" = EXCLUDED."communityScore",
                "hidden" = EXCLUDED."hidden",
                "sourceId" = EXCLUDED."sourceId",
                "completionStatusId" = EXCLUDED."completionStatusId",
                "releaseGameId" = EXCLUDED."releaseGameId",
                "gameId" = EXCLUDED."gameId",
                "updatedAt" = EXCLUDED."updatedAt"
            `

            // Handle many-to-many relationships (Features and Tags) separately
            // Get all release IDs
            const insertedReleases = await prisma.release.findMany({
              where: {
                libraryId,
                playniteId: { in: releaseData.map((r) => r.playniteId) },
              },
              select: { id: true, playniteId: true },
            })

            const releaseIdMap = new Map(
              insertedReleases.map((r) => [r.playniteId, r.id]),
            )

            // Prepare Features relationships
            const featureRelations: Array<{
              releaseId: number
              featureId: number
            }> = []
            const tagRelations: Array<{ releaseId: number; tagId: number }> = []

            const features = await prisma.feature.findMany({
              where: { libraryId },
              select: { id: true, playniteId: true },
            })
            const featureIdMap = new Map(
              features.map((f) => [f.playniteId, f.id]),
            )

            const tags = await prisma.tag.findMany({
              where: { libraryId },
              select: { id: true, playniteId: true },
            })
            const tagIdMap = new Map(tags.map((t) => [t.playniteId, t.id]))

            for (let i = 0; i < releasesToUpdate.length; i++) {
              const release = releasesToUpdate[i]
              const releaseId = releaseIdMap.get(release.id)
              if (!releaseId) continue

              // Features
              if (release.features) {
                for (const featurePlayniteId of release.features.filter(
                  (f) => f !== null,
                )) {
                  const featureId = featureIdMap.get(featurePlayniteId)
                  if (featureId) {
                    featureRelations.push({ releaseId, featureId })
                  }
                }
              }

              // Tags
              if (release.tags) {
                for (const tagPlayniteId of release.tags.filter(
                  (t) => t !== null,
                )) {
                  const tagId = tagIdMap.get(tagPlayniteId)
                  if (tagId) {
                    tagRelations.push({ releaseId, tagId })
                  }
                }
              }
            }

            // Clear and rebuild relationships
            if (insertedReleases.length > 0) {
              const releaseIds = insertedReleases.map((r) => r.id)

              // Clear existing relationships
              await prisma.$executeRaw`
                DELETE FROM "_FeatureToRelease"
                WHERE "B" = ANY(${releaseIds}::integer[])
              `
              await prisma.$executeRaw`
                DELETE FROM "_ReleaseToTag"
                WHERE "A" = ANY(${releaseIds}::integer[])
              `

              // Insert new feature relationships
              if (featureRelations.length > 0) {
                await prisma.$executeRaw`
                  INSERT INTO "_FeatureToRelease" ("A", "B")
                  SELECT *
                  FROM ROWS FROM (
                    UNNEST(${featureRelations.map((r) => r.featureId)}::integer[]),
                    UNNEST(${featureRelations.map((r) => r.releaseId)}::integer[])
                  ) AS t("A", "B")
                  ON CONFLICT DO NOTHING
                `
              }

              // Insert new tag relationships
              if (tagRelations.length > 0) {
                await prisma.$executeRaw`
                  INSERT INTO "_ReleaseToTag" ("A", "B")
                  SELECT *
                  FROM ROWS FROM (
                    UNNEST(${tagRelations.map((r) => r.releaseId)}::integer[]),
                    UNNEST(${tagRelations.map((r) => r.tagId)}::integer[])
                  ) AS t("A", "B")
                  ON CONFLICT DO NOTHING
                `
              }
            }
          }

          // Now fetch and process IGN cover art for each game
          logger.info(`Processing cover art for ${insertedGames.length} games`)
          const rateLimitedGames: Array<{
            id: number
            title: string
            coverArt: string | null
          }> = []

          for (const game of insertedGames) {
            try {
              // Get the IGN cover art URL
              const ignCoverArtUrl = await ignSourcedAssets.getImageUrl({
                title: game.title,
              })

              if (ignCoverArtUrl) {
                logger.debug(`Found IGN cover art URL for game: ${game.title}`)

                // Process cover art (checks if exists, downloads if needed, updates DB)
                await coverArtService.persistGameCoverArt(game, ignCoverArtUrl)
              } else {
                logger.debug(
                  `No IGN cover art URL found for game: ${game.title}`,
                )
              }
            } catch (error) {
              if (isRateLimitError(error)) {
                logger.info(
                  `Rate limited while fetching cover art for game: ${game.title}. Will retry later.`,
                )
                rateLimitedGames.push(game)
              } else {
                logger.warn(
                  `Failed to process cover art for game: ${game.title}`,
                  error,
                )
              }
            }
          }

          // If we have rate-limited games, schedule a retry with exponential backoff
          if (rateLimitedGames.length > 0) {
            logger.info(
              `${rateLimitedGames.length} games were rate-limited. Scheduling retry...`,
            )

            // Calculate exponential backoff delay (start with 5 seconds)
            const retryDelay = 5000

            setTimeout(async () => {
              logger.info(
                `Retrying cover art fetch for ${rateLimitedGames.length} rate-limited games`,
              )

              // Publish a retry message for these specific games
              const retryMessage = {
                libraryId,
                userId,
                retryGames: rateLimitedGames.map((g) => ({
                  id: g.id,
                  title: g.title,
                  coverArt: g.coverArt,
                })),
              }

              await mqtt.publish(
                'playnite-web/library/cover-art-retry',
                JSON.stringify(retryMessage),
                { qos: 1 },
              )
            }, retryDelay)
          }

          // Clean up games without releases
          logger.info(
            `Removing games without releases from library ${libraryId}`,
          )
          const removedGames = await prisma.game.deleteMany({
            where: {
              libraryId,
              Releases: { none: {} },
            },
          })
          logger.debug(
            `Removed ${removedGames.count} games without releases from library ${libraryId}`,
          )

          if (platforms.length > 0) {
            const library = await prisma.library.findUnique({
              where: { id: libraryId },
              select: { platformPriority: true },
            })

            if (library && library.platformPriority.length === 0) {
              await prisma.library.update({
                where: { id: libraryId },
                data: {
                  platformPriority: platforms.map((p) => p.id),
                },
              })
            }
          }
          logger.info(`Library ${libraryId} synced successfully`)
        }
      } catch (e) {
        logger.error('Error processing MQTT message:', e)
      }
    })

    app.get('/health', (req, res) => {
      logger.info('Health check OK')
      console.debug('Health check OK')
      res.status(200).send('OK')
    })

    // Debug endpoint to check coverage status
    if (process.env.TEST === 'E2E') {
      app.get('/coverage-status', (req, res) => {
        const hasCoverage = typeof global.__coverage__ !== 'undefined'
        const coverageKeys = hasCoverage
          ? Object.keys(global.__coverage__).length
          : 0
        res.json({
          hasCoverage,
          coverageKeys,
          message: hasCoverage
            ? `Coverage data exists with ${coverageKeys} files`
            : 'No coverage data found',
        })
      })
    }

    app.listen(port, () => {
      logger.info(
        `Sync Library Processor is running at http://localhost:${port}`,
      )
    })
  } catch (error) {
    logger.error('Error starting Playnite Web Sync Library Processor:', error)
    process.exit(1)
  }
}

run()
