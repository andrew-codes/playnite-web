import { type AsyncMqttClient } from 'async-mqtt'
import createDebugger from 'debug'
import handlers from './handlers'
import { getMqttClient } from './mqttClient'

const run: () => Promise<AsyncMqttClient> = async () => {
  const debug = createDebugger('playnite-web/game-db-updater/index')
  debug('Starting game-db-updater')

  const mqttClient = await getMqttClient()
  mqttClient.subscribe('playnite/#')

  mqttClient.on('message', async (topic, payload) => {
    try {
      await Promise.all(handlers.map((handler) => handler(topic, payload)))
    } catch (error) {
      console.error(error)
    }
  })

  return mqttClient
}

export default run
