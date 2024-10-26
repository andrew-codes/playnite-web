import createDebugger from 'debug'
import fs from 'fs/promises'
import type { PubSub } from 'graphql-yoga'
import _ from 'lodash'
import { AsyncMqttClient } from 'mqtt-client'
import EntityConditionalDataApi from '../data/entityConditional/DataApi'
import InMemoryDataApi from '../data/inMemory/DataApi'
import { getDbClient } from '../data/mongo/client'
import MongoDataApi from '../data/mongo/DataApi'
import PriorityDataApi from '../data/priority/DataApi'
import { IDeleteQuery, IQuery, IUpdateQuery } from '../data/types.api'
import { PubSubChannels } from '../graphql/subscriptionPublisher'
import handlers from './handlers'

const { merge } = _

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
