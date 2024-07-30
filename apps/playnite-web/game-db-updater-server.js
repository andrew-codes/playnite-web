const gameDbUpdater = require('./playnite-web-game-db-updater')

async function run() {
  const mqttClient = await createConnectedMqttClient()

  try {
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
