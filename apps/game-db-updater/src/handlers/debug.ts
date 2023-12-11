import { debug } from 'console'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'

const handler: IHandlePublishedTopics = async (topic, payload) => {
    debug(`Received message on topic ${topic} with payload ${payload}`)
}

export default handler
