import { AsyncMqttClient } from 'async-mqtt'
import createDebugger from 'debug'
import { first, upperCase } from 'lodash-es'
import { v4 } from 'uuid'
import { IDeleteQuery, IQuery, IUpdateQuery } from './data/types.api'
import { Connection, Release, UpdateRequest } from './data/types.entities'

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
  (
    mqttClient: AsyncMqttClient,
    query: IQuery,
    updateQuery: IUpdateQuery,
    deleteQuery: IDeleteQuery,
  ): UpdateEntity =>
  async ({ entityType, entityId, fields, id }) => {
    const payloadData = {
      entityTypeName: entityType,
      entityId,
      fields: {} as Record<string, any>,
    }

    const entries = Object.entries(fields)
    for (let entry of entries) {
      const key = entry[0]
      const value: any = entry[1]

      if (Array.isArray(value.added) && Array.isArray(value.removed)) {
        const entity = await query.execute<Release>({
          type: 'ExactMatch',
          entityType: 'Release',
          field: 'id',
          value: entityId,
        })
        const existingValues = first(entity)?.[key] as string[]
        const newValues = existingValues
          .concat(value.added)
          .filter((item) => value.removed.includes(item))
        payloadData.fields[`${upperCase(key.at(0) ?? '')}${key.slice(1)}`] =
          newValues
      } else {
        payloadData.fields[`${upperCase(key.at(0) ?? '')}${key.slice(1)}`] =
          value
      }
    }

    const connections = await query.execute<Connection>({
      type: 'MatchAll',
      entityType: 'Connection',
    })
    const connection = first(connections)
    if (connection?.state) {
      debug('Publishing update request')
      debug(`Payload: ${JSON.stringify(payloadData)}`)

      await mqttClient.publish(
        `playnite/request/update`,
        JSON.stringify(payloadData),
      )

      if (id) {
        await deleteQuery.executeDelete({
          type: 'ExactMatch',
          entityType: 'UpdateRequest',
          field: 'id',
          value: id,
        })
      }
    } else {
      if (!id) {
        debug('Persisting update request')
        debug(`Payload: ${JSON.stringify(payloadData)}`)

        const requestId = id ?? v4()
        await updateQuery.executeUpdate<UpdateRequest>(
          {
            type: 'ExactMatch',
            entityType: 'UpdateRequest',
            field: 'id',
            value: requestId,
          },
          {
            id: requestId,
            entityType: entityType,
            entityId,
            fields: payloadData.fields,
            timestamp: Date.now(),
          },
        )
      }
    }
  }

export { updater }
export type { UpdateEntity }
