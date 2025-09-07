import asyncMqtt from 'async-mqtt'

let client: asyncMqtt.AsyncMqttClient | null = null

const getClient = async () => {
  if (!client) {
    client = await asyncMqtt.connectAsync(
      `tcp://${process.env.MQTT_HOST ?? 'localhost'}:${process.env.MQTT_PORT ?? 1883}`,
      {
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
      },
    )
  }

  return client
}

export { getClient }
