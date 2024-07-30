import createDebugger from 'debug'
import dotenv from 'dotenv'
import { createConnectedMqttClient } from 'mqtt-client'
import path from 'path'
import app from './app'

dotenv.config({
  path: path.join(process.cwd(), 'local.env'),
  override: true,
})
dotenv.config({
  path: path.join(process.cwd(), 'overrides.env'),
  override: true,
})

const debug = createDebugger('playnite-web/app/server')

async function run() {
  debug('Starting Playnite Web applications...')

  const mqttClient = await createConnectedMqttClient()

  debug('Starting Playnite Web app...')
  app(mqttClient)
}

run()
