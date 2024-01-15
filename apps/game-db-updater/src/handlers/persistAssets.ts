import createDebugger from 'debug'
import { Binary } from 'mongodb'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'
import { getDbClient } from '../dbClient'

const debug = createDebugger('game-db-updater/handler/persistAssets')

const topicMatch =
  /^playnite\/.*\/entity\/(?<entityType>[a-z0-9\-]+)\/(?<entityId>[a-z0-9\-]+)\/asset\/(?<assetId>.*)\/type\/(?<assetTypeKey>.*)$/

const handler: IHandlePublishedTopics = async (topic, payload) => {
  if (!topicMatch.test(topic)) {
    return
  }

  debug(`Received game entity asset for topic ${topic}`)

  const match = topicMatch.exec(topic)
  if (!match?.groups) {
    return
  }

  const { assetId, assetTypeKey, entityType, entityId } = match.groups
  debug(
    `Persisting game entity asset, ${assetTypeKey}, ${entityType} with id ${entityId} and with asset ID ${assetId}`,
  )
  const binaryFile = new Binary(payload)
  const relatedId = entityId
  const assetDoc = {
    id: assetId,
    relatedId,
    relatedType: entityType,
    file: binaryFile,
    typeKey: assetTypeKey,
  }

  const client = await getDbClient()
  client
    .db('games')
    .collection('assets')
    .updateOne(
      { relatedId, relatedType: entityType, typeKey: assetTypeKey },
      { $set: assetDoc },
      { upsert: true },
    )
}

export default handler
