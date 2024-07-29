import createDebugger from 'debug'
import path from 'path'
import sharp from 'sharp'
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
    const filename = `${path.basename(assetId, path.extname(assetId))}.webp`
    const image = sharp(payload)
    const metadata = await image.metadata()
    if (metadata.width && metadata.width > 320) {
      await image
        .resize(320, 320)
        .webp({ lossless: true })
        .toFile(path.join(options.assetSaveDirectoryPath, `${filename}`))
    }

    debug(
      `Persisting game entity asset, ${assetTypeKey}, ${entityType} with id ${entityId} and with asset ID ${filename}`,
    )
    const relatedId = entityId
    const assetDoc = {
      id: filename,
      relatedId,
      relatedType: entityType,
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

export default create
