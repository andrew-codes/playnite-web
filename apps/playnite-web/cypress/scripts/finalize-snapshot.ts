#!/usr/bin/env tsx
/**
 * Finalize the database snapshot after manual sync
 *
 * This script should be run after you've manually synced the library
 * using the steps from create-test-snapshot.ts
 *
 */

import prisma from 'db-client'
import logger from 'dev-logger'
import { writeFile } from 'fs/promises'
import { join } from 'path'

const SNAPSHOT_NAME = 'librarySnapshot'

async function createSnapshot(snapshotName: string) {
  logger.info(`Creating snapshot: ${snapshotName}...`)

  // Get all data from database
  const [
    users,
    userSettings,
    libraries,
    releases,
    sources,
    platforms,
    features,
    completionStatuses,
    tags,
    games,
    playlists,
    siteSettings,
  ] = await Promise.all([
    prisma.user.findMany({ include: { Settings: true } }),
    prisma.userSetting.findMany(),
    prisma.library.findMany(),
    prisma.release.findMany(),
    prisma.source.findMany(),
    prisma.platform.findMany(),
    prisma.feature.findMany(),
    prisma.completionStatus.findMany(),
    prisma.tag.findMany(),
    prisma.game.findMany(),
    prisma.playlist.findMany(),
    prisma.siteSettings.findMany(),
  ])

  // Get many-to-many relationships
  const releaseFeatures = await prisma.$queryRaw<any[]>`
    SELECT "A" as "releaseId", "B" as "featureId" FROM "_FeatureToRelease"
  `
  const releaseTags = await prisma.$queryRaw<any[]>`
    SELECT "A" as "releaseId", "B" as "tagId" FROM "_ReleaseToTag"
  `
  const gamePlaylists = await prisma.$queryRaw<any[]>`
    SELECT "A" as "gameId", "B" as "playlistId" FROM "_GameToPlaylist"
  `

  const snapshot = {
    users,
    userSettings,
    libraries,
    releases,
    sources,
    platforms,
    features,
    completionStatuses,
    tags,
    games,
    playlists,
    siteSettings,
    releaseFeatures,
    releaseTags,
    gamePlaylists,
  }

  // Write to fixture file
  const snapshotPath = join(
    process.cwd(),
    'cypress',
    'fixtures',
    `${snapshotName}.json`,
  )
  
  // Custom replacer to handle BigInt values
  const jsonReplacer = (_key: string, value: any) => {
    if (typeof value === 'bigint') {
      return value.toString()
    }
    return value
  }
  
  await writeFile(snapshotPath, JSON.stringify(snapshot, jsonReplacer, 2))

  logger.info(`Snapshot created: ${snapshotPath}`)
  logger.info(`  - ${users.length} users`)
  logger.info(`  - ${libraries.length} libraries`)
  logger.info(`  - ${releases.length} releases`)
  logger.info(`  - ${games.length} games`)
  logger.info(`  - ${platforms.length} platforms`)
  logger.info(`  - ${sources.length} sources`)
  logger.info(`  - ${features.length} features`)
  logger.info(`  - ${completionStatuses.length} completion statuses`)
  logger.info(`  - ${tags.length} tags`)
}

async function main() {
  try {
    await createSnapshot(SNAPSHOT_NAME)
    logger.info('✅ Snapshot created successfully!')
    logger.info('')
    logger.info('You can now use this snapshot in your Cypress tests.')
  } catch (error) {
    logger.error('Error creating snapshot:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
