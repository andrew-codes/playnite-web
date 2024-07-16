import { expect, jest, test } from '@jest/globals'
import { AsyncMqttClient, createConnectedMqttClient } from 'mqtt-client'
import run, { Options } from '..'

jest.mock('mqtt-client')
let mockGetMqttClient = createConnectedMqttClient as jest.Mock<
  typeof createConnectedMqttClient
>

let options: Options
describe('game-db-updater run()', () => {
  beforeEach(() => {
    options = {
      assetSaveDirectoryPath: 'test',
    }
  })

  test('Subscribes to "playnite/#" topics.', async () => {
    const mqttClient = {
      subscribe: jest.fn(),
      on: jest.fn(),
    } as unknown as jest.Mocked<AsyncMqttClient>
    mockGetMqttClient.mockResolvedValue(mqttClient)
    await run(options)

    expect(mqttClient.subscribe).toHaveBeenCalledWith('playnite/#')
  })
})
