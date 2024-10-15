import { expect, jest, test } from '@jest/globals'
import { PubSub } from 'graphql-yoga'
import { Db } from 'mongodb'
import { AsyncMqttClient } from 'mqtt-client'
import mqttUpdater, { HandlerOptions, PubSubChannels } from '..'
import MongoDataApi from '../../data/mongo/DataApi'

jest.mock('../handlers')
jest.mock('../../data/mongo/DataApi', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    executeUpdate: jest.fn(),
  })),
}))

describe('game-db-updater run()', () => {
  const mqttClient = {
    on: jest.fn(),
    subscribe: jest.fn(),
  } as unknown as jest.Mocked<AsyncMqttClient>
  const publish = jest.fn()

  let dataApi: MongoDataApi

  let options: HandlerOptions
  beforeEach(() => {
    dataApi = new MongoDataApi(null as unknown as Db)
    options = {
      assetSaveDirectoryPath: 'test',
      mqtt: mqttClient,
      pubsub: { publish } as unknown as PubSub<PubSubChannels>,
      queryApi: dataApi,
      updateQueryApi: dataApi,
      deleteQueryApi: dataApi,
    }
  })

  test('Subscribes to "playnite/#" topics.', async () => {
    await mqttUpdater(options)

    expect(mqttClient.subscribe).toHaveBeenCalledWith('playnite/#')
  })
})
