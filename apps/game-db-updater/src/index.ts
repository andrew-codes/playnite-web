import { type AsyncMqttClient } from 'async-mqtt'
import createDebugger from 'debug'
import dotenv from 'dotenv'
import path from 'path'
import handlers from './handlers'
import { getMqttClient } from './mqttClient'

const run: () => Promise<AsyncMqttClient> = async () => {
    const debug = createDebugger('game-db-updater/index')
    debug('Starting game-db-updater')

    dotenv.config({ path: path.join(__dirname, '..', 'local.env') })

    const mqttClient = await getMqttClient()
    mqttClient.subscribe('playnite/#')

    mqttClient.on('message', async (topic, payload) => {
        try {
            await Promise.all(
                handlers.map((handler) => handler(topic, payload)),
            )
        } catch (error) {
            console.error(error)
        }
    })

    return mqttClient
}

if (require.main === module) {
    run()
}

export default run
