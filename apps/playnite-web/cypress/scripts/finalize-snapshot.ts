#!/usr/bin/env tsx
/**
 * Finalize the database snapshot after manual sync
 *
 * This script should be run after you've manually synced the library
 * using the steps from create-test-snapshot.ts
 *
 * Usage:
 *   yarn nx db/finalize-snapshot playnite-web-app
 *   yarn nx db/finalize-snapshot playnite-web-app -- --name mySnapshot
 *
 * Options:
 *   --name <name>  Snapshot filename (default: "librarySnapshot")
 */

import prisma from 'db-client'
import logger from 'dev-logger'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

function parseArgs() {
  const args = process.argv.slice(2)
  let snapshotName = 'librarySnapshot'

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && i + 1 < args.length) {
      snapshotName = args[i + 1]
      i++
    }
  }

  return { snapshotName }
}

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

  // Write to fixture file in db-snapshot subdirectory
  const snapshotDir = join(process.cwd(), 'cypress', 'fixtures', 'db-snapshot')
  const snapshotPath = join(snapshotDir, `${snapshotName}.json`)

  // Ensure the db-snapshot directory exists
  await mkdir(snapshotDir, { recursive: true })

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
    const { snapshotName } = parseArgs()
    await createSnapshot(snapshotName)
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
