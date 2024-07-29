import createDebugger from 'debug'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'
import { getDbClient } from '../dbClient'

const debug = createDebugger(
  'playnite-web/game-db-updater/handler/persistGameEntities',
)

const topicMatch =
  /^playnite\/.*\/entity\/(?<entityType>[a-z0-9\-]+)\/(?<entityId>[a-z0-9\-]+)\/removed$/

const handler: IHandlePublishedTopics = async (topic, payload) => {
  if (!topicMatch.test(topic)) {
    return
  }

  debug(`Received game entity removal for topic ${topic}`)

  const match = topicMatch.exec(topic)
  if (!match?.groups) {
    return
  }

  const { entityType, entityId } = match.groups
  debug(
    `Persisting game entity ${entityType} removal with id ${entityId} for topic ${topic}`,
  )
  const collectionName = entityType[0].toLowerCase() + entityType.slice(1)

  const client = await getDbClient()
  client.db('games').collection(collectionName).deleteOne({ id: entityId })
}

export default handler
