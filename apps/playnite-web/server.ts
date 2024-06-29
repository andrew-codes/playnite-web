import createDebugger from 'debug'
import gameDbUpdater from 'playnite-web-game-db-updater'
import app from './app'

const debug = createDebugger('playnite-web/app/server')

async function run() {
  debug('Starting Playnite Web applications...')
  debug('Starting Playnite Web app...')
  app()

  try {
    debug('Starting Playnite Web game-db-updater...')
    gameDbUpdater()
  } catch (error) {
    console.log(
      'Failed to run gameDbUpdater. Playnite Web will still work, but the game database will not be updated.',
    )
    debug(error)
  }
}

run()
