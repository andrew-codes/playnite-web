import { migrate } from 'db-client/migrate'

/**
 * Global setup for e2e tests.
 * Runs database migrations before any tests execute.
 */
export default async function globalSetup() {
  console.log('Running database migrations before e2e tests...')
  await migrate()
  console.log('Database migrations completed successfully.')
}
