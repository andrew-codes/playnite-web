import logger from 'dev-logger'
import { Prisma, PrismaClient } from '../../.generated/prisma/client.js'
import Permission from '../../src/auth/permissions.js'
import { hashPassword } from '../../src/server/auth/hashPassword.js'
import { codes, defaultSettings } from '../../src/server/siteSettings.js'
import {
  defaultSettings as defaultUserSettings,
  codes as userCodes,
} from '../../src/server/userSettings.js'

const tasks = (on, config) => {
  on('task', {
    async clearDatabase() {
      const prisma = new PrismaClient()

      let e: any = null
      try {
        await prisma.$connect()

        await prisma.$executeRawUnsafe(
          'SET session_replication_role = replica;',
        )

        const tables = await prisma.$queryRawUnsafe<{ tablename: string }[]>(
          `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations'`,
        )

        for (const table of tables) {
          const maxRetries = 3
          let retryCount = 0

          while (retryCount < maxRetries) {
            try {
              await prisma.$executeRawUnsafe(
                `TRUNCATE TABLE "${table.tablename}" RESTART IDENTITY CASCADE;`,
              )
              break
            } catch (error: any) {
              retryCount++
              if (error.code === '40P01' && retryCount < maxRetries) {
                // Deadlock detected, wait and retry
                logger.warn(
                  `Deadlock detected on table ${table.tablename}, retrying... (${retryCount}/${maxRetries})`,
                )
                await new Promise((resolve) =>
                  setTimeout(resolve, 100 * retryCount),
                )
              } else {
                throw error
              }
            }
          }
        }

        await prisma.$executeRawUnsafe(
          'SET session_replication_role = DEFAULT;',
        )

        logger.info('Database cleared successfully!')
        logger.info('Ensuring default site settings...')
        await Promise.all(
          Object.entries(defaultSettings).map(async ([id, setting]) => {
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
            logger.info(
              ` - ${storedSetting.name}: ${storedSetting.value} (${storedSetting.dataType})`,
            )
          }),
        )
      } catch (error) {
        e = error
        logger.error('Error clearing database:', error)
      } finally {
        // Ensure foreign key checks are re-enabled even if there's an error
        try {
          await prisma.$executeRawUnsafe(
            'SET session_replication_role = DEFAULT;',
          )
        } catch (cleanupError) {
          logger.warn('Failed to reset session_replication_role:', cleanupError)
        }
        await prisma.$disconnect()
      }
      if (e) {
        throw new Error('Error clearing database:', e)
      }

      return true
    },

    async seedUsers() {
      const prisma = new PrismaClient()

      let e: any = null
      try {
        await prisma.$connect()

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

        logger.info('Database seeded successfully!')
      } catch (error) {
        e = error
        logger.error('Error seeding database:', error)
      } finally {
        await prisma.$disconnect()
      }

      if (e) {
        throw new Error('Error seeding database:', e)
      }
      return true
    },

    async setSiteSettings(settings: Record<(typeof codes)[number], string>) {
      const prisma = new PrismaClient()
      let e: any = null
      try {
        await prisma.$connect()
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
      } finally {
        await prisma.$disconnect()
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
      const prisma = new PrismaClient()
      let e: any = null
      let results: Array<Prisma.UserSettingGetPayload<{}>> = []
      try {
        await prisma.$connect()

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
      } finally {
        await prisma.$disconnect()
      }
      if (e) {
        throw new Error('Error updating site settings:', e)
      }

      return results
    },
  })

  return config
}

export { tasks }
