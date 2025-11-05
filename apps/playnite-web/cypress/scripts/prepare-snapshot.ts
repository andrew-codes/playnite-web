#!/usr/bin/env tsx
/**
 * Script to create a database snapshot for Cypress e2e tests
 *
 * This script:
 * 1. Clears the database
 * 2. Seeds test users
 *
 * Usage: yarn nx db/prepare-snapshot playnite-web-app
 */

import { clearDatabase as clearDatabaseUtil } from 'db-utils'
import prisma from 'db-client'
import logger from 'dev-logger'
import Permission from '../../src/feature/authorization/permissions.js'
import { hashPassword } from '../../src/server/auth/hashPassword.js'
import { defaultSettings as defaultUserSettings } from '../../src/server/userSettings.js'



async function seedUsers() {
  logger.info('Seeding test users...')

  await prisma.user.create({
    data: {
      username: 'test',
      name: 'Test',
      email: 'test@example.com',
      password: hashPassword('test'),
      permission: Permission.SiteAdmin,
      Settings: {
        create: Object.entries(defaultUserSettings).map(([id, setting]) => ({
          name: setting.name,
          value: setting.value,
          dataType: setting.dataType,
        })),
      },
    },
  })

  await prisma.user.create({
    data: {
      username: 'jane',
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: hashPassword('jane'),
      permission: Permission.Write,
      Settings: {
        create: Object.entries(defaultUserSettings).map(([id, setting]) => ({
          name: setting.name,
          value: setting.value,
          dataType: setting.dataType,
        })),
      },
    },
  })

  logger.info('Users seeded!')
}

async function main() {
  try {
    // Step 1: Clear database
    await clearDatabaseUtil()

    // Step 2: Seed users
    await seedUsers()

    logger.info('Note: To create the snapshot, you need to:')
    logger.info('1. Start the Playnite Web app: yarn nx start playnite-web-app')
    logger.info(
      '2. Start the sync-library-processor: yarn nx start sync-library-processor',
    )
    logger.info(
      '3. Run this command to authenticate and sync: yarn nx db/create-snapshot playnite-web-app',
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
