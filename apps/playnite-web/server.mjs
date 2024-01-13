import { createRequestHandler } from '@remix-run/express'
import { broadcastDevReady } from '@remix-run/node'
import compression from 'compression'
import createDebugger from 'debug'
import express from 'express'
import * as build from './build/index.js'

const debug = createDebugger('playnite-web-app/server')

const { PORT } = process.env
const port = PORT ? parseInt(PORT, 10) : 3000

const app = express()
app.use(express.static('public'))

app.use(compression())
app.all('*', createRequestHandler({ build }))

app.listen(port, () => {
  if (process.env.NODE_ENV === 'development') {
    debug('sending dev-ready')
    broadcastDevReady(build)
  }
  debug(`App listening on http://localhost:${port}`)
})
