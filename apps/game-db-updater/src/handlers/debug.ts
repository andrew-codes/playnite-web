import createDebugger from 'debug'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'

const debug = createDebugger('game-db-updater/handler/debug')

const excludeTopicMatch =
  /^playnite\/.*\/entity\/(?<entityType>.*)\/(?<entityId>.*)\/asset\/(?<assetId>.*)$/

const handler: IHandlePublishedTopics = async (topic, payload) => {
  if (excludeTopicMatch.test(topic)) {
    return
  }

  debug(`Received message on topic ${topic} with payload ${payload}`)
}

export default handler
