import { expect, jest, test } from '@jest/globals'
import { AsyncMqttClient } from 'mqtt-client'
import run, { Options } from '..'

describe('game-db-updater run()', () => {
  const mqttClient = {
    on: jest.fn(),
    subscribe: jest.fn(),
  } as unknown as jest.Mocked<AsyncMqttClient>

  let options: Options
  beforeEach(() => {
    options = {
      assetSaveDirectoryPath: 'test',
    }
  })

  test('Subscribes to "playnite/#" topics.', async () => {
    await run(options, mqttClient)

    expect(mqttClient.subscribe).toHaveBeenCalledWith('playnite/#')
  })
})
