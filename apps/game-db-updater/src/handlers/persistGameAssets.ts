import createDebugger from 'debug'
import { Binary } from 'mongodb'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'
import { getDbClient } from '../dbClient'

const debug = createDebugger('game-db-updater/handler/persistGameEntities')

const topicMatch =
  /^playnite\/.*\/entity\/(?<entityType>[a-z0-9\-]+)\/(?<entityId>[a-z0-9\-]+)\/asset\/(?<assetId>.*)$/

const handler: IHandlePublishedTopics = async (topic, payload) => {
  if (!topicMatch.test(topic)) {
    return
  }

  const match = topicMatch.exec(topic)
  if (!match?.groups) {
    return
  }

  const { assetId, entityType, entityId } = match.groups
  debug(
    `Persisting game entity asset ${entityType} with id ${entityId} and with asset ID ${assetId}`,
  )
  const binaryFile = new Binary(payload)
  const relatedId = entityId
  const assetDoc = {
    relatedId,
    relatedType: entityType,
    file: binaryFile,
  }

  const client = await getDbClient()
  client
    .db('games')
    .collection('assets')
    .updateOne({ id: assetId }, { $set: assetDoc }, { upsert: true })
}

export default handler
