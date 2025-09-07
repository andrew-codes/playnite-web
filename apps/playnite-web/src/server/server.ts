import { spawnSync } from 'child_process'
import dotenv from 'dotenv'
import path from 'path'
import app from './app.js'
import { prisma } from './data/providers/postgres/client.js'
import { setupApp } from './setupApp.js'

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
  logger.info('Migrating database...')
  if (process.env.NODE_ENV === 'production') {
    logger.info('Applying database migrations...')
    const schemaPath = path.join(__dirname, 'db', 'schema.prisma')
    const migrate = spawnSync(
      'npx',
      ['prisma', 'migrate', 'deploy', '--schema', schemaPath],
      {
        stdio: 'inherit',
      },
    )
    if (migrate.error) {
      logger.error('Failed to run database migrations:', migrate.error)
      process.exit(1)
    }
    if (migrate.status !== 0) {
      logger.error('Database migrations failed with exit code', migrate.status)
      process.exit(migrate.status ?? 1)
    }
  }

  logger.info('Starting Playnite Web...')
  try {
    await prisma.$connect()

    await setupApp()

    await app()
  } catch (error) {
    logger.error('Error starting Playnite Web:', error)
    logger.info('Disconnecting from Prisma client.')
    await prisma.$disconnect()
    logger.debug('Database connection closed.')
    process.exit(1)
  }
}

run().then(async () => {
  await prisma.$disconnect()
})
