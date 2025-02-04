import { AsyncMqttClient } from 'async-mqtt'
import createDebugger from 'debug'
import { first } from 'lodash-es'
import { IQuery } from './data/types.api'
import { Connection, entities } from './data/types.entities'
import { tryParseOid } from './oid.js'

const debug = createDebugger('playnite-web/graphql/update')

type UpdateInput = {
  id?: string
  entityType: string
  entityId: string
  fields: Record<string, any>
}

interface UpdateEntity {
  (updateInput: UpdateInput): Promise<void>
}

const updater =
  (mqttClient: AsyncMqttClient, query: IQuery): UpdateEntity =>
  async ({ entityType, entityId, fields }) => {
    const et = entities.find((name) => name === entityType)
    if (!et) {
      debug(`Entity type ${entityType} not found; cannot update.`)
      return
    }

    const existingData = first(
      await query.execute({
        type: 'ExactMatch',
        entityType: et,
        field: 'id',
        value: entityId,
      }),
    )
    if (!existingData) {
      debug(`Entity ${entityId} not found; cannot update.`)
      return
    }

    const updatedEntity = {
      id: entityId,
    }

    const fieldEntries = Object.entries(fields)
    for (let field of fieldEntries) {
      const fieldName = field[0]
      const fieldValue: any = field[1]

      if (
        Array.isArray(fieldValue.added) &&
        Array.isArray(fieldValue.removed)
      ) {
        const removed = fieldValue.removed
          .map((item) => tryParseOid(item)?.id)
          .filter((item) => !!item)
        const added = fieldValue.added
          .map((item) => tryParseOid(item)?.id)
          .filter((item) => !!item)
        const newValues = existingData[fieldName]
          .concat(added)
          .filter((item) => !removed.includes(item))

        updatedEntity[fieldName] = newValues
      } else {
        updatedEntity[fieldName] = tryParseOid(fieldValue)?.id ?? fieldValue
      }
    }

    const connections = await query.execute<Connection>({
      type: 'MatchAll',
      entityType: 'Connection',
    })
    const connection = first(connections)
    if (connection?.id) {
      const payloadData = {
        action: 'update',
        entity: updatedEntity,
      }
      debug('Publishing entity update')
      debug(`Payload: ${JSON.stringify(payloadData)}`)

      await mqttClient.publish(
        `playnite/playnite-web/${et}/${entityId}`,
        JSON.stringify(payloadData),
        { qos: 2, retain: true },
      )
    }
  }

export { updater }
export type { UpdateEntity }
