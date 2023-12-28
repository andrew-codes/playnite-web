import createDebugger from 'debug'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'
import { getDbClient } from '../dbClient'

const debug = createDebugger('game-db-updater/handler/persistGameEntities')

const topicMatch = /^playnite\/.*\/entity\/(?<entityType>.*)\/(?<entityId>.*)$/

const handler: IHandlePublishedTopics = async (topic, payload) => {
  if (!topicMatch.test(topic)) {
    return
  }

  const match = topicMatch.exec(topic)
  if (!match?.groups) {
    return
  }

  const { entityType, entityId } = match.groups
  const entity = JSON.parse(payload.toString())
  debug(
    `Persisting game entity ${entityType} with id ${entityId} received: ${JSON.stringify(
      entity,
      null,
      2,
    )}`,
  )

  const collectionName = entityType[0].toLowerCase() + entityType.slice(1)

  const client = await getDbClient()
  client
    .db('games')
    .collection(collectionName)
    .updateOne({ id: entityId }, { $set: entity }, { upsert: true })
}

export default handler
