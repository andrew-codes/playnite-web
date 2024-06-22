import { createRequestHandler } from '@remix-run/express'
import compression from 'compression'
import createDebugger from 'debug'
import dotenv from 'dotenv'
import express from 'express'
import path from 'node:path'
// import run from 'playnite-web-game-db-updater'

const debug = createDebugger('playnite-web/app/server')

dotenv.config({
  path: path.join(process.cwd(), 'local.env'),
  override: true,
})
dotenv.config({
  path: path.join(process.cwd(), 'overrides.env'),
  override: true,
})

async function run() {
  const { PORT } = process.env
  const port = PORT ? parseInt(PORT, 10) : 3000

  const app = express()

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

  const build = viteDevServer
    ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
    : await import('./build/server/index.mjs')
  app.all('*', createRequestHandler({ build }))

  app.listen(port, () => {
    debug(`App listening on http://localhost:${port}`)
  })
}

run()
// run()
