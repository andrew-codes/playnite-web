import { type AsyncMqttClient } from 'async-mqtt'
import createDebugger from 'debug'
import fs from 'fs/promises'
import handlers from './handlers'
import { getMqttClient } from './mqttClient'

type Options = {
  assetSaveDirectoryPath: string
}

const run = async (options: Options): Promise<AsyncMqttClient> => {
  const debug = createDebugger('playnite-web/game-db-updater/index')
  debug('Starting game-db-updater')

  const mqttClient = await getMqttClient()
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
