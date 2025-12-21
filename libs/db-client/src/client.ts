import { PrismaPg } from '@prisma/adapter-pg'
import logger from 'dev-logger'
import { PrismaClient } from '../.generated/client'
import { htmlSanitizationExtension } from './extensions/htmlSanitization'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

declare global {
  var __prisma__: PrismaClient | undefined
}

export const prisma = global.__prisma__ ?? new PrismaClient({ adapter })
prisma.$extends(htmlSanitizationExtension)

if (process.env.NODE_ENV !== 'production') {
  global.__prisma__ = prisma
}

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`)
  try {
    logger.info('HTTP server closed.')
    await prisma.$disconnect()
    logger.info('Database connection closed.')
    process.exit(0)
  } catch (error) {
    logger.error('Error during graceful shutdown:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// export default client
export * from '../.generated/client'
export type { PrismaClient }
export default prisma
