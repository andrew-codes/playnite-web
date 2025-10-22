import { groupBy } from 'lodash'
import { slug } from 'sourced-assets'
import { runState } from '../../../../../../feature/game/runStates'
import logger from '../../../../../logger'
import { getClient } from '../../../../../mqtt'
import { create, domains, hasIdentity } from '../../../../../oid'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const syncLibrary: NonNullable<
  MutationResolvers['syncLibrary']
> = async (_parent, _arg, _ctx) => {
  const user = await _ctx.identityService.authorize(_ctx.jwt?.payload)

  const userId = user.id
  logger.debug('User', user)
  if (!userId || !hasIdentity(userId)) {
    throw new Error('Invalid OID format.')
  }

  logger.silly(`Library data`, _arg.libraryData)
  logger.info(
    `Syncing library ${_arg.libraryData.libraryId} for user ${userId.id}`,
  )

  const library = await _ctx.db.library.upsert({
    where: {
      playniteId_userId: {
        playniteId: _arg.libraryData.libraryId,
        userId: userId.id,
      },
    },
    create: {
      playniteId: _arg.libraryData.libraryId,
      User: {
        connect: { id: userId.id },
      },
      name: _arg.libraryData.name ?? 'Default Library',
    },
    update: {
      name: _arg.libraryData.name ?? 'Default Library',
    },
  })

  const libraryId = library.id
  logger.info(`Library ID: ${libraryId}`)

  // Removals
  // Releases
  logger.debug(
    `Removing releases from library ${libraryId}`,
    _arg.libraryData.remove.releases,
  )
  const removedReleases = await _ctx.db.release.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.releases,
      },
    },
  })
  logger.debug(`Removed ${removedReleases.count} releases.`)

  // Features
  logger.debug(
    `Removing features from library ${libraryId}`,
    _arg.libraryData.remove.features,
  )
  const removedFeatures = await _ctx.db.feature.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.features,
      },
    },
  })
  logger.debug(`Removed ${removedFeatures.count} features.`)

  //  Sources
  logger.debug(
    `Removing sources from library ${libraryId}`,
    _arg.libraryData.remove.sources,
  )
  const removedSources = await _ctx.db.source.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.sources,
      },
    },
  })
  logger.debug(`Removed ${removedSources.count} sources.`)

  // Platforms
  logger.debug(
    `Removing platforms from library ${libraryId}`,
    _arg.libraryData.remove.platforms,
  )
  const deletedPlatforms = await _ctx.db.platform.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.platforms,
      },
    },
  })
  logger.debug(`Removed ${deletedPlatforms.count} platforms.`)

  // Tags
  logger.debug(
    `Removing tags from library ${libraryId}`,
    _arg.libraryData.remove.tags,
  )
  const tagsRemoved = await _ctx.db.tag.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.tags,
      },
    },
  })
  logger.debug(`Removed ${tagsRemoved.count} tags.`)

  // CompletionStates
  logger.debug(
    `Removing completion states from library ${libraryId}`,
    _arg.libraryData.remove.completionStates,
  )
  const completionStatesRemoved = await _ctx.db.completionStatus.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.completionStates,
      },
    },
  })
  logger.debug(`Removed ${completionStatesRemoved.count} completion states.`)

  // Updates
  logger.debug(
    `Updating library ${libraryId} with new features`,
    _arg.libraryData.update.features,
  )
  // Features - batch upsert
  if (_arg.libraryData.update.features.length > 0) {
    const now = new Date()
    await _ctx.db.$executeRaw`
      INSERT INTO "Feature" ("playniteId", "name", "libraryId", "createdAt", "updatedAt")
      SELECT *
      FROM ROWS FROM (
        UNNEST(${_arg.libraryData.update.features.map((f) => f.id)}::text[]),
        UNNEST(${_arg.libraryData.update.features.map((f) => f.name)}::text[]),
        UNNEST(${Array(_arg.libraryData.update.features.length).fill(libraryId)}::integer[]),
        UNNEST(${Array(_arg.libraryData.update.features.length).fill(now)}::timestamp[]),
        UNNEST(${Array(_arg.libraryData.update.features.length).fill(now)}::timestamp[])
      ) AS t("playniteId", "name", "libraryId", "createdAt", "updatedAt")
      ON CONFLICT ("playniteId", "libraryId")
      DO UPDATE SET
        "name" = EXCLUDED."name",
        "updatedAt" = EXCLUDED."updatedAt"
    `
  }

  logger.debug(
    `Updating library ${libraryId} with new platforms`,
    _arg.libraryData.update.platforms,
  )
  // Platforms - batch upsert
  if (_arg.libraryData.update.platforms.length > 0) {
    const now = new Date()
    await _ctx.db.$executeRaw`
      INSERT INTO "Platform" ("playniteId", "name", "libraryId", "createdAt", "updatedAt")
      SELECT *
      FROM ROWS FROM (
        UNNEST(${_arg.libraryData.update.platforms.map((p) => p.id)}::text[]),
        UNNEST(${_arg.libraryData.update.platforms.map((p) => p.name)}::text[]),
        UNNEST(${Array(_arg.libraryData.update.platforms.length).fill(libraryId)}::integer[]),
        UNNEST(${Array(_arg.libraryData.update.platforms.length).fill(now)}::timestamp[]),
        UNNEST(${Array(_arg.libraryData.update.platforms.length).fill(now)}::timestamp[])
      ) AS t("playniteId", "name", "libraryId", "createdAt", "updatedAt")
      ON CONFLICT ("playniteId", "libraryId")
      DO UPDATE SET
        "name" = EXCLUDED."name",
        "updatedAt" = EXCLUDED."updatedAt"
    `
  }

  logger.debug(
    `Updating library ${libraryId} with new sources`,
    _arg.libraryData.update.sources,
  )
  // Sources - batch upsert
  const platforms = await _ctx.db.platform.findMany({
    where: { libraryId },
    select: { id: true, playniteId: true },
    orderBy: {
      name: 'asc',
    },
  })
  const platformMap = new Map(platforms.map((p) => [p.playniteId, p.id]))

  const validSources = _arg.libraryData.update.sources.filter((source) => {
    return platformMap.has(source.platform)
  })

  if (validSources.length > 0) {
    const now = new Date()
    await _ctx.db.$executeRaw`
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
    _arg.libraryData.update.tags,
  )
  // Tags - batch upsert
  if (_arg.libraryData.update.tags.length > 0) {
    const now = new Date()
    await _ctx.db.$executeRaw`
      INSERT INTO "Tag" ("playniteId", "name", "libraryId", "createdAt", "updatedAt")
      SELECT *
      FROM ROWS FROM (
        UNNEST(${_arg.libraryData.update.tags.map((t) => t.id)}::text[]),
        UNNEST(${_arg.libraryData.update.tags.map((t) => t.name)}::text[]),
        UNNEST(${Array(_arg.libraryData.update.tags.length).fill(libraryId)}::integer[]),
        UNNEST(${Array(_arg.libraryData.update.tags.length).fill(now)}::timestamp[]),
        UNNEST(${Array(_arg.libraryData.update.tags.length).fill(now)}::timestamp[])
      ) AS t("playniteId", "name", "libraryId", "createdAt", "updatedAt")
      ON CONFLICT ("playniteId", "libraryId")
      DO UPDATE SET
        "name" = EXCLUDED."name",
        "updatedAt" = EXCLUDED."updatedAt"
    `
  }

  logger.debug(
    `Updating library ${libraryId} with new completion states`,
    _arg.libraryData.update.completionStates,
  )
  // CompletionStates - batch upsert
  if (_arg.libraryData.update.completionStates.length > 0) {
    const now = new Date()
    await _ctx.db.$executeRaw`
      INSERT INTO "CompletionStatus" ("playniteId", "name", "libraryId", "createdAt", "updatedAt")
      SELECT *
      FROM ROWS FROM (
        UNNEST(${_arg.libraryData.update.completionStates.map((s) => s.id)}::text[]),
        UNNEST(${_arg.libraryData.update.completionStates.map((s) => s.name)}::text[]),
        UNNEST(${Array(_arg.libraryData.update.completionStates.length).fill(libraryId)}::integer[]),
        UNNEST(${Array(_arg.libraryData.update.completionStates.length).fill(now)}::timestamp[]),
        UNNEST(${Array(_arg.libraryData.update.completionStates.length).fill(now)}::timestamp[])
      ) AS t("playniteId", "name", "libraryId", "createdAt", "updatedAt")
      ON CONFLICT ("playniteId", "libraryId")
      DO UPDATE SET
        "name" = EXCLUDED."name",
        "updatedAt" = EXCLUDED."updatedAt"
    `
  }

  logger.debug(
    `Persisting ${_arg.libraryData.update.releases.length} release assets for library ${libraryId}`,
  )

  // Releases
  const sources = await _ctx.db.source.findMany({
    where: { libraryId },
    select: { id: true, playniteId: true, platformId: true },
  })
  const completionStates = await _ctx.db.completionStatus.findMany({
    where: { libraryId },
    select: { id: true, playniteId: true },
  })

  const mqtt = await getClient()

  // Process all releases concurrently
  // The semaphore limits concurrent DB operations globally across all users
  const releasesToUpdate = _arg.libraryData.update.releases.filter(
    (release) => {
      return [sources.some((s) => s.playniteId === release.source)].every(
        Boolean,
      )
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
        release.completionStatus !== '00000000-0000-0000-0000-000000000000'
          ? completionStatusMap.get(release.completionStatus)
          : null,
      coverSlug: `${slug(release)}.webp`,
      features: release.features ?? [],
      tags: release.tags ?? [],
    }
  })

  // Batch upsert releases using raw SQL
  if (releaseData.length > 0) {
    const now = new Date()

    // First, ensure all covers exist as assets
    await _ctx.db.$executeRaw`
      INSERT INTO "Asset" ("type", "slug", "createdAt", "updatedAt")
      SELECT DISTINCT 'cover', cover_slug, ${now}::timestamp, ${now}::timestamp
      FROM ROWS FROM (
        UNNEST(${releaseData.map((r) => r.coverSlug)}::text[])
      ) AS t(cover_slug)
      WHERE NOT EXISTS (
        SELECT 1 FROM "Asset" WHERE "slug" = cover_slug AND "type" = 'cover'
      )
    `

    // Now upsert releases with their cover references
    await _ctx.db.$executeRaw`
      INSERT INTO "Release" (
        "playniteId", "title", "description", "releaseDate", "releaseYear",
        "criticScore", "playtime", "communityScore", "hidden", "sourceId",
        "completionStatusId", "libraryId", "runState", "coverId", "createdAt", "updatedAt"
      )
      SELECT
        rd.playnite_id, rd.title, rd.description, rd.release_date, rd.release_year,
        rd.critic_score, rd.playtime, rd.community_score, rd.hidden, rd.source_id,
        rd.completion_status_id, ${libraryId}, ${runState.stopped},
        (SELECT id FROM "Asset" WHERE slug = rd.cover_slug AND type = 'cover' LIMIT 1),
        ${now}::timestamp, ${now}::timestamp
      FROM ROWS FROM (
        UNNEST(${releaseData.map((r) => r.playniteId)}::text[]),
        UNNEST(${releaseData.map((r) => r.title)}::text[]),
        UNNEST(${releaseData.map((r) => r.description)}::text[]),
        UNNEST(${releaseData.map((r) => r.releaseDate)}::timestamp[]),
        UNNEST(${releaseData.map((r) => r.releaseYear)}::integer[]),
        UNNEST(${releaseData.map((r) => r.criticScore)}::float[]),
        UNNEST(${releaseData.map((r) => r.playtime.toString())}::bigint[]),
        UNNEST(${releaseData.map((r) => r.communityScore)}::float[]),
        UNNEST(${releaseData.map((r) => r.hidden)}::boolean[]),
        UNNEST(${releaseData.map((r) => r.sourceId)}::integer[]),
        UNNEST(${releaseData.map((r) => r.completionStatusId)}::integer[]),
        UNNEST(${releaseData.map((r) => r.coverSlug)}::text[])
      ) AS rd(
        playnite_id, title, description, release_date, release_year,
        critic_score, playtime, community_score, hidden, source_id,
        completion_status_id, cover_slug
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
        "updatedAt" = EXCLUDED."updatedAt"
    `

    // Update cover slugs for existing releases
    await _ctx.db.$executeRaw`
      UPDATE "Asset" a
      SET "slug" = rd.cover_slug, "updatedAt" = ${now}::timestamp
      FROM (
        SELECT *
        FROM ROWS FROM (
          UNNEST(${releaseData.map((r) => r.playniteId)}::text[]),
          UNNEST(${releaseData.map((r) => r.coverSlug)}::text[])
        ) AS t(playnite_id, cover_slug)
      ) rd
      JOIN "Release" r ON r."playniteId" = rd.playnite_id AND r."libraryId" = ${libraryId}
      WHERE a.id = r."coverId" AND a.slug != rd.cover_slug
    `

    // Handle many-to-many relationships (Features and Tags) separately
    // Get all release IDs
    const insertedReleases = await _ctx.db.release.findMany({
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
    const featureRelations: Array<{ releaseId: number; featureId: number }> = []
    const tagRelations: Array<{ releaseId: number; tagId: number }> = []

    const features = await _ctx.db.feature.findMany({
      where: { libraryId },
      select: { id: true, playniteId: true },
    })
    const featureIdMap = new Map(features.map((f) => [f.playniteId, f.id]))

    const tags = await _ctx.db.tag.findMany({
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
        for (const tagPlayniteId of release.tags.filter((t) => t !== null)) {
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
      await _ctx.db.$executeRaw`
        DELETE FROM "_FeatureToRelease"
        WHERE "B" = ANY(${releaseIds}::integer[])
      `
      await _ctx.db.$executeRaw`
        DELETE FROM "_ReleaseToTag"
        WHERE "A" = ANY(${releaseIds}::integer[])
      `

      // Insert new feature relationships
      if (featureRelations.length > 0) {
        await _ctx.db.$executeRaw`
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
        await _ctx.db.$executeRaw`
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

  // Publish MQTT messages for all releases
  await Promise.all(
    releasesToUpdate.map(async (release) => {
      try {
        await mqtt.publish(
          `playnite-web/cover/update`,
          JSON.stringify({ libraryId, release }),
          { qos: 1 },
        )
      } catch (error) {
        logger.error(
          `Error publishing MQTT message for release ${release.id}, ${release.title}`,
          error,
        )
      }
    }),
  )

  const games = groupBy(_arg.libraryData.update.releases, 'title')
  logger.info(
    `Updating library ${libraryId} with ${Object.keys(games).length} games`,
  )

  // Batch upsert games
  const gameEntries = Object.entries(games)
  if (gameEntries.length > 0) {
    // First, upsert all games
    await _ctx.db.$executeRaw`
      INSERT INTO "Game" ("title", "libraryId")
      SELECT *
      FROM ROWS FROM (
        UNNEST(${gameEntries.map(([title]) => title)}::text[]),
        UNNEST(${Array(gameEntries.length).fill(libraryId)}::integer[])
      ) AS t("title", "libraryId")
      ON CONFLICT ("title", "libraryId")
      DO NOTHING
    `

    // Get all game IDs
    const insertedGames = await _ctx.db.game.findMany({
      where: {
        libraryId,
        title: { in: gameEntries.map(([title]) => title) },
      },
      select: { id: true, title: true },
    })

    const gameIdMap = new Map(insertedGames.map((g) => [g.title, g.id]))

    // Get all release IDs for the games
    const allReleasePlayniteIds = gameEntries.flatMap(([, releases]) =>
      releases.map((r) => r.id),
    )
    const releasesForGames = await _ctx.db.release.findMany({
      where: {
        libraryId,
        playniteId: { in: allReleasePlayniteIds },
      },
      select: { id: true, playniteId: true, title: true },
    })

    const releaseIdMap = new Map(
      releasesForGames.map((r) => [r.playniteId, r.id]),
    )

    // Build game-release relationships
    const gameReleaseRelations: Array<{ gameId: number; releaseId: number }> =
      []
    for (const [title, releases] of gameEntries) {
      const gameId = gameIdMap.get(title)
      if (!gameId) continue

      for (const release of releases) {
        const releaseId = releaseIdMap.get(release.id)
        if (releaseId) {
          gameReleaseRelations.push({ gameId, releaseId })
        }
      }
    }

    // Clear existing relationships for these games
    if (insertedGames.length > 0) {
      const gameIds = insertedGames.map((g) => g.id)

      await _ctx.db.$executeRaw`
        DELETE FROM "_GameReleases"
        WHERE "A" = ANY(${gameIds}::integer[])
      `

      // Insert new relationships
      if (gameReleaseRelations.length > 0) {
        await _ctx.db.$executeRaw`
          INSERT INTO "_GameReleases" ("A", "B")
          SELECT *
          FROM ROWS FROM (
            UNNEST(${gameReleaseRelations.map((r) => r.gameId)}::integer[]),
            UNNEST(${gameReleaseRelations.map((r) => r.releaseId)}::integer[])
          ) AS t("A", "B")
          ON CONFLICT DO NOTHING
        `

        // Update the gameId foreign key on each release
        await _ctx.db.$executeRaw`
          UPDATE "Release"
          SET "gameId" = gr.game_id
          FROM (
            SELECT *
            FROM ROWS FROM (
              UNNEST(${gameReleaseRelations.map((r) => r.gameId)}::integer[]),
              UNNEST(${gameReleaseRelations.map((r) => r.releaseId)}::integer[])
            ) AS t(game_id, release_id)
          ) gr
          WHERE "Release"."id" = gr.release_id
        `
      }
    }
  }

  // Clean up games without releases
  logger.info(`Removing games without releases from library ${libraryId}`)
  const removedGames = await _ctx.db.game.deleteMany({
    where: {
      libraryId,
      Releases: { none: {} },
    },
  })
  logger.debug(
    `Removed ${removedGames.count} games without releases from library ${libraryId}`,
  )

  if (library.platformPriority.length === 0) {
    await _ctx.db.library.update({
      where: { id: libraryId },
      data: {
        platformPriority: platforms.map((p) => p.id),
      },
    })
    _ctx.subscriptionPublisher.publish('entityUpdated', {
      id: libraryId,
      type: domains.Library,
      fields: [
        {
          key: 'platformPriority',
          values: platforms.map((p) => create('Platform', p.id).toString()),
        },
      ],
      source: _arg.libraryData.source,
    })
  }

  logger.info(`Library ${libraryId} synced successfully`)

  _ctx.subscriptionPublisher.publish('librarySynced', {
    id: libraryId,
    type: domains.Library,
    source: _arg.libraryData.source,
  })

  return library
}
