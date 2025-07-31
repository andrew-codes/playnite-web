import { useCSRFPrevention } from '@graphql-yoga/plugin-csrf-prevention'
import {
  extractFromCookie,
  extractFromHeader,
  useJWT,
} from '@graphql-yoga/plugin-jwt'
import { useCookies } from '@whatwg-node/server-plugin-cookies'
import { createYoga, YogaServerOptions } from 'graphql-yoga'
import path from 'path'
import { AssetFileHandler } from '../AssetFileHandler.js'
import { IdentityService } from '../auth/index.js'
import { prisma } from '../data/providers/postgres/client.js'
import type { PlayniteContext } from './context.js'
import schema from './schema.js'
import { subscriptionPublisher } from './subscriptionPublisher.js'

const graphql = (endpoint: string, signingKey: string) => {
  const domain = process.env.HOST ?? 'localhost'

  const config: YogaServerOptions<any, PlayniteContext> = {
    schema,
    graphqlEndpoint: endpoint,
    graphiql: {
      subscriptionsProtocol: 'WS',
    },
    plugins: [
      useCookies(),
      useJWT({
        signingKeyProviders: [() => signingKey],
        tokenLookupLocations: [
          extractFromHeader({ name: 'authorization', prefix: 'Bearer' }),
          extractFromCookie({ name: 'authorization' }),
        ],
        reject: {
          missingToken: false,
          invalidToken: true,
        },
      }),
    ],
    context: async (req): Promise<PlayniteContext> => {
      const ctx: PlayniteContext = {
        ...req,
        domain,
        identityService: new IdentityService(signingKey, domain),
        signingKey,
        subscriptionPublisher,
        db: prisma,
        assets: new AssetFileHandler(
          path.join(import.meta.dirname, '..', '..', 'public', 'user-assets'),
        ),
      }

      return ctx
    },
  }

  if (process.env.TEST !== 'e2e') {
    config.plugins?.push(
      useCSRFPrevention({ requestHeaders: ['x-graphql-yoga-csrf'] }),
    )
    config.cors = {
      origin: [domain].concat(process.env.ADDITIONAL_ORIGINS?.split(',') ?? []),
      credentials: true,
      allowedHeaders: ['X-Custom-Header'],
      methods: ['GET', 'POST'],
    }
  }

  return createYoga(config)
}

export default graphql
