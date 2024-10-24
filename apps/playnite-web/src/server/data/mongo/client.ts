import createDebugger from 'debug'
import { MongoClient } from 'mongodb'

const debug = createDebugger('playnite-web/graphql/mongo')

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

let client: MongoClient
const getDbClient = async (
  connectionOptions?: DbConnectionOptions | DbConnectionString,
): Promise<MongoClient> => {
  if (!client) {
    const url = computeUrl(connectionOptions)
    const username = connectionOptions?.username ?? process.env.DB_USERNAME
    const password = connectionOptions?.password ?? process.env.DB_PASSWORD

    debug(
      `Existing DB client not found; creating one with the provided URL: ${url}`,
    )
    if (!username && !password) {
      debug(`No username or password provided; connecting without auth`)
      client = new MongoClient(url, { enableUtf8Validation: false })
    } else {
      client = new MongoClient(url, {
        auth: {
          username,
          password,
        },
        enableUtf8Validation: false,
      })
    }
    debug('Connecting database client.')
    client = await client.connect()
  }

  return client
}

export { getDbClient }
