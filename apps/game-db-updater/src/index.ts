import createDebugger from 'debug'
import fs from 'fs/promises'
import { AsyncMqttClient } from 'mqtt-client'
import handlers from './handlers'

type Options = {
  assetSaveDirectoryPath: string
}

const run = async (
  options: Options,
  mqttClient: AsyncMqttClient,
): Promise<void> => {
  const debug = createDebugger('playnite-web/game-db-updater/index')
  debug('Starting game-db-updater')

  mqttClient.subscribe('playnite/#')

  await fs.mkdir(options.assetSaveDirectoryPath, { recursive: true })

  mqttClient.on('message', async (topic, payload) => {
    try {
      debug(`Processing topic ${topic}`)
      await Promise.all(
        handlers(options).map((handler) => handler(topic, payload)),
      )
    } catch (error) {
      debug(`Error processing topic ${topic}`)
      console.error(error)
    }
  })
}

export default run
export type { Options }
