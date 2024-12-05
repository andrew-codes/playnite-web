import createDebugger from 'debug'
import { merge, omit } from 'lodash-es'
import { HandlerOptions } from '..'
import {
  Entity,
  EntityType,
  TypeFromString,
} from '../../data/types.entities.js'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics.js'

const debug = createDebugger(
  'playnite-web/game-db-updater/handler/persistGameEntities',
)

const topicMatch =
  /^playnite\/.*\/entity\/(?<entityType>[A-Za-z\-]+)\/(?<entityId>[a-z0-9\-]+)$/

const handler =
  (options: HandlerOptions): IHandlePublishedTopics =>
  async (topic, payload) => {
    try {
      if (!topicMatch.test(topic)) {
        return
      }

      debug(
        `Received game entity for topic ${topic} with payload ${payload.toString()}`,
      )

      const match = topicMatch.exec(topic)
      if (!match?.groups) {
        return
      }

      const { entityType, entityId } = match.groups as {
        entityType: EntityType
        entityId: string
      }
      debug(
        `Persisting game entity ${entityType} with id ${entityId} for topic ${topic}`,
      )
      const entity = JSON.parse(payload.toString()) as Entity

      await options.updateQueryApi.executeUpdate<
        TypeFromString<typeof entityType>
      >(
        {
          entityType,
          type: 'ExactMatch',
          field: 'id',
          value: entityId,
        },
        omit(merge({}, entity, { _type: entityType }), 'processId', 'runState'),
      )
    } catch (e) {
      console.error(e)
    }
  }

export default handler
