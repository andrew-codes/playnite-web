import { createRequestHandler } from '@remix-run/express'
import compression from 'compression'
import createDebugger from 'debug'
import express from 'express'
import { useServer } from 'graphql-ws/lib/use/ws'
import helmet from 'helmet'
import { AsyncMqttClient } from 'mqtt-client'
import { WebSocketServer } from 'ws'
import createYoga from './src/server/graphql'
import { Domain } from './src/server/graphql/Domain'
import schema from './src/server/graphql/schema'
import { subscriptionPublisher } from './src/server/graphql/subscriptionPublisher'

const debug = createDebugger('playnite-web/app/server')

async function run(mqttClient: AsyncMqttClient) {
  const { PORT, HOST } = process.env
  const port = PORT ? parseInt(PORT, 10) : 3000
  const domain = HOST ?? 'localhost'

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

  const build = viteDevServer
    ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
    : await import('./build/server/index')

  const remixHandler = createRequestHandler({ build })
  app.all('*', (req, resp, next) => {
    if (!req.path.startsWith('/api')) {
      remixHandler(req, resp, next)
    }
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
          api: new Domain(),
          mqttClient,
          subscriptionPublisher,
        }),
      },
      wsServer,
    )
  })
}

export default run
