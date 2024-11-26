import { createRequestHandler } from '@remix-run/express'
import compression from 'compression'
import createDebugger from 'debug'
import express from 'express'
import { useServer } from 'graphql-ws/lib/use/ws'
import helmet from 'helmet'
import { AsyncMqttClient } from 'mqtt-client'
import path from 'path'
import { WebSocketServer } from 'ws'
import EntityConditionalDataApi from './src/server/data/entityConditional/DataApi'
import InMemoryDataApi from './src/server/data/inMemory/DataApi'
import { getDbClient } from './src/server/data/mongo/client'
import MongoDataApi from './src/server/data/mongo/DataApi'
import PriorityDataApi from './src/server/data/priority/DataApi'
import createYoga from './src/server/graphql/index'
import schema from './src/server/graphql/schema'
import { subscriptionPublisher } from './src/server/graphql/subscriptionPublisher'
import mqttUpdater from './src/server/mqttUpdater/index'

const debug = createDebugger('playnite-web/app/server')

async function run(mqttClient: AsyncMqttClient) {
  const { PORT, HOST } = process.env
  const port = PORT ? parseInt(PORT, 10) : 3000
  const domain = HOST ?? 'localhost'

  debug('Starting Playnite Web game-db-updater...')

  const db = (await getDbClient()).db('games')
  const mongoApi = new MongoDataApi(db)
  const inMemoryApi = new InMemoryDataApi()
  const userInMemory = new EntityConditionalDataApi(
    new Set(['User']),
    inMemoryApi,
    inMemoryApi,
  )
  const dataApi = new PriorityDataApi(
    new Set([userInMemory, mongoApi]),
    new Set([userInMemory, mongoApi]),
    new Set([mongoApi]),
  )

  const { USERNAME, PASSWORD } = process.env
  if (USERNAME && PASSWORD) {
    await dataApi.executeUpdate(
      { type: 'ExactMatch', entityType: 'User', field: 'id', value: '1' },
      {
        _type: 'User',
        id: '1',
        password: PASSWORD,
        username: USERNAME,
      },
    )
  }

  await mqttUpdater({
    assetSaveDirectoryPath: path.join(
      process.cwd(),
      'public/assets/asset-by-id',
    ),
    mqtt: mqttClient,
    pubsub: subscriptionPublisher,
    queryApi: dataApi,
    updateQueryApi: dataApi,
    deleteQueryApi: mongoApi,
  })

  let app = express()

  const viteDevServer =
    process.env.NODE_ENV === 'production'
      ? null
      : await import('vite').then((vite) =>
          vite.createServer({
            server: { middlewareMode: true },
          }),
        )
  app.use(
    viteDevServer ? viteDevServer.middlewares : express.static('build/client'),
  )

  const signingKey = process.env.SECRET ?? 'secret'
  const yoga = createYoga('/api', signingKey, mqttClient)

  const cspOrigins = (process.env.CSP_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'default-src': ["'self'"],
          'connect-src': [
            "'self'",
            `ws://${domain}:*`,
            `wss://${domain}:*`,
            `http://${domain}:*`,
            `https://${domain}:*`,
          ],
          'style-src': [
            "'self'",
            "'unsafe-inline'",
            'unpkg.com',
            '*.googleapis.com',
            '*.gstatic.com',
          ].concat(cspOrigins),
          'script-src': ["'self'", "'unsafe-inline'", 'unpkg.com'].concat(
            cspOrigins,
          ),
          'img-src': ["'self'", 'raw.githubusercontent.com'].concat(cspOrigins),
          'font-src': ["'self'", '*.googleapis.com', '*.gstatic.com'].concat(
            cspOrigins,
          ),
        },
      },
    }),
  )
  app.use(express.static('./public/assets', { maxAge: '1y' }))

  app.use('/api', yoga)

  if (global.__coverage__) {
    const codeCoverageMiddleware = await import(
      '@bahmutov/cypress-code-coverage/middleware/express'
    )
    codeCoverageMiddleware.default(app)
  }

  const build = viteDevServer
    ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
    : await import('./build/server/index')

  const remixHandler = createRequestHandler({ build })
  app.all('*', (req, resp, next) => {
    if (req.path.startsWith('/__coverage__')) {
      next()
      return
    }

    if (req.path.startsWith('/api')) {
      next()
      return
    }

    remixHandler(req, resp, next)
  })

  app.use(compression())

  const server = app.listen(port, () => {
    debug(`App listening on http://${domain}:${port}`)

    const wsServer = new WebSocketServer({ server, path: '/api' })
    useServer(
      {
        schema,
        context: (req) => ({
          ...req,
          signingKey,
          domain,
          queryApi: dataApi,
          updateQueryApi: dataApi,
          mqttClient,
          subscriptionPublisher,
        }),
      },
      wsServer,
    )
  })
}

export default run
