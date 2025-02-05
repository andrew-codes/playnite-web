import createDebugger from 'debug'
import { groupBy } from 'lodash-es'
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
  /^playnite\/(?<deviceId>[A-Za-z\-0-9]+)\/update\/(?<entityType>[A-Za-z\-]+)\/(?<entityId>[a-z0-9\-]+)$/

const handler =
  (options: HandlerOptions): IHandlePublishedTopics =>
  async (messages) => {
    const parsedMessages = messages
      .filter(({ topic }) => topicMatch.test(topic))
      .map(({ topic, payload }) => {
        const matches = topicMatch.exec(topic)
        if (!matches?.groups) {
          return
        }

        const { deviceId, entityType, entityId } = matches.groups

        if (!entityType || !entityId || !deviceId || !payload) {
          console.error(
            'Missing entityType, entityId, deviceId, or payload',
            entityType,
            entityId,
            JSON.stringify(payload, null, 2),
          )
          return
        }

        const { action, entity } = JSON.parse(payload.toString())
        if (!action || !entity) {
          debug('Missing action or entity', action, entity)
        }

        return {
          entityType: entityType as EntityType,
          entityId,
          action,
          entity: entity as Entity,
        }
      })
      .filter((item) => !!item)

    const parsedMessageByAction = groupBy<{
      action: any
      entityId: string
      entityType: EntityType
      entity: Entity
    }>(parsedMessages, 'action')

    const updates = parsedMessageByAction.update || []
    const bulkUpdatesByEntityType = updates.reduce(
      (acc, { entityId, entityType, entity }) => {
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
          entity: entity as Entity,
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

    const bulkUpdates = Object.entries(bulkUpdatesByEntityType)
    for (const [entityType, entities] of bulkUpdates) {
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

    const deletions = parsedMessageByAction.delete || []
    for (const { entityId, entityType } of deletions) {
      try {
        await options.deleteQueryApi.executeDelete({
          entityType,
          field: 'id',
          type: 'ExactMatch',
          value: entityId,
        })
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
