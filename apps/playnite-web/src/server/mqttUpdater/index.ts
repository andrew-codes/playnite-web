import type { AsyncMqttClient } from 'async-mqtt'
import createDebugger from 'debug'
import fs from 'fs/promises'
import type { PubSub } from 'graphql-yoga'
import { IDeleteQuery, IQuery, IUpdateQuery } from '../data/types.api.js'
import { PubSubChannels } from '../graphql/subscriptionPublisher.js'
import handlers from './handlers/index.js'

const debug = createDebugger('playnite-web/game-db-updater/index')

type HandlerOptions = {
  assetSaveDirectoryPath: string
  pubsub: PubSub<PubSubChannels>
  mqtt: AsyncMqttClient
  queryApi: IQuery
  updateQueryApi: IUpdateQuery
  deleteQueryApi: IDeleteQuery
}

const batchTopic = /^playnite\/[^/]+\/batch$/
const librarySync = /^playnite\/[^/]+\/library\/sync\/(.*)$/

const mqttUpdater = async (options: HandlerOptions): Promise<void> => {
  debug('Starting game-db-updater')

  options.mqtt.subscribe('playnite/#')

  await fs.mkdir(options.assetSaveDirectoryPath, { recursive: true })

  let syncMessageCount = 0
  options.mqtt.on('message', async (topic, payload) => {
    const librarySyncMessageMatches = librarySync.exec(topic)
    if (librarySyncMessageMatches?.[1] === 'start') {
      syncMessageCount = 0
      return
    }
    if (librarySyncMessageMatches?.[1] === 'completed') {
      debug(
        `Library sync completed. Processed a total of ${syncMessageCount} database entities. This number should match the number of all documents, across all collections, in your games database.`,
      )
      return
    }

    let messages: Array<{ topic: string; payload: Buffer }> = []
    if (batchTopic.test(topic)) {
      messages = JSON.parse(payload.toString()).messages
      syncMessageCount += messages.length
      debug('Batched messages received', messages.length)
    } else {
      syncMessageCount += 1
      messages.push({ topic, payload })
    }

    for (const handler of handlers(options)) {
      await handler(messages)
    }
  })
}

export default mqttUpdater
export type { HandlerOptions, PubSubChannels }
