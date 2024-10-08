import createDebugger from 'debug'
import path from 'path'
import { HandlerOptions } from '..'
import { GameAsset } from '../../data/types.entities'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'

const debug = createDebugger(
  'playnite-web/game-db-updater/handler/persistAssets',
)

const topicMatch =
  /^playnite\/.*\/entity\/(?<entityType>[A-Za-z\-]+)\/(?<entityId>[a-z0-9\-]+)\/GameAsset\/(?<assetId>.*)\/type\/(?<assetTypeKey>.*)$/

const create =
  (options: HandlerOptions): IHandlePublishedTopics =>
  async (topic, payload) => {
    try {
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
      const { default: sharp } = await import('sharp')

      const image = sharp(payload)
      if (assetTypeKey === 'cover') {
        const metadata = await image.metadata()
        if (metadata.width && metadata.width > 256) {
          await image
            .resize(256, 256)
            .webp()
            .toFile(path.join(options.assetSaveDirectoryPath, `${filename}`))
        }
      } else {
        await image
          .webp()
          .toFile(path.join(options.assetSaveDirectoryPath, `${filename}`))
      }

      debug(
        `Persisting game entity asset, ${assetTypeKey}, ${entityType} with id ${entityId}. Original filename: ${path.basename(assetId)}. New asset ID ${filename}`,
      )
      const relatedId = entityId
      const assetDoc = {
        _type: 'GameAsset',
        id: filename,
        relatedId,
        relatedType: entityType,
        typeKey: assetTypeKey,
      } as unknown as GameAsset

      await options.updateQueryApi.executeUpdate(
        {
          type: 'ExactMatch',
          entityType: 'GameAsset',
          field: 'id',
          value: filename,
        },
        assetDoc,
      )
    } catch (error) {
      debug(`Error processing topic ${topic}`)
      console.error(error)
    }
  }

export default create
