// Load test mocks if running in test mode
if (process.env.TEST === 'E2E') {
  require('./testSetup.js')
}

import MQTT from 'async-mqtt'
import prisma from 'db-client'
import logger from 'dev-logger'
import express from 'express'
import { groupBy } from 'lodash-es'
import { IgnSourcedAssets } from 'sourced-assets/ign'

async function run() {
  logger.info(
    `Starting Playnite Web Sync Library Processor...${process.env.PORT ?? 3001}`,
  )
  const app = express()
  const port = process.env.PORT ?? 3001

  try {
    const ignSourcedAssets = new IgnSourcedAssets()

    const mqtt = await MQTT.connectAsync(
      `tcp://${process.env.MQTT_HOST ?? 'localhost'}:${process.env.MQTT_PORT ?? '1883'}`,
      {
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
      },
    )
    await mqtt.subscribe('playnite-web/library/sync', { qos: 1 })

    mqtt.on('message', async (topic, message) => {
      try {
        if (topic === 'playnite-web/library/sync') {
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
            const gameTitles = gameEntries.map(([_key, releases]) => releases[0].title)
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
            select: { id: true, title: true },
          })

          // Map with lowercase keys for case-insensitive lookups
          const gameIdMap = new Map(insertedGames.map((g) => [g.title.toLowerCase(), g.id]))

          // Batch upsert releases using raw SQL
          if (releaseData.length > 0) {
            const now = new Date()

            // Add releaseGameId to releaseData
            const releaseDataWithGameId = releaseData.map((r, idx) => ({
              ...r,
              releaseGameId: gameIdMap.get(releasesToUpdate[idx].title.toLowerCase()) ?? null,
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

          // Now fetch IGN cover art URLs for each game
          logger.info(
            `Fetching IGN cover art URLs for ${insertedGames.length} games`,
          )
          for (const game of insertedGames) {
            try {
              const ignCoverArtUrl = await ignSourcedAssets.getImageUrl({
                title: game.title,
              })

              if (ignCoverArtUrl) {
                logger.debug(`Found IGN cover art URL for game: ${game.title}`)
                await prisma.game.update({
                  where: { id: game.id },
                  data: { coverArt: ignCoverArtUrl },
                })
              } else {
                logger.debug(
                  `No IGN cover art URL found for game: ${game.title}`,
                )
              }
            } catch (error) {
              logger.warn(
                `Failed to fetch IGN cover art for game: ${game.title}`,
                error,
              )
            }
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
