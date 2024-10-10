import createDebugger from 'debug'
import { MongoClient } from 'mongodb'

let client: MongoClient

type DbConnectionString = {
  url?: string
}

type DbConnectionOptions = {
  host?: string
  port?: number
  username?: string
  password?: string
}

const getDbClient = async (
  connectionOptions?: DbConnectionOptions | DbConnectionString,
): Promise<MongoClient> => {
  const debug = createDebugger('playnite-web/game-db-updater/dbClient')

  const options = connectionOptions ?? {}

  if (!client) {
    debug('Creating db client.')
    const url = 'url' in options ? options.url : process.env.DB_URL
    const host =
      'host' in options ? options.host : (process.env.DB_HOST ?? 'localhost')
    const port =
      'port' in options
        ? options.port
        : parseInt(process.env.DB_PORT ?? '27017')
    const username =
      'username' in options ? options.username : process.env.DB_USERNAME
    const password =
      'password' in options ? options.password : process.env.DB_PASSWORD

    if (url) {
      debug(
        `Existing DB client not found; creating one with the provided URL: ${url}`,
      )
      client = new MongoClient(url)
    } else {
      debug(
        `Existing DB client not found; creating one with the following options: host=${host}, port=${port}, username=${username}`,
      )
      if (!username && !password) {
        client = new MongoClient(`mongodb://${host}:${port}`)
      } else {
        client = new MongoClient(`mongodb://${host}:${port}`, {
          auth: {
            username,
            password,
          },
        })
      }
    }
    client = await client.connect()
  }

  debug('Returning mongoDB client')

  return client
}

export { getDbClient }
