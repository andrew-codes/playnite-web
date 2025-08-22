import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../../src/server/auth/hashPassword.js'
import Permission from '../../src/auth/permissions.js'
import { defaultSettings } from '../../src/server/siteSettings.js'
import { defaultSettings as defaultUserSettings } from '../../src/server/userSettings.js'
import fs from 'fs/promises'
import logger from 'dev-logger'
import path from 'path'

const tasks = (on, config) => {
  on('task', {
    async clearDatabase() {
      const prisma = new PrismaClient()

      let e = null
      try {
        await prisma.$connect()

        const tables = await prisma.$queryRaw`
          SELECT tablename FROM pg_tables
          WHERE schemaname = 'public'
          AND tablename != '_prisma_migrations'
        `
        for (const table of tables) {
          await prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "${table.tablename}" RESTART IDENTITY CASCADE;`,
          )
        }

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
        await prisma.$disconnect()
      }
      if (e) {
        throw new Error('Error clearing database:', e)
      }

      return true
    },

    async seedUsers() {
      const prisma = new PrismaClient()

      let e = null
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

    async setSiteSettings(settings) {
      const prisma = new PrismaClient()
      let e = null
      try {
        await prisma.$connect()
        await Promise.all(
          Object.entries(settings).map(async ([key, value]) => {
            await prisma.siteSettings.update({
              where: { id: key },
              data: { value: value.toString() },
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

    async setUserSettings({ username, settings }) {
      const prisma = new PrismaClient()
      let e = null
      let results = []
      try {
        await prisma.$connect()

        const user = await prisma.user.findUnique({
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
              data: { value: value.toString() },
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

    async clearRequestLog() {
      try {
        await fs.writeFile(path.join('logs', 'e2e.log'), '', 'utf8')
      } catch (e) {
        logger.error('Error clearing request log:', e)
      }

      return true
    },

    async readRequestLog() {
      try {
        const data = await fs.readFile(path.join('logs', 'e2e.log'), 'utf-8')

        return data
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line))
      } catch (e) {
        logger.error('Error reading request log:', e)
        return []
      }
    },
  })

  return config
}

export { tasks }
