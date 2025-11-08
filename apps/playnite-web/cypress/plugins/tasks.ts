import prisma, { Prisma } from 'db-client'
import { clearDatabase, clearDatabase as clearDatabaseUtil } from 'db-utils'
import logger from 'dev-logger'
import Permission from '../../src/feature/authorization/permissions.js'
import { hashPassword } from '../../src/server/auth/hashPassword.js'
import { codes, defaultSettings } from '../../src/server/siteSettings.js'
import {
  defaultSettings as defaultUserSettings,
  codes as userCodes,
} from '../../src/server/userSettings.js'

const tasks = (on, config) => {
  on('task', {
    async createDatabaseSnapshot(snapshotName: string) {
      let e: any = null

      try {
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
        const fs = await import('fs/promises')
        const path = await import('path')
        const snapshotDir = path.join(
          process.cwd(),
          'cypress',
          'fixtures',
          'db-snapshot',
        )
        const snapshotPath = path.join(snapshotDir, `${snapshotName}.json`)

        // Ensure the db-snapshot directory exists
        await fs.mkdir(snapshotDir, { recursive: true })

        // Custom replacer to handle BigInt values
        const jsonReplacer = (_key: string, value: any) => {
          if (typeof value === 'bigint') {
            return value.toString()
          }
          return value
        }

        await fs.writeFile(
          snapshotPath,
          JSON.stringify(snapshot, jsonReplacer, 2),
        )

        logger.info(`Database snapshot created: ${snapshotPath}`)
        return true
      } catch (error) {
        e = error
        logger.error('Error creating database snapshot:', error)
      }

      if (e) {
        throw new Error('Error creating database snapshot: ' + e.message)
      }

      return true
    },

    async restoreDatabaseSnapshot(snapshotName: string) {
      let e: any = null

      try {
        // Read snapshot file from db-snapshot subdirectory
        const fs = await import('fs/promises')
        const path = await import('path')
        const snapshotPath = path.join(
          process.cwd(),
          'cypress',
          'fixtures',
          'db-snapshot',
          `${snapshotName}.json`,
        )
        const snapshotData = JSON.parse(
          await fs.readFile(snapshotPath, 'utf-8'),
        )

        await clearDatabase()

        // Restore data in correct order (respecting foreign keys)
        // 1. Users (no dependencies)
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

        // 4. Platforms (depends on Library)
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

        // 5. Sources (depends on Library and Platform)
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

        // 6. Features (depends on Library)
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

        // 7. Completion Statuses (depends on Library)
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

        // 8. Tags (depends on Library)
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

        // 9. Games (depends on Library)
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

        // 10. Playlists (depends on Library)
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

        // 11. Releases (depends on Library, Source, CompletionStatus)
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
              gameId: release.gameId,
              releaseGameId: release.releaseGameId,
              createdAt: release.createdAt,
              updatedAt: release.updatedAt,
            },
          })
        }

        // 12. Many-to-many relationships
        for (const rf of snapshotData.releaseFeatures) {
          await prisma.$executeRawUnsafe(
            `INSERT INTO "_FeatureToRelease" ("A", "B") VALUES (${rf.releaseId}, ${rf.featureId})`,
          )
        }

        for (const rt of snapshotData.releaseTags) {
          await prisma.$executeRawUnsafe(
            `INSERT INTO "_ReleaseToTag" ("A", "B") VALUES (${rt.releaseId}, ${rt.tagId})`,
          )
        }

        for (const gp of snapshotData.gamePlaylists) {
          await prisma.$executeRawUnsafe(
            `INSERT INTO "_GameToPlaylist" ("A", "B") VALUES (${gp.gameId}, ${gp.playlistId})`,
          )
        }

        // 13. Site Settings
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
        const sequences = await prisma.$queryRawUnsafe<
          { sequencename: string }[]
        >(`SELECT sequencename FROM pg_sequences WHERE schemaname = 'public'`)

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

        await prisma.$executeRawUnsafe(
          'SET session_replication_role = DEFAULT;',
        )

        logger.info(`Database restored from snapshot: ${snapshotName}`)
        return true
      } catch (error) {
        e = error
        logger.error('Error restoring database snapshot:', error)
        // Ensure foreign key checks are re-enabled
        try {
          await prisma.$executeRawUnsafe(
            'SET session_replication_role = DEFAULT;',
          )
        } catch (cleanupError) {
          logger.warn('Failed to reset session_replication_role:', cleanupError)
        }
      }

      if (e) {
        throw new Error('Error restoring database snapshot: ' + e.message)
      }

      return true
    },

    async clearDatabase() {
      try {
        await clearDatabaseUtil({
          verbose: true,
          maxRetries: 3,
          ensureSiteSettings: true,
          defaultSiteSettings: defaultSettings,
        })
        return true
      } catch (error) {
        logger.error('Error in clearDatabase task:', error)
        throw error
      }
    },

    async seedUsers({ single }: { single?: boolean } = {}) {
      let e: any = null
      try {
        await prisma.user.create({
          data: {
            username: 'test',
            name: 'Test',
            email: 'test@example.com',
            password: hashPassword('test'),
            permission: Permission.SiteAdmin,
            Settings: {
              create: Object.entries(defaultUserSettings).map(
                ([id, setting]) => ({
                  name: setting.name,
                  value: setting.value,
                  dataType: setting.dataType,
                }),
              ),
            },
          },
        })

        if (!single) {
          await prisma.user.create({
            data: {
              username: 'jane',
              name: 'Jane Smith',
              email: 'jane@example.com',
              password: hashPassword('jane'),
              permission: Permission.Write,
              Settings: {
                create: Object.entries(defaultUserSettings).map(
                  ([id, setting]) => ({
                    name: setting.name,
                    value: setting.value,
                    dataType: setting.dataType,
                  }),
                ),
              },
            },
          })
        }

        logger.info('Database seeded successfully!')
      } catch (error) {
        e = error
        logger.error('Error seeding database:', error)
      }

      if (e) {
        throw new Error('Error seeding database:', e)
      }
      return true
    },

    async getUserId(username: string) {
      try {
        const user = await prisma.user.findUniqueOrThrow({
          where: { username },
          select: { id: true },
        })
        return user.id
      } catch (error) {
        logger.error('Error getting user ID:', error)
        throw new Error(`User not found: ${username}`)
      }
    },

    async setSiteSettings(settings: Record<(typeof codes)[number], string>) {
      let e: any = null

      try {
        await Promise.all(
          Object.entries(settings).map(async ([key, value]) => {
            await prisma.siteSettings.update({
              where: { id: key },
              data: { value },
            })
          }),
        )

        logger.info(`Site settings updated.`, settings)
      } catch (error) {
        e = error
        logger.error('Error updating site settings:', error)
      }
      if (e) {
        throw new Error('Error updating site settings:', e)
      }

      return true
    },

    async setUserSettings({
      username,
      settings,
    }: {
      username: string
      settings: Record<(typeof userCodes)[number], string>
    }) {
      let e: any = null
      let results: Array<Prisma.UserSettingGetPayload<{}>> = []

      try {
        const user = await prisma.user.findUniqueOrThrow({
          where: { username },
          select: { id: true },
        })

        results = await Promise.all(
          Object.entries(settings).map(async ([code, value]) => {
            const name = defaultUserSettings[code]?.name || code

            return await prisma.userSetting.update({
              where: {
                userId_name: {
                  userId: user.id,
                  name,
                },
              },
              data: { value },
            })
          }),
        )

        logger.info(`Site settings updated.`, settings)
      } catch (error) {
        e = error
        logger.error('Error updating site settings:', error)
      }
      if (e) {
        throw new Error('Error updating site settings:', e)
      }

      return results
    },

    async waitForLibrarySync({
      libraryId,
      expectedReleaseCount,
      timeout = 30000,
    }: {
      libraryId: number
      expectedReleaseCount: number
      timeout?: number
    }) {
      const startTime = Date.now()
      const interval = 1000

      while (Date.now() - startTime < timeout) {
        try {
          const releases = await prisma.release.findMany({
            where: { libraryId },
          })

          if (releases.length === expectedReleaseCount) {
            logger.info(
              `Library sync completed! Found ${releases.length} releases.`,
            )
            return true
          }

          logger.debug(
            `Waiting for library sync... Found ${releases.length}/${expectedReleaseCount} releases`,
          )
          await new Promise((resolve) => setTimeout(resolve, interval))
        } catch (error) {
          logger.error('Error polling for library sync:', error)
          await new Promise((resolve) => setTimeout(resolve, interval))
        }
      }

      throw new Error(
        `Library sync timed out after ${timeout}ms. Expected ${expectedReleaseCount} releases.`,
      )
    },
  })

  return config
}

export { tasks }
