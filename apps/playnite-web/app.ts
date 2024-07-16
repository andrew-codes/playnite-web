import { createRequestHandler } from '@remix-run/express'
import compression from 'compression'
import createDebugger from 'debug'
import express from 'express'
import { AsyncMqttClient } from 'mqtt-client'
import api from './src/server/api'
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

  app.use(compression())

  const signingKey = process.env.SECRET ?? 'secret'
  app = api('/api', signingKey, mqttClient)(app)

  const build = viteDevServer
    ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
    : await import('./build/server/index')

  const remixHandler = createRequestHandler({ build })
  app.all('*', (req, resp, next) => {
    if (!req.path.startsWith('/api')) {
      remixHandler(req, resp, next)
    }
  })

  app.listen(port, () => {
    debug(`App listening on http://localhost:${port}`)
  })
}

export default run
