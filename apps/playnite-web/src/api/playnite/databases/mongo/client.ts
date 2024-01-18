import createDebugger from 'debug'
import { MongoClient } from 'mongodb'

let client: MongoClient
type DbConnectionOptions = {
  host?: string
  port?: number
  username?: string
  password?: string
}

const getDbClient = (connectionOptions?: DbConnectionOptions): MongoClient => {
  const debug = createDebugger('playnite-web-app/MongoDbClient')

  if (!client) {
    const host = connectionOptions?.host ?? process.env.DB_HOST ?? 'localhost'
    const port =
      connectionOptions?.port ?? parseInt(process.env.DB_PORT ?? '27017')
    const username = connectionOptions?.username ?? process.env.DB_USERNAME
    const password = connectionOptions?.password ?? process.env.DB_PASSWORD

    debug(
      `Existing DB client not found; creating one with the following options: host=${host}, port=${port}, username=${username}`,
    )

    if (!username && !password) {
      debug(`No username or password provided; connecting without auth`)
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

  return client
}

export { getDbClient }
