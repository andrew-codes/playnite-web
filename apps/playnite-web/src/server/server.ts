import createDebugger from 'debug'
import dotenv from 'dotenv'
import path from 'path'
import app from './app.js'
import { createConnectedMqttClient } from './mqtt.js'

const __dirname = import.meta.dirname
console.log(path.join(__dirname, '..', '..', 'local.env'))
dotenv.config({
  path: path.join(__dirname, '..', '..', 'local.env'),
  override: true,
})
dotenv.config({
  path: path.join(__dirname, '..', '..', 'overrides.env'),
  override: true,
})

const debug = createDebugger('playnite-web/app/server')

async function run() {
  debug('Starting Playnite Web applications...')

  const mqttClient = await createConnectedMqttClient()

  debug('Starting Playnite Web app...')
  await app(mqttClient)
}

run()
