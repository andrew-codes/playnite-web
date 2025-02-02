import { AsyncMqttClient } from 'async-mqtt'
import createDebugger from 'debug'
import { upperCase } from 'lodash-es'

const debug = createDebugger('playnite-web/graphql/update')

interface UpdateEntity {
  (
    entityTypeName: string,
    entityId: string,
    fields: Record<string, any>,
  ): Promise<void>
}

const updater =
  (mqttClient: AsyncMqttClient): UpdateEntity =>
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
    Object.entries(fields).forEach(([key, value]) => {
      payloadData.fields[`${upperCase(key.at(0) ?? '')}${key.slice(1)}`] = value
    })

    debug('Publishing update request')
    debug(`Payload: ${JSON.stringify(payloadData)}`)

    await mqttClient.publish(
      `playnite/request/update`,
      JSON.stringify(payloadData),
    )
  }

export { updater }
export type { UpdateEntity }
