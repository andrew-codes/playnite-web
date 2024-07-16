import { useCSRFPrevention } from '@graphql-yoga/plugin-csrf-prevention'
import { useJWT } from '@graphql-yoga/plugin-jwt'
import { useCookies } from '@whatwg-node/server-plugin-cookies'
import { NextFunction, Request, Response } from 'express'
import { useServer } from 'graphql-ws/lib/use/ws'
import { createYoga } from 'graphql-yoga'
import helmet from 'helmet'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
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
            const headerAuthorization = request.headers.get('authorization')
            if (headerAuthorization) {
              const [type, token] =
                decodeURIComponent(headerAuthorization).split(' ')
              if (type === 'Bearer') {
                return token
              }
            }

            const [type, token] =
              (await request.cookieStore?.get('authorization'))?.value.split(
                ' ',
              ) ?? []

            if (type === 'Bearer') {
              return token
            }
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
    })

    const server = createServer(yoga)
    const wsServer = new WebSocketServer({ server, path: endpoint })

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

    await yoga(req, resp, next)
  }

export default graphql
