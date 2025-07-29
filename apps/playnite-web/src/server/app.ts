import { createRequestHandler } from '@remix-run/express'
import compression from 'compression'
import createDebugger from 'debug'
import express from 'express'
import { useServer } from 'graphql-ws/use/ws'
import helmet from 'helmet'
import path from 'path'
import { WebSocketServer } from 'ws'
import { authenticateSocket } from './auth/socketAuthorization.js'
import { prisma } from './data/providers/postgres/client.js'
import createYoga from './graphql/index.js'
import schema from './graphql/schema.js'
import { subscriptionPublisher } from './graphql/subscriptionPublisher.js'

const debug = createDebugger('playnite-web/app/server')

const __dirname = import.meta.dirname

async function run() {
  const { PORT, HOST } = process.env
  const port = PORT ? parseInt(PORT, 10) : 3000
  const domain = HOST ?? 'localhost'

  const { SECRET } = process.env
  if (!SECRET) {
    throw new Error(
      'SECRET environment variable is required for authentication.',
    )
  }

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
    viteDevServer
      ? viteDevServer.middlewares
      : express.static(path.join(__dirname, '..', 'client')),
  )

  const signingKey = process.env.SECRET ?? 'secret'
  const yoga = createYoga('/api', signingKey)

  if (process.env.TEST !== 'e2e' && process.env.DISABLE_CSP !== 'true') {
    const cspOrigins = (process.env.CSP_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin !== '')
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            'default-src': ["'self'", `${domain}:*`],
            'connect-src': [
              "'self'",
              `ws://${domain}:*`,
              `wss://${domain}:*`,
              `http://${domain}:*`,
              `https://${domain}:*`,
            ].concat(cspOrigins),
            'style-src': [
              "'self'",
              "'unsafe-inline'",
              'unpkg.com',
              '*.googleapis.com',
              '*.gstatic.com',
            ].concat(cspOrigins),
            'script-src': [
              "'self'",
              `${domain}:${port}`,
              `${domain}:*`,
              "'unsafe-inline'",
              'unpkg.com',
            ].concat(cspOrigins),
            'img-src': [
              "'self'",
              `${domain}:*`,
              `${domain}:${port}`,
              'raw.githubusercontent.com',
            ].concat(cspOrigins),
            'font-src': [
              "'self'",
              `${domain}:*`,
              `${domain}:${port}`,
              '*.googleapis.com',
              '*.gstatic.com',
            ].concat(cspOrigins),
            'frame-ancestors': ["'self'"].concat(cspOrigins),
          },
        },
      }),
    )
  }
  app.use(
    express.static(path.join(__dirname, '..', 'public', 'assets'), {
      maxAge: '1y',
    }),
  )

  app.use('/api', yoga)

  if (global.__coverage__) {
    app.get('/__coverage__', (req, resp) => {
      resp.json({ coverage: global.__coverage__ })
    })
  }

  const build = viteDevServer
    ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
    : await import(path.join(__dirname, 'index.js'))

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
          subscriptionPublisher,
          db: prisma,
        }),
      },
      wsServer,
    )

    const libraryConnectionSocket = new WebSocketServer({
      server,
      path: '/api/library',
    })

    libraryConnectionSocket.on(
      'connection',
      authenticateSocket((ws, req) => {
        // Handle authenticated connection
        ws.send('Authenticated!')
      }),
    )

    libraryConnectionSocket.on('message', (message) => {
      debug(`Library connection message: ${message}`)
    })
  })
}

export default run
