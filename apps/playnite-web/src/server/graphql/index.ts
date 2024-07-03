import { useCSRFPrevention } from '@graphql-yoga/plugin-csrf-prevention'
import { useJWT } from '@graphql-yoga/plugin-jwt'
import { useCookies } from '@whatwg-node/server-plugin-cookies'
import { NextFunction, Request, Response } from 'express'
import { createYoga } from 'graphql-yoga'
import helmet from 'helmet'
import type { PlayniteContext } from './context'
import { Domain } from './Domain'
import schema from './schema'

const graphql =
  (signingKey: string, endpoint: string) =>
  async (req: Request, resp: Response, next: NextFunction) => {
    const yoga = createYoga({
      schema,
      graphqlEndpoint: endpoint,
      cors: {
        origin: ['http://localhost'],
        credentials: true,
        allowedHeaders: ['X-Custom-Header'],
        methods: ['GET', 'POST'],
      },
      plugins: [
        useCSRFPrevention({ requestHeaders: ['x-graphql-yoga-csrf'] }),
        useCookies(),
        useJWT({
          issuer: 'http://localhost',
          signingKey,
          algorithms: ['HS256'],
          getToken: async ({ request }) => {
            const [type, token] =
              (await request.cookieStore?.get('authorization'))?.value.split(
                ' ',
              ) ?? []

            if (type !== 'Bearer') return undefined

            return token ?? undefined
          },
        }),
      ],
      context: (req): PlayniteContext => ({
        ...req,
        signingKey,
        domain: 'localhost',
        api: new Domain(signingKey, 'localhost'),
      }),
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
