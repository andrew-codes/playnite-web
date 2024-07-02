import { expect, jest, test } from '@jest/globals'
import { AsyncMqttClient } from 'async-mqtt'
import run, { Options } from '..'
import { getMqttClient } from '../mqttClient'

jest.mock('../mqttClient')
let mockGetMqttClient = getMqttClient as jest.Mock<typeof getMqttClient>

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
