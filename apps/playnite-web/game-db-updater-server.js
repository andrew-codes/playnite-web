const gameDbUpdater = require('./playnite-web-db-game-updater')
const createDebugger = require('debug')

dotenv.config({
  path: path.join(process.cwd(), 'local.env'),
  override: true,
})
dotenv.config({
  path: path.join(process.cwd(), 'overrides.env'),
  override: true,
})

const debug = createDebugger('playnite-web/app/game-db-updater')

async function run() {
  const mqttClient = await createConnectedMqttClient()

  try {
    debug('Starting Playnite Web game-db-updater...')
    gameDbUpdater(
      {
        assetSaveDirectoryPath: path.join(
          process.cwd(),
          'public/assets/asset-by-id',
        ),
      },
      mqttClient,
    )
  } catch (error) {
    console.log(
      'Failed to run gameDbUpdater. Playnite Web will still work, but the game database will not be updated.',
    )
    debug(error)
  }
}

run()
