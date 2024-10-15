import createDebugger from 'debug'
import fs from 'fs/promises'
import type { PubSub } from 'graphql-yoga'
import { AsyncMqttClient } from 'mqtt-client'
import { IDeleteQuery, IQuery, IUpdateQuery } from '../data/types.api'
import { PubSubChannels } from '../graphql/subscriptionPublisher'
import handlers from './handlers'

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

  options.mqtt.on('message', (topic, payload) => {
    debug(`Processing topic ${topic}`)
    Promise.all(
      handlers(options).map((handler) => handler(topic, payload)),
    ).catch((reason) => console.error(reason))
  })
}

export default mqttUpdater
export type { HandlerOptions, PubSubChannels }
