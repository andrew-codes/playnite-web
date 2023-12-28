import { connectAsync, type AsyncMqttClient } from 'async-mqtt'
import createDebugger from 'debug'

let mqttClient: AsyncMqttClient

type MqttConnectionOptions = {
  host?: string
  port?: number
  username?: string
  password?: string
}

const getMqttClient = async (
  connectionOptions?: MqttConnectionOptions,
): Promise<AsyncMqttClient> => {
  const debug = createDebugger('game-db-updater/mqttClient')

  if (!mqttClient) {
    const host = connectionOptions?.host ?? process.env.MQTT_HOST ?? 'localhost'
    const port =
      connectionOptions?.port ?? parseInt(process.env.MQTT_PORT ?? '1883', 10)
    const username =
      connectionOptions?.username ?? process.env.MQTT_USERNAME ?? ''
    const password =
      connectionOptions?.password ?? process.env.MQTT_PASSWORD ?? ''

    debug(
      `Existing MQTT client not found; creating one with the following options: host=${host}, port=${port}, username=${username}`,
    )
    mqttClient = await connectAsync(`tcp://${host}`, {
      password,
      port,
      username,
    })
  }

  debug('Returning MQTT client')

  return mqttClient
}

export { getMqttClient }
