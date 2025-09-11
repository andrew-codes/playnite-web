import MQTT from 'async-mqtt'
import * as dbClient from 'db-client'
import * as devLogger from 'dev-logger'
import express from 'express'
import path from 'path'
import { IgnSourcedAssets } from 'sourced-assets/ign'
import { AssetFileHandler } from './assets/AssetFileHandler.js'

async function run() {
  const logger = devLogger.default

  const client = dbClient.client
  logger.info('Starting Playnite Web Game Assets Processor...')
  const app = express()
  const port = process.env.PORT ?? 3000

  try {
    await client.$connect()
    const assetHandler = new AssetFileHandler(
      process.env.ASSET_PATH ?? path.join('./'),
      new IgnSourcedAssets(),
    )

    const mqtt = await MQTT.connectAsync(
      `tcp://${process.env.MQTT_HOST ?? 'localhost'}:${process.env.MQTT_PORT ?? '1883'}`,
      {
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
      },
    )
    await mqtt.subscribe('playnite-web/cover/update', { qos: 1 })
    mqtt.on('message', async (topic, message) => {
      try {
        if (topic === 'playnite-web/cover/update') {
          const release = JSON.parse(message.toString())
          await assetHandler.persist(release)
          logger.info(`Processing cover update for game ID ${release.id}...`)
        }
      } catch (e) {
        logger.error('Error processing MQTT message:', e)
      }
    })

    app.get('/health', (req, res) => {
      res.status(200).send('OK')
    })
    app.listen(port, () => {
      logger.info(
        `Game Assets Processor is running at http://localhost:${port}`,
      )
    })
  } catch (error) {
    logger.error('Error starting Playnite Web Game Assets Processor:', error)
    logger.info('Disconnecting from Prisma client.')
    await client.$disconnect()
    logger.debug('Database connection closed.')
    process.exit(1)
  }
}

run()
