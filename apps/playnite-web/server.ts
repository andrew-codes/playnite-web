import createDebugger from 'debug'
import dotenv from 'dotenv'
import path from 'path'
import gameDbUpdater from 'playnite-web-game-db-updater'
import app from './app'

dotenv.config({
  path: path.join(process.cwd(), 'local.env'),
  override: true,
})
dotenv.config({
  path: path.join(process.cwd(), 'overrides.env'),
  override: true,
})

const debug = createDebugger('playnite-web/app/server')

async function run() {
  debug('Starting Playnite Web applications...')
  debug('Starting Playnite Web app...')
  app()

  try {
    debug('Starting Playnite Web game-db-updater...')
    gameDbUpdater({
      assetSaveDirectoryPath: path.join(process.cwd(), 'public/asset-by-id'),
    })
  } catch (error) {
    console.log(
      'Failed to run gameDbUpdater. Playnite Web will still work, but the game database will not be updated.',
    )
    debug(error)
  }
}

run()
