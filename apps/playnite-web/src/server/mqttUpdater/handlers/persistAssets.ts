import createDebugger from 'debug'
import { isEmpty } from 'lodash-es'
import path from 'path'
import { HandlerOptions } from '..'
import { UpdateFilterItem } from '../../data/types.api'
import {
  Entity,
  GameAsset,
  GameAssetRelatedType,
  GameAssetType,
  StringFromType,
} from '../../data/types.entities.js'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics.js'

const debug = createDebugger(
  'playnite-web/game-db-updater/handler/persistAssets',
)

const topicMatch =
  /^playnite\/.*\/entity\/(?<entityType>[A-Za-z\-]+)\/(?<entityId>[a-z0-9\-]+)\/GameAsset\/(?<assetId>.*)\/type\/(?<assetTypeKey>.*)$/

const create =
  (options: HandlerOptions): IHandlePublishedTopics =>
  async (messages) => {
    const messagesToHandle = messages.filter(({ topic }) =>
      topicMatch.test(topic),
    )
    if (isEmpty(messagesToHandle)) {
      return
    }

    for (const { topic, payload } of messagesToHandle) {
      try {
        debug(`Received game entity asset for topic ${topic}`)

        const match = topicMatch.exec(topic)
        if (!match?.groups) {
          break
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
      } catch (error) {
        debug(`Error processing topic ${topic}`)
        console.error(error)
      }
    }

    const entities = messagesToHandle
      .map(({ topic }) => {
        const match = topicMatch.exec(topic)
        if (!match?.groups) {
          console.error('Invalid topic:', topic)
          return null
        }
        const { assetId, assetTypeKey, entityType, entityId } = match.groups
        const filename = `${path.basename(assetId, path.extname(assetId))}.webp`

        return {
          filter: {
            type: 'ExactMatch',
            entityType: 'GameAsset' as StringFromType<Entity>,
            field: 'id',
            value: filename,
          } as UpdateFilterItem<StringFromType<Entity>>,
          entity: {
            _type: 'GameAsset',
            id: filename,
            relatedId: entityId,
            relatedType: entityType as unknown as GameAssetRelatedType,
            typeKey: assetTypeKey as unknown as GameAssetType,
          } as GameAsset,
        }
      })
      .filter((e) => e !== null)

    await options.updateQueryApi.executeBulk('GameAsset', entities)
  }

export default create
export { topicMatch }
