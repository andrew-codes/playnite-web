import type { AsyncMqttClient } from 'async-mqtt'
import mqtt from 'async-mqtt'
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
    connectionOptions?.password ?? process.env.MQTT_PASSWORD ?? ''

  debug(
    `Existing MQTT client not found; creating one with the following options: host=${host}, port=${port}, username=${username}`,
  )
  let mqttClient
  if (username && password) {
    mqttClient = await mqtt.connectAsync(`tcp://${host}`, {
      password,
      port,
      username,
    })
  } else {
    mqttClient = await mqtt.connectAsync(`tcp://${host}`, {
      port,
    })
  }
  debug('MQTT client connected')

  return mqttClient
}

export { createConnectedMqttClient }
