/**
 * Database Test Utilities
 * 
 * Consolidated utilities for clearing and managing database state during testing.
 * Used by Cypress tests, e2e tests, and snapshot creation scripts.
 */

import prisma from 'db-client'
import logger from 'dev-logger'

export interface ClearDatabaseOptions {
  /**
   * Whether to log progress messages
   * @default true
   */
  verbose?: boolean
  
  /**
   * Maximum number of retry attempts if clearing fails
   * @default 3
   */
  maxRetries?: number
  
  /**
   * Whether to ensure default site settings after clearing
   * @default false
   */
  ensureSiteSettings?: boolean
  
  /**
   * Default site settings to ensure (only used if ensureSiteSettings is true)
   */
  defaultSiteSettings?: Record<string, { name: string; value: string; dataType: string }>
}

/**
 * Clear all data from the database while preserving the schema.
 * 
 * This function:
 * 1. Disables foreign key constraints temporarily
 * 2. Truncates all tables except _prisma_migrations
 * 3. Resets identity sequences
 * 4. Re-enables foreign key constraints
 * 5. Optionally ensures default site settings exist
 * 
 * @param options - Configuration options for clearing
 * @returns Promise that resolves when database is cleared
 * @throws Error if clearing fails after all retries
 */
export async function clearDatabase(options: ClearDatabaseOptions = {}): Promise<void> {
  const {
    verbose = true,
    maxRetries = 3,
    ensureSiteSettings = false,
    defaultSiteSettings = {},
  } = options

  let retryCount = 0

  while (retryCount < maxRetries) {
    try {
      if (verbose) {
        logger.info('Clearing database...')
      }

      // Disable foreign key constraints
      await prisma.$executeRawUnsafe('SET session_replication_role = replica;')

      // Get all tables except migrations
      const tables = await prisma.$queryRawUnsafe<{ tablename: string }[]>(
        `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations'`,
      )

      // Truncate all tables
      for (const table of tables) {
        await prisma.$executeRawUnsafe(
          `TRUNCATE TABLE "${table.tablename}" RESTART IDENTITY CASCADE;`,
        )
      }

      // Re-enable foreign key constraints
      await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;')

      if (verbose) {
        logger.info('Database cleared successfully!')
      }

      // Optionally ensure site settings
      if (ensureSiteSettings && Object.keys(defaultSiteSettings).length > 0) {
        if (verbose) {
          logger.info('Ensuring default site settings...')
        }
        
        await Promise.all(
          Object.entries(defaultSiteSettings).map(async ([id, setting]) => {
            const storedSetting = await prisma.siteSettings.upsert({
              where: { id },
              create: {
                id,
                name: setting.name,
                value: setting.value,
                dataType: setting.dataType,
              },
              update: {},
            })
            
            if (verbose) {
              logger.info(
                ` - ${storedSetting.name}: ${storedSetting.value} (${storedSetting.dataType})`,
              )
            }
          }),
        )
      }

      return
    } catch (error) {
      retryCount++
      
      if (verbose) {
        logger.error(
          `Error clearing database (attempt ${retryCount}/${maxRetries}):`,
          error,
        )
      }

      // Re-enable foreign key constraints even on error
      try {
        await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;')
      } catch (cleanupError) {
        if (verbose) {
          logger.warn('Failed to reset session_replication_role:', cleanupError)
        }
      }

      if (retryCount < maxRetries) {
        const delay = 1000 * Math.pow(2, retryCount - 1)
        if (verbose) {
          logger.warn(`Retrying in ${delay}ms...`)
        }
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        throw new Error(
          `Failed to clear database after ${maxRetries} attempts: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }
  }
}

/**
 * Delete all test data from the database in the correct order to respect
 * foreign key constraints. This is a lighter-weight alternative to clearDatabase()
 * that doesn't require disabling constraints.
 * 
 * Useful for cleaning up between individual tests.
 * 
 * @param options - Configuration options
 * @returns Promise that resolves when data is deleted
 */
export async function deleteTestData(options: { verbose?: boolean } = {}): Promise<void> {
  const { verbose = false } = options

  if (verbose) {
    logger.info('Deleting test data...')
  }

  // Delete in correct order to respect foreign key constraints
  await prisma.release.deleteMany({})
  await prisma.game.deleteMany({})
  await prisma.feature.deleteMany({})
  await prisma.tag.deleteMany({})
  await prisma.completionStatus.deleteMany({})
  await prisma.source.deleteMany({})
  await prisma.platform.deleteMany({})
  await prisma.playlist.deleteMany({})
  await prisma.library.deleteMany({})
  await prisma.userSetting.deleteMany({})
  await prisma.user.deleteMany({})

  if (verbose) {
    logger.info('Test data deleted successfully!')
  }
}

/**
 * Utility to safely disconnect from the database.
 * Should be called in test cleanup (afterAll/afterEach).
 * 
 * @returns Promise that resolves when disconnected
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
}
