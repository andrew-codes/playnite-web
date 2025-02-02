import { AsyncMqttClient } from 'async-mqtt'
import createDebugger from 'debug'
import { first, upperCase } from 'lodash-es'
import { IQuery } from '../data/types.api'
import { Release } from '../data/types.entities'

const debug = createDebugger('playnite-web/graphql/update')

interface UpdateEntity {
  (
    entityTypeName: string,
    entityId: string,
    fields: Record<string, any>,
  ): Promise<void>
}

const updater =
  (mqttClient: AsyncMqttClient, query: IQuery): UpdateEntity =>
  async (
    entityTypeName: string,
    entityId: string,
    fields: Record<string, any>,
  ) => {
    const payloadData = {
      entityTypeName,
      entityId,
      fields: {} as Record<string, any>,
    }

    for (let entry in Object.entries(fields)) {
      const key = entry[0]
      const value: any = entry[1]

      if ('added' in value && 'removed' in value) {
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

    debug('Publishing update request')
    debug(`Payload: ${JSON.stringify(payloadData)}`)

    await mqttClient.publish(
      `playnite/request/update`,
      JSON.stringify(payloadData),
    )
  }

export { updater }
export type { UpdateEntity }
