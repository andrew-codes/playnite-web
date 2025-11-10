#!/usr/bin/env tsx
/**
 * Script to create a database snapshot for Cypress e2e tests
 *
 * This script:
 * 1. Clears the database
 * 2. Seeds test users
 *
 * Usage: yarn nx db/prepare-snapshot playnite-web-app -- [username1] [username2] [...]
 * Example: yarn nx db/prepare-snapshot playnite-web-app -- test jane
 */

import prisma from 'db-client'
import { clearDatabase as clearDatabaseUtil } from 'db-utils'
import logger from 'dev-logger'
import Permission from '../../src/feature/authorization/permissions.js'
import { hashPassword } from '../../src/server/auth/hashPassword.js'
import { defaultSettings as defaultSiteSettings } from '../../src/server/siteSettings.js'
import { defaultSettings as defaultUserSettings } from '../../src/server/userSettings.js'

async function seedSiteSettings() {
  logger.info('Seeding site settings...')

  await Promise.all(
    Object.entries(defaultSiteSettings).map(async ([id, setting]) => {
      await prisma.siteSettings.create({
        data: {
          id,
          name: setting.name,
          value: setting.value,
          dataType: setting.dataType,
        },
      })
      logger.info(`  Created site setting: ${setting.name}`)
    }),
  )

  logger.info('Site settings seeded!')
}

async function seedUsers(usernames: string[]) {
  logger.info(`Seeding ${usernames.length} test user(s)...`)

  for (const username of usernames) {
    await prisma.user.create({
      data: {
        username,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        email: `${username}@example.com`,
        password: hashPassword(username),
        permission:
          username === 'test' ? Permission.SiteAdmin : Permission.Write,
        Settings: {
          create: Object.entries(defaultUserSettings).map(([id, setting]) => ({
            name: setting.name,
            value: setting.value,
            dataType: setting.dataType,
          })),
        },
      },
    })
    logger.info(`  Created user: ${username}`)
  }

  logger.info('Users seeded!')
}

async function main() {
  try {
    // Get usernames from command line arguments
    const usernames = process.argv.slice(2)

    if (usernames.length === 0) {
      logger.error('Error: No usernames provided')
      logger.info(
        'Usage: yarn nx db/prepare-snapshot playnite-web-app -- <username1> [username2] [...]',
      )
      logger.info(
        'Example: yarn nx db/prepare-snapshot playnite-web-app -- test jane',
      )
      process.exit(1)
    }

    logger.info(`Preparing snapshot with users: ${usernames.join(', ')}`)

    // Step 1: Clear database
    await clearDatabaseUtil()

    // Step 2: Seed site settings
    await seedSiteSettings()

    // Step 3: Seed users
    await seedUsers(usernames)

    logger.info('Note: To create the snapshot, you need to:')
    logger.info('1. Start the Playnite Web app: yarn nx start playnite-web-app')
    logger.info(
      '2. Start the sync-library-processor to persist images to local: COVER_ART_PATH="../playnite-web/.cover-art" yarn nx start sync-library-processor',
    )
    logger.info(
      '3. Run this command to authenticate and sync: yarn nx db/sync-user-library playnite-web-app',
    )
    logger.info('4. Then run: yarn nx finalize-snapshot playnite-web-app')
    logger.info('Database has been cleared and users seeded.')
    logger.info('Waiting for you to complete the steps above...')
  } catch (error) {
    logger.error('Error creating test snapshot:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
