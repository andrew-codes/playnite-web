import { createRequestHandler } from '@remix-run/express'
import compression from 'compression'
import createDebugger from 'debug'
import express from 'express'
import fs from 'fs'
import { useServer } from 'graphql-ws/lib/use/ws'
import helmet from 'helmet'
import { AsyncMqttClient } from 'mqtt-client'
import spdy from 'spdy'
import { WebSocketServer } from 'ws'
import createYoga from './src/server/graphql'

const debug = createDebugger('playnite-web/app/server')

async function run(mqttClient: AsyncMqttClient) {
  const { PORT } = process.env
  const port = PORT ? parseInt(PORT, 10) : 3000

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
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'default-src': ["'self'"],
          'connect-src': [
            "'self'",
            'ws://localhost:3000',
            'wss://localhost:3000',
          ],
          'style-src': [
            "'self'",
            "'unsafe-inline'",
            '*.googleapis.com',
            '*.gstatic.com',
          ],
          'script-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'"],
          'font-src': ["'self'", '*.googleapis.com', '*.gstatic.com'],
        },
      },
    }),
  )
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

  let httpServer = app
  let useSsl = false
  try {
    const sslKey =
      process.env.SSL_KEY ?? fs.readFileSync('./cert/server.key')?.toString()
    const sslCert =
      process.env.SSL_CERT ?? fs.readFileSync('./cert/server.cert')?.toString()
    if (sslKey && sslCert) {
      useSsl = true
      httpServer = spdy.createServer(
        {
          key: sslKey,
          cert: sslCert,
        },
        app,
      )
    }
  } catch (error) {}

  const server = httpServer.listen(port, () => {
    debug(`App listening on http${useSsl ? 's' : ''}://localhost:${port}`)

    const wsServer = new WebSocketServer({ server, path: '/api' })
    useServer(
      {
        execute: (args: any) => args.rootValue.execute(args),
        subscribe: (args: any) => args.rootValue.subscribe(args),
        onSubscribe: async (ctx, msg) => {
          const {
            schema,
            execute,
            subscribe,
            contextFactory,
            parse,
            validate,
          } = yoga.getEnveloped({
            ...ctx,
            req: ctx.extra.request,
            socket: ctx.extra.socket,
            params: msg.payload,
          })

          const args = {
            schema,
            operationName: msg.payload.operationName,
            document: parse(msg.payload.query),
            variableValues: msg.payload.variables,
            contextValue: await contextFactory(),
            rootValue: {
              execute,
              subscribe,
            },
          }

          const errors = validate(args.schema, args.document)
          if (errors.length) return errors
          return args
        },
      },
      wsServer,
    )
  })
}

export default run
