import type { AsyncMqttClient } from 'async-mqtt'
import createDebugger from 'debug'
import fs from 'fs/promises'
import type { PubSub } from 'graphql-yoga'
import { merge } from 'lodash-es'
import EntityConditionalDataApi from '../data/entityConditional/DataApi.js'
import InMemoryDataApi from '../data/inMemory/DataApi.js'
import { getDbClient } from '../data/mongo/client.js'
import MongoDataApi from '../data/mongo/DataApi.js'
import PriorityDataApi from '../data/priority/DataApi.js'
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

const mqttUpdater = async (
  options: Omit<
    HandlerOptions,
    'queryApi' | 'updateQueryApi' | 'deleteQueryApi'
  >,
): Promise<void> => {
  const debug = createDebugger('playnite-web/game-db-updater/index')
  debug('Starting game-db-updater')

  options.mqtt.subscribe('playnite/#')

  await fs.mkdir(options.assetSaveDirectoryPath, { recursive: true })

  options.mqtt.on('message', async (topic, payload) => {
    const db = (await getDbClient()).db('games')
    const mongoApi = new MongoDataApi(db)
    const inMemoryApi = new InMemoryDataApi()
    const userInMemory = new EntityConditionalDataApi(
      new Set(['User']),
      inMemoryApi,
      inMemoryApi,
    )
    const dataApi = new PriorityDataApi(
      new Set([userInMemory, mongoApi]),
      new Set([userInMemory, mongoApi]),
      new Set([mongoApi]),
    )

    debug(`Processing topic ${topic}`)
    Promise.all(
      handlers(
        merge({}, options, {
          queryApi: dataApi,
          updateQueryApi: dataApi,
          deleteQueryApi: dataApi,
        }),
      ).map((handler) => handler(topic, payload)),
    ).catch((reason) => console.error(reason))
  })
}

export default mqttUpdater
export type { HandlerOptions, PubSubChannels }
