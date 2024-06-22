import createDebugger from 'debug'
import { MongoClient } from 'mongodb'

let client: MongoClient

type DbConnectionString = {
  url: string
  username?: string
  password?: string
}

type DbConnectionOptions = {
  host: string
  port: number
  username?: string
  password?: string
}

const computeUrl = (
  connectionOptions?: DbConnectionOptions | DbConnectionString,
): string => {
  if (!connectionOptions) {
    return `mongodb://${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? '27017'}`
  }
  if ('url' in connectionOptions) {
    return connectionOptions.url
  }

  const host = connectionOptions.host
  const port = connectionOptions.port

  return `mongodb://$${host}:${port}`
}

const getDbClient = (
  connectionOptions?: DbConnectionOptions | DbConnectionString,
): MongoClient => {
  const debug = createDebugger('playnite-web/app/MongoDbClient')

  if (!client) {
    const url = computeUrl(connectionOptions)
    const username = connectionOptions?.username ?? process.env.DB_USERNAME
    const password = connectionOptions?.password ?? process.env.DB_PASSWORD

    debug(`Existing DB client not found; creating one with the provided URL`)
    if (!username && !password) {
      debug(`No username or password provided; connecting without auth`)
      client = new MongoClient(url)
    } else {
      client = new MongoClient(url, {
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
