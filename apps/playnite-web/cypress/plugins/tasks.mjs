import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../../src/server/auth/hashPassword.js'
import logger from 'dev-logger'

const tasks = (on, config) => {
  on('task', {
    async clearDatabase() {
      const prisma = new PrismaClient()

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

        logger.info('Database cleared successfully!')
      } catch (error) {
        logger.error('Error clearing database:', error)
        return error
      } finally {
        await prisma.$disconnect()
      }

      return true
    },

    async seedDatabase() {
      const prisma = new PrismaClient()

      try {
        await prisma.$connect()

        // Seed data for all tables
        await prisma.user.createMany({
          data: [
            {
              username: 'john',
              name: 'John Doe',
              email: 'john@example.com',
              password: hashPassword('john'),
            },
            {
              username: 'jane',
              name: 'Jane Smith',
              email: 'jane@example.com',
              password: hashPassword('jane'),
            },
          ],
        })

        logger.info('Database seeded successfully!')
      } catch (error) {
        logger.error('Error seeding database:', error)
      } finally {
        await prisma.$disconnect()
      }

      return true
    },
  })

  return config
}

export { tasks }
