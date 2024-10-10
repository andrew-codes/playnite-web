import { expect, jest, test } from '@jest/globals'
import { PubSub } from 'graphql-yoga'
import { AsyncMqttClient } from 'mqtt-client'
import mqttUpdater, { HandlerOptions, PubSubChannels } from '..'
import { Domain } from '../../graphql/Domain'

jest.mock('../handlers')

describe('game-db-updater run()', () => {
  const mqttClient = {
    on: jest.fn(),
    subscribe: jest.fn(),
  } as unknown as jest.Mocked<AsyncMqttClient>
  const publish = jest.fn()

  let options: HandlerOptions
  beforeEach(() => {
    const domain = {} as unknown as Domain
    options = {
      assetSaveDirectoryPath: 'test',
      mqtt: mqttClient,
      pubsub: { publish } as unknown as PubSub<PubSubChannels>,
      domain,
    }
  })

  test('Subscribes to "playnite/#" topics.', async () => {
    await mqttUpdater(options)

    expect(mqttClient.subscribe).toHaveBeenCalledWith('playnite/#')
  })
})
