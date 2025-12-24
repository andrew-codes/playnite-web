import { migrate } from 'db-client/migrate'
import logger from 'dev-logger'
import sh from 'shelljs'
import path from 'path'

async function run() {
  logger.info('Shutting down any existing dev services...')
  sh.exec('docker-compose -f src/services.yaml down')

  logger.info('Starting dev services...')
  const result = sh.exec(
    'docker-compose -p playnite-web-services -f src/services.yaml up -d',
    { env: { ...process.env } },
  )
  if (result.code !== 0) {
    logger.error('Error starting dev services:', result.stderr)
    process.exit(1)
  }
  logger.info('Dev services started successfully.')

  process.on('SIGINT', () => {
    logger.info('Shutting down dev services...')
    sh.exec('docker-compose -f src/services.yaml down')
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    logger.info('Shutting down dev services...')
    sh.exec('docker-compose -f src/services.yaml down')
    process.exit(0)
  })

  // Wait for PostgresSQL to be accessible
  const maxRetries = 30
  let attempt = 0
  const waitTime = 2000

  while (attempt < maxRetries) {
    const pgIsReady = sh.exec(
      'docker run --rm --network playnite-web-services_default postgres:latest pg_isready -h db -p 5432 -U local',
      { silent: true },
    )
    if (pgIsReady.code === 0) {
      logger.info('PostgreSQL is ready.')
      break
    }
    attempt++
    logger.info(
      `Waiting for PostgreSQL to be ready... (Attempt ${attempt}/${maxRetries})`,
    )
    await new Promise((res) => setTimeout(res, waitTime))
  }

  if (attempt === maxRetries) {
    logger.error('PostgreSQL did not become ready in time. Exiting.')
    sh.exec('docker-compose -f src/services.yaml down')
    process.exit(1)
  }

  await migrate(
    path.join(__dirname, '../../libs/db-client/src/prisma.config.js'),
  )
}

run()
