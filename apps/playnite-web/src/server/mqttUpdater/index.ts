import createDebugger from 'debug'
import fs from 'fs/promises'
import type { PubSub } from 'graphql-yoga'
import { AsyncMqttClient } from 'mqtt-client'
import { Domain } from '../graphql/Domain'
import { PubSubChannels } from '../graphql/subscriptionPublisher'
import handlers from './handlers'

type HandlerOptions = {
  assetSaveDirectoryPath: string
  pubsub: PubSub<PubSubChannels>
  mqtt: AsyncMqttClient
  domain: Domain
}

const mqttUpdater = async (options: HandlerOptions): Promise<void> => {
  const debug = createDebugger('playnite-web/game-db-updater/index')
  debug('Starting game-db-updater')

  options.mqtt.subscribe('playnite/#')

  await fs.mkdir(options.assetSaveDirectoryPath, { recursive: true })

  options.mqtt.on('message', async (topic, payload) => {
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

export default mqttUpdater
export type { HandlerOptions, PubSubChannels }
