import { Express } from 'express'
import { AsyncMqttClient } from 'mqtt-client'
import graphql from './graphql'

const server =
  (route: string, secret: string, mqttClient: AsyncMqttClient) =>
  (app: Express): Express => {
    app.all(route, graphql(secret, route, mqttClient))

    return app
  }

export default server
