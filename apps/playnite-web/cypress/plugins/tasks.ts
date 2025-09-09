import { Prisma, client } from 'db-client'
import logger from 'dev-logger'
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
      const maxRetries = 3
      let retryCount = 0

      while (retryCount < maxRetries) {
        let e: any = null
        try {
          await client.$connect()

          await client.$executeRawUnsafe(
            'SET session_replication_role = replica;',
          )

          const tables = await client.$queryRawUnsafe<{ tablename: string }[]>(
            `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations'`,
          )

          for (const table of tables) {
            await client.$executeRawUnsafe(
              `TRUNCATE TABLE "${table.tablename}" RESTART IDENTITY CASCADE;`,
            )
          }

          await client.$executeRawUnsafe(
            'SET session_replication_role = DEFAULT;',
          )

          logger.info('Database cleared successfully!')
          logger.info('Ensuring default site settings...')
          await Promise.all(
            Object.entries(defaultSettings).map(async ([id, setting]) => {
              const storedSetting = await client.siteSettings.upsert({
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

          return true
        } catch (error) {
          e = error
          logger.error(
            `Error clearing database (attempt ${retryCount + 1}/${maxRetries}):`,
            error,
          )
          retryCount++

          if (retryCount < maxRetries) {
            const delay = 1000 * Math.pow(2, retryCount - 1)
            logger.warn(`Retrying in ${delay}ms...`)
            await new Promise((resolve) => setTimeout(resolve, delay))
          }
        } finally {
          // Ensure foreign key checks are re-enabled even if there's an error
          try {
            await client.$executeRawUnsafe(
              'SET session_replication_role = DEFAULT;',
            )
          } catch (cleanupError) {
            logger.warn(
              'Failed to reset session_replication_role:',
              cleanupError,
            )
          }
          await client.$disconnect()
        }

        if (retryCount >= maxRetries && e) {
          throw new Error(
            'Error clearing database after all retries: ' + e.message,
          )
        }
      }

      return true
    },

    async seedUsers() {
      let e: any = null
      try {
        await client.$connect()

        await client.user.create({
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

        await client.user.create({
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
        await client.$disconnect()
      }

      if (e) {
        throw new Error('Error seeding database:', e)
      }
      return true
    },

    async setSiteSettings(settings: Record<(typeof codes)[number], string>) {
      let e: any = null
      try {
        await client.$connect()
        await Promise.all(
          Object.entries(settings).map(async ([key, value]) => {
            await client.siteSettings.update({
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
        await client.$disconnect()
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
        await client.$connect()

        const user = await client.user.findUniqueOrThrow({
          where: { username },
          select: { id: true },
        })

        results = await Promise.all(
          Object.entries(settings).map(async ([code, value]) => {
            const name = defaultUserSettings[code]?.name || code

            return await client.userSetting.update({
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
        await client.$disconnect()
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
