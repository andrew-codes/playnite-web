import { expect, jest, test } from '@jest/globals'
import { PubSub } from 'graphql-yoga'
import { AsyncMqttClient } from 'mqtt-client'
import run, { Options, PubSubChannels } from '..'

jest.mock('../handlers')

describe('game-db-updater run()', () => {
  const mqttClient = {
    on: jest.fn(),
    subscribe: jest.fn(),
  } as unknown as jest.Mocked<AsyncMqttClient>
  const publish = jest.fn()

  let options: Options
  beforeEach(() => {
    options = {
      assetSaveDirectoryPath: 'test',
    }
  })

  test('Subscribes to "playnite/#" topics.', async () => {
    await run(options, mqttClient, {
      publish,
    } as unknown as PubSub<PubSubChannels>)

    expect(mqttClient.subscribe).toHaveBeenCalledWith('playnite/#')
  })
})
