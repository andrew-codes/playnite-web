import { spawnSync } from 'child_process'
import logger from 'dev-logger'
import path from 'path'

const migrate = async () => {
  logger.info('Migrating database...')
  const __dirname = import.meta.dirname
  const schemaPath = path.join(__dirname, 'schema.prisma')

  const migrate = spawnSync(
    'npx',
    ['prisma', 'migrate', 'deploy', '--schema', schemaPath],
    {
      stdio: 'inherit',
      env: process.env,
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

export { migrate }
