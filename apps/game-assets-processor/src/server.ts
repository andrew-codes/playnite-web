import MQTT from 'async-mqtt'
import logger from 'dev-logger'
import express from 'express'
import path from 'path'
import { IgnSourcedAssets } from 'sourced-assets/ign'
import { AssetFileHandler } from './assets/AssetFileHandler.js'

async function run() {
  logger.info('Starting Playnite Web Game Assets Processor...')
  const app = express()
  const port = process.env.PORT ?? 3000

  try {
    const rootAssetPath = path.resolve(
      process.env.ASSET_PATH ?? path.join('./'),
    )
    logger.info('Saving assets to', rootAssetPath)
    const assetHandler = new AssetFileHandler(
      rootAssetPath,
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
          const { libraryId, release } = JSON.parse(message.toString())
          const paths = await assetHandler.persist(release)

          if (!paths) {
            logger.info(
              `Cover for ${release.title} already exists, skipping update.`,
            )
            return
          }

          // const [filename] = paths
          // logger.info(
          //   `Updating release ${release.title} with new cover in database.`,
          // )
          // prisma.release.update({
          //   where: {
          //     playniteId_libraryId: { playniteId: release.id, libraryId },
          //   },
          //   data: {
          //     Cover: {
          //       update: {
          //         ignId: filename,
          //       },
          //     },
          //   },
          // })
        }
      } catch (e) {
        logger.error('Error processing MQTT message:', e)
      }
    })

    app.get('/health', (req, res) => {
      logger.info('Health check OK')
      console.debug('Health check OK')
      res.status(200).send('OK')
    })

    app.listen(port, () => {
      logger.info(
        `Game Assets Processor is running at http://localhost:${port}`,
      )
    })
  } catch (error) {
    logger.error('Error starting Playnite Web Game Assets Processor:', error)
    process.exit(1)
  }
}

run()
