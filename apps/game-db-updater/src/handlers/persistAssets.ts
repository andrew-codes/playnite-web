import createDebugger from 'debug'
import fs from 'fs/promises'
import { Binary } from 'mongodb'
import path from 'path'
import type { Options } from '..'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'
import { getDbClient } from '../dbClient'

const debug = createDebugger(
  'playnite-web/game-db-updater/handler/persistAssets',
)

const topicMatch =
  /^playnite\/.*\/entity\/(?<entityType>[a-z0-9\-]+)\/(?<entityId>[a-z0-9\-]+)\/asset\/(?<assetId>.*)\/type\/(?<assetTypeKey>.*)$/

const create =
  (options: Options): IHandlePublishedTopics =>
  async (topic, payload) => {
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
      typeKey: assetTypeKey,
    }

    await fs.writeFile(
      path.join(options.assetSaveDirectoryPath, `${assetId}`),
      binaryFile.buffer,
      'binary',
    )

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

export default create
