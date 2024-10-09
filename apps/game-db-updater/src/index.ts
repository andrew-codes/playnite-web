import createDebugger from 'debug'
import fs from 'fs/promises'
import type { PubSub } from 'graphql-yoga'
import _ from 'lodash'
import { AsyncMqttClient } from 'mqtt-client'
import handlers from './handlers'

const { merge } = _

type PubSubChannels = {
  releaseRunStateChanged: [
    {
      id: string
      gameId: string
      runState: string
      processId: string | null
    },
  ]
}

type Options = {
  assetSaveDirectoryPath: string
}
type HandlerOptions = Options & {
  publisher: PubSub<PubSubChannels>
}

const run = async (
  options: Options,
  mqttClient: AsyncMqttClient,
  publisher: PubSub<PubSubChannels>,
): Promise<void> => {
  const debug = createDebugger('playnite-web/game-db-updater/index')
  debug('Starting game-db-updater')

  mqttClient.subscribe('playnite/#')

  await fs.mkdir(options.assetSaveDirectoryPath, { recursive: true })

  mqttClient.on('message', async (topic, payload) => {
    try {
      debug(`Processing topic ${topic}`)
      await Promise.all(
        handlers(merge({}, options, { publisher })).map((handler) =>
          handler(topic, payload),
        ),
      )
    } catch (error) {
      debug(`Error processing topic ${topic}`)
      console.error(error)
    }
  })
}

export default run
export type { HandlerOptions, Options, PubSubChannels }
