import createDebugger from 'debug'

const debug = createDebugger('playnite-web/app/server')

async function run() {
  if (process.env.NODE_ENV !== 'production') {
    debug('Running in non-production mode')
    const { register } = await import('esbuild-register/dist/node.js')
    register()
  }

  const app = await import('./app.mjs')
  app.default()

  try {
    const gameDbUpdater = await import('playnite-web-game-db-updater')
    gameDbUpdater.default.default()
  } catch (error) {
    console.log(
      'Failed to run gameDbUpdater. Playnite Web will still work, but the game database will not be updated.',
    )
    debug(error)
  }
}

run()
