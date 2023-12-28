import createDebugger from 'debug'
import { MongoClient } from 'mongodb'

let client: MongoClient
type DbConnectionOptions = {
  host?: string
  port?: number
  username?: string
  password?: string
}

const getDbClient = async (
  connectionOptions?: DbConnectionOptions,
): Promise<MongoClient> => {
  const debug = createDebugger('game-db-updater/mqttClient')

  if (!client) {
    const host = connectionOptions?.host ?? process.env.DB_HOST ?? 'localhost'
    const port =
      connectionOptions?.port ?? parseInt(process.env.DB_PORT ?? '27017')
    const username =
      connectionOptions?.username ?? process.env.DB_USERNAME ?? ''
    const password =
      connectionOptions?.password ?? process.env.DB_PASSWORD ?? ''

    debug(
      `Existing DB client not found; creating one with the following options: host=${host}, port=${port}, username=${username}`,
    )
    client = new MongoClient(`mongodb://${host}:${port}`, {
      auth: {
        username,
        password,
      },
    })
  }

  debug('Returning MQTT client')
  return client
}

export { getDbClient }
