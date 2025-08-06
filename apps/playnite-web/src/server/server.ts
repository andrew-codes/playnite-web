import dotenv from 'dotenv'
import path from 'path'
import app from './app.js'
import { prisma } from './data/providers/postgres/client.js'

const __dirname = import.meta.dirname

dotenv.config({
  path: path.join(__dirname, '..', '..', 'local.env'),
  override: true,
})
dotenv.config({
  path: path.join(__dirname, '..', '..', 'overrides.env'),
  override: true,
})

async function run() {
  const logger = (await import('./logger.js')).default

  logger.info('Starting Playnite Web applications...')

  logger.info('Starting Playnite Web app...')
  try {
    await app()
  } catch (error) {
    logger.error('Error starting Playnite Web app:', error)
    logger.info('Disconnected from Prisma client.')
    await prisma.$disconnect()
    logger.debug('Database connection closed.')
    process.exit(1)
  }
}

run().then(async () => {
  await prisma.$disconnect()
})
