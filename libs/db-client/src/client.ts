import { PrismaClient } from '@prisma/client'
import logger from 'dev-logger'
import { htmlSanitizationExtension } from './extensions/htmlSanitization'

declare global {
  var __prisma__: PrismaClient | undefined
}

export const prisma = global.__prisma__ ?? new PrismaClient()
prisma.$extends(htmlSanitizationExtension)

if (process.env.NODE_ENV !== 'production') {
  global.__prisma__ = prisma
}

// Re-export generated types if you like
export * from '@prisma/client'
export type { PrismaClient }

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
export * from '@prisma/client'
export default prisma
