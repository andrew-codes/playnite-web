import type { AsyncMqttClient } from 'async-mqtt'
import createDebugger from 'debug'
import fs from 'fs/promises'
import type { PubSub } from 'graphql-yoga'
import { IDeleteQuery, IQuery, IUpdateQuery } from '../data/types.api.js'
import { PubSubChannels } from '../graphql/subscriptionPublisher.js'
import handlers from './handlers/index.js'

type HandlerOptions = {
  assetSaveDirectoryPath: string
  pubsub: PubSub<PubSubChannels>
  mqtt: AsyncMqttClient
  queryApi: IQuery
  updateQueryApi: IUpdateQuery
  deleteQueryApi: IDeleteQuery
}

const mqttUpdater = async (options: HandlerOptions): Promise<void> => {
  const debug = createDebugger('playnite-web/game-db-updater/index')
  debug('Starting game-db-updater')

  options.mqtt.subscribe('playnite/#')

  await fs.mkdir(options.assetSaveDirectoryPath, { recursive: true })

  let messages: Array<{ topic: string; payload: Buffer }> = []
  options.mqtt.on('message', async (topic, payload) => {
    messages.push({ topic, payload })
  })

  setInterval(async () => {
    const currentMessages = messages
    messages = []

    await Promise.all(
      handlers(options).map((handler) => handler(currentMessages)),
    )
  }, 1000)
}

export default mqttUpdater
export type { HandlerOptions, PubSubChannels }
