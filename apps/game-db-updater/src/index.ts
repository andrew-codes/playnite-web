import createDebugger from 'debug'
import fs from 'fs/promises'
import { AsyncMqttClient, createConnectedMqttClient } from 'mqtt-client'
import handlers from './handlers'

type Options = {
  assetSaveDirectoryPath: string
}

const run = async (options: Options): Promise<AsyncMqttClient> => {
  const debug = createDebugger('playnite-web/game-db-updater/index')
  debug('Starting game-db-updater')

  const mqttClient = await createConnectedMqttClient()
  mqttClient.subscribe('playnite/#')

  await fs.mkdir(options.assetSaveDirectoryPath, { recursive: true })

  mqttClient.on('message', async (topic, payload) => {
    try {
      await Promise.all(
        handlers(options).map((handler) => handler(topic, payload)),
      )
    } catch (error) {
      console.error(error)
    }
  })

  return mqttClient
}

export default run
export type { Options }
