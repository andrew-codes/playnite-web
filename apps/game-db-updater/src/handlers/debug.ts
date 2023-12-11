import createDebugger from 'debug'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'

const debug = createDebugger('game-db-updater/handler/debug')

const handler: IHandlePublishedTopics = async (topic, payload) => {
    debug(
        `Received message on topic ${topic} with payload ${payload.toString()}`,
    )
}

export default handler
