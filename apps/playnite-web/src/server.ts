import { migrate } from 'db-client/migrate'
import { useServer } from 'graphql-ws/use/ws'
import { createServer } from 'http'
import next from 'next'
import { parse } from 'url'
import { WebSocketServer } from 'ws'
import { prisma } from './server/data/providers/postgres/client'
import createYoga from './server/graphql/index'
import schema from './server/graphql/schema'
import { subscriptionPublisher } from './server/graphql/subscriptionPublisher'
import logger from './server/logger'

const dev = process.env.NODE_ENV !== 'production'
const domain = process.env.HOST || 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)
const secret = process.env.SECRET

if (!secret) {
  throw new Error('SECRET environment variable is required for authentication.')
}

const graphqlEndpoint = '/api'
const yoga = createYoga(graphqlEndpoint, secret)

const app = next({ dev, hostname: domain, port })

async function run() {
  await migrate()

  try {
    await prisma.$connect()

    await app.prepare()
    const handle = app.getRequestHandler()
    const upgrade = app.getUpgradeHandler()

    // create http server
    const server = createServer(async (req, res) => {
      try {
        if (!req.url) {
          res.writeHead(404).end()
          return
        }

        const url = parse(req.url, true)
        if (!url.pathname) {
          res.writeHead(404).end()
          return
        }

        if (url.pathname.startsWith(yoga.graphqlEndpoint)) {
          await yoga(req, res)
        } else {
          await handle(req, res, url)
        }
      } catch (err) {
        logger.error(`Error while handling ${req.url}`, err)
        res.writeHead(500).end()
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
        }),
      },
      wsServer,
    )

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
    logger.info('Disconnecting from Prisma client.')
    await prisma.$disconnect()
    logger.debug('Database connection closed.')
    process.exit(1)
  }
}

run()
