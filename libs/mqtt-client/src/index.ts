import { connectAsync, type AsyncMqttClient } from 'async-mqtt'
import createDebugger from 'debug'

type MqttConnectionOptions = {
  host?: string
  port?: number
  username?: string
  password?: string
}

const createConnectedMqttClient = async (
  connectionOptions?: MqttConnectionOptions,
): Promise<AsyncMqttClient> => {
  const debug = createDebugger('playnite-web/mqtt-client')

  const host = connectionOptions?.host ?? process.env.MQTT_HOST ?? 'localhost'
  const port =
    connectionOptions?.port ?? parseInt(process.env.MQTT_PORT ?? '1883', 10)
  const username =
    connectionOptions?.username ?? process.env.MQTT_USERNAME ?? ''
  const password =
    connectionOptions?.password ?? process.env.MQTT_PASSWORD ?? null

  if (!password) {
    debug(
      `Creating mqtt client without username/password with the following options: host=${host}, port=${port}`,
    )
    return connectAsync(`tcp://${host}`, {
      port,
    })
  } else {
    debug(
      `Creating mqtt client with the following options: host=${host}, port=${port}, username=${username}`,
    )
    return connectAsync(`tcp://${host}`, {
      password,
      port,
      username,
    })
  }
}

export { createConnectedMqttClient }
export type { AsyncMqttClient }
