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

const batchTopic = /^playnite\/[^/]+\/batch$/

const mqttUpdater = async (options: HandlerOptions): Promise<void> => {
  const debug = createDebugger('playnite-web/game-db-updater/index')
  debug('Starting game-db-updater')

  options.mqtt.subscribe('playnite/#')

  await fs.mkdir(options.assetSaveDirectoryPath, { recursive: true })

  options.mqtt.on('message', async (topic, payload) => {
    let messages: Array<{ topic: string; payload: Buffer }> = []
    if (batchTopic.test(topic)) {
      messages = JSON.parse(payload.toString()).messages
      console.log('Batched messages received', messages.length)
    } else {
      messages.push({ topic, payload })
    }

    for (const handler of handlers(options)) {
      await handler(messages)
    }
  })
}

export default mqttUpdater
export type { HandlerOptions, PubSubChannels }
