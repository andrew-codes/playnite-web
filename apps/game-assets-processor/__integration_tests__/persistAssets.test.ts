import MQTT from 'async-mqtt'
// import { client } from 'db-client'
import { existsSync } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import { rimraf } from 'rimraf'

describe('Persisting assets.', () => {
  let mqtt: MQTT.AsyncMqttClient
  let testAssetPath: string = path.join(
    __dirname,
    '../_packaged/.game-assets/game-assets',
  )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  beforeAll(async () => {
    await rimraf(path.join(testAssetPath, '*.*'))
    // await client.$connect()
    mqtt = await MQTT.connectAsync(`tcp://localhost:1883`, {})
  })

  afterAll(async () => {
    if (mqtt) {
      await mqtt.end()
    }
    // await client.$disconnect()
  })

  test(`Saving to disk.
    - Subscribed MQTT message contains release title.
    - IGN slug is computed from title and use to fetch from IGN graph to locate URL to asset.
    - Found URL is downloaded, resized, and saved to disk as a WEBP file format.`, async () => {
    const testRelease = {
      id: 'test-game-id',
      title: 'The Legend of Zelda: Breath of the Wild',
    }
    await mqtt.publish(
      'playnite-web/cover/update',
      JSON.stringify(testRelease),
      { qos: 1 },
    )
    await new Promise((resolve) => setTimeout(resolve, 5000))
    const expectedAssetPath = path.join(
      testAssetPath,
      'the-legend-of-zelda-breath-of-the-wild.webp',
    )
    const assetExists = existsSync(expectedAssetPath)
    expect(assetExists).toBe(true)

    const stats = await fs.stat(expectedAssetPath)
    expect(stats.size).toBeGreaterThan(0)
  }, 30000)
})
