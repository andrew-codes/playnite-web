/* eslint-disable react-hooks/rules-of-hooks */
import compression from 'compression'
import { migrate } from 'db-client/migrate'
import express from 'express'
import { useServer } from 'graphql-ws/use/ws'
import helmet from 'helmet'
import { createServer } from 'http'
import next from 'next'
import { NextServerOptions } from 'next/dist/server/next'
import { parse } from 'url'
import { WebSocketServer } from 'ws'
import prisma from './server/data/providers/postgres/client'
import { createDataLoaders } from './server/graphql/dataloaders'
import createYoga from './server/graphql/index'
import schema from './server/graphql/schema'
import { subscriptionPublisher } from './server/graphql/subscriptionPublisher'
import logger from './server/logger'
import { setupApp } from './server/setupApp'

const dev = process.env.NODE_ENV !== 'production'
const domain = process.env.HOST || 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)
const secret = process.env.SECRET

if (!secret) {
  throw new Error('SECRET environment variable is required for authentication.')
}

const graphqlEndpoint = '/api'
const yoga = createYoga(graphqlEndpoint, secret)

const nextServerOptions: NextServerOptions = { dev, hostname: domain, port }
if (!dev) {
  nextServerOptions.dir = '.'
}

async function run() {
  await migrate()
  await setupApp()

  try {
    const nextApp = next(nextServerOptions)
    await nextApp.prepare()
    const handle = nextApp.getRequestHandler()

    // create express app
    const app = express()

    // Serve game assets from dedicated directory
    const coverArtPath = process.env.COVER_ART_PATH || './game-assets'
    app.use(
      '/cover-art',
      express.static(coverArtPath, {
        maxAge: '1y',
        immutable: true,
      }),
    )

    app.use(compression())
    app.use(express.json({ limit: '50mb' }))
    app.use(express.urlencoded({ extended: true, limit: '50mb' }))
    app.use(express.text({ limit: '50mb' }))
    app.use(express.raw({ limit: '50mb' }))

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
                "'unsafe-eval'",
                'unpkg.com',
              ].concat(cspOrigins),
              'img-src': [
                "'self'",
                `${domain}:*`,
                `${domain}:${port}`,
                'raw.githubusercontent.com',
                'data:',
                'blob:',
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

    if (global.__coverage__) {
      app.get('/__coverage__', (req, resp) => {
        resp.json({ coverage: global.__coverage__ })
      })
    }
    if (process.env.TEST === 'e2e') {
      let requestBodies: Array<any> = []
      app.post('/echo', (req, resp) => {
        const body = req.body
        requestBodies.push(body)
        resp.send(body)
      })
      app.get('/echo', (req, resp) => {
        const body = requestBodies.pop()
        resp.send(body)
      })
      app.delete('/echo', (req, resp) => {
        requestBodies = []
        resp.sendStatus(204)
      })
    }

    app.all('*', async (req, resp, next) => {
      try {
        if (!req.url) {
          resp.writeHead(404).end()
          return
        }

        const url = parse(req.url, true)
        if (!url.pathname) {
          resp.writeHead(404).end()
          return
        }

        if (url.pathname.startsWith(yoga.graphqlEndpoint)) {
          await yoga(req, resp)
        } else {
          await handle(req, resp, url)
        }
      } catch (err) {
        logger.error(`Error while handling ${req.url}`, err)
        resp.writeHead(500).end()
      }
    })

    const wsServer = new WebSocketServer({
      noServer: true,
      path: graphqlEndpoint,
    })
    useServer(
      {
        schema,
        context: (req) => ({
          ...req,
          signingKey: secret,
          domain,
          subscriptionPublisher,
          db: prisma,
          loaders: createDataLoaders(prisma),
        }),
      },
      wsServer,
    )

    // create http server
    const server = createServer(app)

    server.on('upgrade', (request, socket, head) => {
      if (!request.url) {
        return
      }

      const url = parse(request.url, true)
      if (!url.pathname) {
        return
      }

      if (request.url.startsWith(yoga.graphqlEndpoint)) {
        wsServer.handleUpgrade(request, socket, head, (ws) => {
          wsServer.emit('connection', ws, request)
        })
      }
    })

    await new Promise<void>((resolve) =>
      server.listen(port, () => {
        resolve()
      }),
    )

    logger.info(`
> App started!
  HTTP server running on http://${domain}:${port}
  GraphQL WebSocket server running on ws://${domain}:${port}${graphqlEndpoint}
`)
  } catch (error) {
    logger.error('Error starting Playnite Web:', error)
  }
}

run()
