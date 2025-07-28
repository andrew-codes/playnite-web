import createDebugger from 'debug'
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

const debug = createDebugger('playnite-web/app/server')

async function run() {
  debug('Starting Playnite Web applications...')

  debug('Starting Playnite Web app...')
  await app()
}

run()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    debug('Error starting Playnite Web app:', error)
    debug('Disconnected from Prisma client.')
    await prisma.$disconnect()
    process.exit(1)
  })
