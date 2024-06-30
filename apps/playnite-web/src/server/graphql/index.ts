import { useCSRFPrevention } from '@graphql-yoga/plugin-csrf-prevention'
import { useJWT } from '@graphql-yoga/plugin-jwt'
import { useCookies } from '@whatwg-node/server-plugin-cookies'
import createDebugger from 'debug'
import { NextFunction, Request, Response } from 'express'
import { createYoga } from 'graphql-yoga'
import helmet from 'helmet'
import createSchema from './schema'

const debug = createDebugger('playnite-web/server/graphql')

const graphql =
  (signingKey: string, endpoint: string) =>
  async (req: Request, resp: Response, next: NextFunction) => {
    const schema = createSchema({ signingKey, domain: 'localhost' })
    const yoga = createYoga({
      schema,
      graphqlEndpoint: endpoint,
      cors: {
        origin: ['http://localhost:3000'],
        credentials: true,
        allowedHeaders: ['X-Custom-Header'],
        methods: ['GET', 'POST'],
      },
      plugins: [
        useCSRFPrevention({ requestHeaders: ['x-graphql-yoga-csrf'] }),
        useCookies(),
        useJWT({
          issuer: 'playnite-web',
          signingKey,
          getToken: ({ request }) => request.cookieStore?.get('authorization'),
        }),
      ],
    })
    helmet({
      contentSecurityPolicy: {
        directives: {
          'style-src': ["'self'", 'unpkg.com'],
          'script-src': ["'self'", 'unpkg.com', "'unsafe-inline'"],
          'img-src': ["'self'", 'raw.githubusercontent.com'],
        },
      },
    })(req, resp, next)

    await yoga(req, resp, next)
  }

export default graphql
