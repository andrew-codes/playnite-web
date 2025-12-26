#!/usr/bin/env tsx
/**
 * Restore database from a snapshot (standalone script)
 *
 * This script restores the database to a saved snapshot state.
 * Can be used outside of Cypress for development/testing.
 *
 * Usage:
 *   yarn tsx apps/playnite-web/cypress/scripts/restore-snapshot.ts [snapshotName]
 *   yarn nx db/use-snapshot playnite-web [snapshotName]
 *
 * Default snapshot: librarySnapshot
 */

import prisma from 'db-client'
import logger from 'dev-logger'
import { readFile } from 'fs/promises'
import { join } from 'path'

const DEFAULT_SNAPSHOT = 'librarySnapshot'

async function restoreDatabaseSnapshot(snapshotName: string) {
  try {
    logger.info(`Restoring database from snapshot: ${snapshotName}...`)

    // Read snapshot file from db-snapshot subdirectory
    const snapshotPath = join(
      process.cwd(),
      'cypress',
      'fixtures',
      'db-snapshot',
      `${snapshotName}.json`,
    )

    logger.info(`Reading snapshot from: ${snapshotPath}`)
    const snapshotData = JSON.parse(await readFile(snapshotPath, 'utf-8'))

    // Clear database first
    logger.info('Clearing database...')
    await prisma.$executeRawUnsafe('SET session_replication_role = replica;')

    const tables = await prisma.$queryRawUnsafe<{ tablename: string }[]>(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations'`,
    )

    for (const table of tables) {
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "${table.tablename}" RESTART IDENTITY CASCADE;`,
      )
    }

    logger.info('Database cleared. Restoring data...')

    // Restore data in correct order (respecting foreign keys)
    // 1. Users (no dependencies)
    logger.info(`Restoring ${snapshotData.users.length} users...`)
    for (const user of snapshotData.users) {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          password: user.password,
          permission: user.permission,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      })
    }

    // 2. User Settings (depends on User)
    logger.info(
      `Restoring ${snapshotData.userSettings.length} user settings...`,
    )
    for (const setting of snapshotData.userSettings) {
      await prisma.userSetting.create({
        data: {
          id: setting.id,
          name: setting.name,
          value: setting.value,
          dataType: setting.dataType,
          userId: setting.userId,
        },
      })
    }

    // 3. Libraries (depends on User)
    logger.info(`Restoring ${snapshotData.libraries.length} libraries...`)
    for (const library of snapshotData.libraries) {
      await prisma.library.create({
        data: {
          id: library.id,
          userId: library.userId,
          name: library.name,
          playniteId: library.playniteId,
          defaultCompletionStatusId: library.defaultCompletionStatusId,
          platformPriority: library.platformPriority,
          createdAt: library.createdAt,
          updatedAt: library.updatedAt,
        },
      })
    }

    // 4. Library Settings (depends on Library)
    logger.info(
      `Restoring ${snapshotData.librarySettings.length} library settings...`,
    )
    for (const setting of snapshotData.librarySettings) {
      await prisma.librarySetting.create({
        data: {
          id: setting.id,
          name: setting.name,
          value: setting.value,
          dataType: setting.dataType,
          libraryId: setting.libraryId,
        },
      })
    }

    // 5. Platforms (depends on Library)
    logger.info(`Restoring ${snapshotData.platforms.length} platforms...`)
    for (const platform of snapshotData.platforms) {
      await prisma.platform.create({
        data: {
          id: platform.id,
          libraryId: platform.libraryId,
          name: platform.name,
          playniteId: platform.playniteId,
          createdAt: platform.createdAt,
          updatedAt: platform.updatedAt,
        },
      })
    }

    // 6. Sources (depends on Library and Platform)
    logger.info(`Restoring ${snapshotData.sources.length} sources...`)
    for (const source of snapshotData.sources) {
      await prisma.source.create({
        data: {
          id: source.id,
          libraryId: source.libraryId,
          name: source.name,
          platformId: source.platformId,
          playniteId: source.playniteId,
          createdAt: source.createdAt,
          updatedAt: source.updatedAt,
        },
      })
    }

    // 7. Features (depends on Library)
    logger.info(`Restoring ${snapshotData.features.length} features...`)
    for (const feature of snapshotData.features) {
      await prisma.feature.create({
        data: {
          id: feature.id,
          libraryId: feature.libraryId,
          name: feature.name,
          playniteId: feature.playniteId,
          createdAt: feature.createdAt,
          updatedAt: feature.updatedAt,
        },
      })
    }

    // 8. Completion Statuses (depends on Library)
    logger.info(
      `Restoring ${snapshotData.completionStatuses.length} completion statuses...`,
    )
    for (const status of snapshotData.completionStatuses) {
      await prisma.completionStatus.create({
        data: {
          id: status.id,
          libraryId: status.libraryId,
          name: status.name,
          playniteId: status.playniteId,
          createdAt: status.createdAt,
          updatedAt: status.updatedAt,
        },
      })
    }

    // 9. Tags (depends on Library)
    logger.info(`Restoring ${snapshotData.tags.length} tags...`)
    for (const tag of snapshotData.tags) {
      await prisma.tag.create({
        data: {
          id: tag.id,
          libraryId: tag.libraryId,
          name: tag.name,
          playniteId: tag.playniteId,
          createdAt: tag.createdAt,
          updatedAt: tag.updatedAt,
        },
      })
    }

    // 10. Games (depends on Library)
    logger.info(`Restoring ${snapshotData.games.length} games...`)
    for (const game of snapshotData.games) {
      await prisma.game.create({
        data: {
          id: game.id,
          libraryId: game.libraryId,
          title: game.title,
          coverArt: game.coverArt,
        },
      })
    }

    // 11. Playlists (depends on Library)
    logger.info(`Restoring ${snapshotData.playlists.length} playlists...`)
    for (const playlist of snapshotData.playlists) {
      await prisma.playlist.create({
        data: {
          id: playlist.id,
          libraryId: playlist.libraryId,
          name: playlist.name,
          createdAt: playlist.createdAt,
          updatedAt: playlist.updatedAt,
        },
      })
    }

    // 12. Releases (depends on Library, Source, CompletionStatus)
    logger.info(`Restoring ${snapshotData.releases.length} releases...`)
    for (const release of snapshotData.releases) {
      await prisma.release.create({
        data: {
          id: release.id,
          libraryId: release.libraryId,
          title: release.title,
          description: release.description,
          releaseDate: release.releaseDate,
          releaseYear: release.releaseYear,
          sourceId: release.sourceId,
          communityScore: release.communityScore,
          criticScore: release.criticScore,
          hidden: release.hidden,
          completionStatusId: release.completionStatusId,
          playniteId: release.playniteId,
          playtime: release.playtime ? BigInt(release.playtime) : null,
          runState: release.runState,
          releaseGameId: release.releaseGameId,
          gameId: release.gameId,
          createdAt: release.createdAt,
          updatedAt: release.updatedAt,
        },
      })
    }

    // 13. Many-to-many relationships
    logger.info('Restoring relationships...')
    logger.info(
      `  - ${snapshotData.releaseFeatures.length} release-feature links`,
    )
    for (const rf of snapshotData.releaseFeatures) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "_FeatureToRelease" ("A", "B") VALUES (${rf.releaseId}, ${rf.featureId})`,
      )
    }

    logger.info(`  - ${snapshotData.releaseTags.length} release-tag links`)
    for (const rt of snapshotData.releaseTags) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "_ReleaseToTag" ("A", "B") VALUES (${rt.releaseId}, ${rt.tagId})`,
      )
    }

    logger.info(`  - ${snapshotData.gamePlaylists.length} game-playlist links`)
    for (const gp of snapshotData.gamePlaylists) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "_GameToPlaylist" ("A", "B") VALUES (${gp.gameId}, ${gp.playlistId})`,
      )
    }

    // 14. Site Settings
    logger.info(
      `Restoring ${snapshotData.siteSettings.length} site settings...`,
    )
    for (const setting of snapshotData.siteSettings) {
      await prisma.siteSettings.create({
        data: {
          id: setting.id,
          name: setting.name,
          value: setting.value,
          dataType: setting.dataType,
        },
      })
    }

    // Reset sequences to match the data
    logger.info('Resetting sequences...')
    const sequences = await prisma.$queryRawUnsafe<{ sequencename: string }[]>(
      `SELECT sequencename FROM pg_sequences WHERE schemaname = 'public'`,
    )

    for (const seq of sequences) {
      const tableName = seq.sequencename.replace(/_id_seq$/, '')
      const maxId = await prisma.$queryRawUnsafe<{ max: number }[]>(
        `SELECT COALESCE(MAX(id), 0) as max FROM "${tableName}"`,
      )
      if (maxId[0]?.max) {
        await prisma.$executeRawUnsafe(
          `SELECT setval('"${seq.sequencename}"', ${maxId[0].max})`,
        )
      }
    }

    await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;')

    logger.info('✅ Database restored successfully!')
    logger.info('')
    logger.info('Summary:')
    logger.info(`  - ${snapshotData.users.length} users`)
    logger.info(`  - ${snapshotData.libraries.length} libraries`)
    logger.info(`  - ${snapshotData.librarySettings.length} library settings`)
    logger.info(`  - ${snapshotData.games.length} games`)
    logger.info(`  - ${snapshotData.releases.length} releases`)
    logger.info(`  - ${snapshotData.platforms.length} platforms`)
    logger.info(`  - ${snapshotData.sources.length} sources`)

    return true
  } catch (error) {
    logger.error('Error restoring database snapshot:', error)
    // Ensure foreign key checks are re-enabled
    try {
      await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;')
    } catch (cleanupError) {
      logger.warn('Failed to reset session_replication_role:', cleanupError)
    }
    throw error
  }
}

async function main() {
  const snapshotName = process.argv[2] || DEFAULT_SNAPSHOT

  try {
    await restoreDatabaseSnapshot(snapshotName)
  } catch (error) {
    logger.error('Failed to restore snapshot:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
