import createDebugger from 'debug'
import { HandlerOptions } from '..'
import { EntityType } from '../../data/types.entities'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'

const debug = createDebugger(
  'playnite-web/game-db-updater/handler/persistGameEntities',
)

const topicMatch =
  /^playnite\/.*\/entity\/(?<entityType>[A-Za-z\-]+)\/(?<entityId>[a-z0-9\-]+)\/removed$/

const handler =
  (options: HandlerOptions): IHandlePublishedTopics =>
  async (topic, payload) => {
    try {
      if (!topicMatch.test(topic)) {
        return
      }

      debug(`Received game entity removal for topic ${topic}`)

      const match = topicMatch.exec(topic)
      if (!match?.groups) {
        return
      }

      const { entityType, entityId } = match.groups as {
        entityType: EntityType
        entityId: string
      }
      debug(
        `Persisting game entity ${entityType} removal with id ${entityId} for topic ${topic}`,
      )
      await options.deleteQueryApi.executeDelete({
        entityType,
        field: 'id',
        type: 'ExactMatch',
        value: entityId,
      })
    } catch (e) {
      console.error(e)
    }
  }

export default handler
