import createDebugger from 'debug'
import { HandlerOptions } from '..'
import { UpdateFilterItem } from '../../data/types.api'
import {
  Entity,
  EntityType,
  StringFromType,
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
  async (messages) => {
    const updates = messages
      .filter(({ topic }) => topicMatch.test(topic))
      .map(({ topic, payload }) => {
        const matches = topicMatch.exec(topic)
        const entityType = matches?.groups?.entityType as EntityType
        const entityId = matches?.groups?.entityId

        if (!entityType || !entityId || !payload) {
          console.error(
            'Missing entityType, entityId or payload',
            entityType,
            entityId,
            JSON.stringify(payload, null, 2),
          )
          return null
        }

        return { entityType, entityId, payload }
      })
      .filter((item) => item !== null)

    const bulkUpdatesByEntityType = updates.reduce(
      (acc, { entityId, entityType, payload }) => {
        if (!acc[entityType]) {
          acc[entityType] = []
        }

        acc[entityType].push({
          filter: {
            entityType,
            type: 'ExactMatch',
            field: 'id',
            value: entityId,
          },
          entity: JSON.parse(payload.toString()) as Entity,
        })

        return acc
      },
      {} as Record<
        EntityType,
        Array<{
          filter: UpdateFilterItem<StringFromType<Entity>>
          entity: Entity
        }>
      >,
    )

    const bulkEntries = Object.entries(bulkUpdatesByEntityType)
    for (const [entityType, entities] of bulkEntries) {
      try {
        const et = entityType as EntityType
        await options.updateQueryApi.executeBulk<TypeFromString<typeof et>>(
          et,
          entities,
        )
      } catch (error) {
        console.error(error)
      }
    }

    await options.pubsub.publish(
      'playniteEntitiesUpdated',
      updates.map((update) => ({
        type: update.entityType,
        id: update.entityId,
      })),
    )
  }

export default handler
