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

  let messageCount = 0
  let messages: Array<{ topic: string; payload: Buffer }> = []
  options.mqtt.on('message', async (topic, payload) => {
    messages.push({ topic, payload })

    if (topic === 'playnite/request/library') {
      messageCount = 0
      console.log('New Message Count:', messageCount)
    }
  })

  let unprocessedMessages: Array<{ topic: string; payload: Buffer }> = []
  setInterval(async () => {
    unprocessedMessages = unprocessedMessages.concat(messages)

    console.log('New Message Count:', messages.length)
    console.log('Unprocessed:', unprocessedMessages.length)

    messages = []
    messageCount += unprocessedMessages.length

    for (const handler of handlers(options)) {
      await handler(unprocessedMessages)
    }
    unprocessedMessages = []
  }, 20000)
}

export default mqttUpdater
export type { HandlerOptions, PubSubChannels }
