import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../../src/server/auth/hashPassword.js'
import Permission from '../../src/auth/permissions.js'
import { defaultSettings } from '../../src/server/siteSettings.js'
import { defaultSettings as defaultUserSettings } from '../../src/server/userSettings.js'
import logger from 'dev-logger'
import e from 'express'

const tasks = (on, config) => {
  on('task', {
    async clearDatabase() {
      const prisma = new PrismaClient()

      let e = null
      try {
        await prisma.$connect()

        // Delete data from all tables
        await prisma.game.deleteMany({})
        await prisma.release.deleteMany({})
        await prisma.source.deleteMany({})
        await prisma.platform.deleteMany({})
        await prisma.asset.deleteMany({})
        await prisma.feature.deleteMany({})
        await prisma.completionStatus.deleteMany({})
        await prisma.tag.deleteMany({})
        await prisma.playlist.deleteMany({})
        await prisma.library.deleteMany({})
        await prisma.user.deleteMany({})
        await prisma.userSetting.deleteMany({})
        await prisma.siteSettings.deleteMany({})

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

        // Seed data for all tables
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
                  id,
                  name: setting.name,
                  value: setting.value,
                  dataType: setting.dataType,
                }),
              ),
            },
          },
        })

        prisma.user.create({
          data: {
            username: 'jane',
            name: 'Jane Smith',
            email: 'jane@example.com',
            password: hashPassword('jane'),
            permission: Permission.Write,
            Settings: {
              create: Object.entries(defaultUserSettings).map(
                ([id, setting]) => ({
                  id,
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
  })

  return config
}

export { tasks }
