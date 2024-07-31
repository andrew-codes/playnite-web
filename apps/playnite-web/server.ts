import createDebugger from 'debug'
import dotenv from 'dotenv'
import { createConnectedMqttClient } from 'mqtt-client'
import path from 'path'
import gameDbUpdater from 'playnite-web-game-db-updater'
import app from './app'

if (process.env.NODE_ENV === 'development') {
  dotenv.config({
    path: path.join(process.cwd(), 'local.env'),
    override: true,
  })
  dotenv.config({
    path: path.join(process.cwd(), 'overrides.env'),
    override: true,
  })
}

const debug = createDebugger('playnite-web/app/server')

async function run() {
  debug('Starting Playnite Web applications...')

  debug('Connecting to MQTT broker...')
  const mqttClient = await createConnectedMqttClient()

  debug('Game db updater starting...')
  gameDbUpdater(
    {
      assetSaveDirectoryPath: path.join(
        process.cwd(),
        'public/assets/asset-by-id',
      ),
    },
    mqttClient,
  )

  debug('Starting Playnite Web app...')
  app(mqttClient)
}

run()
