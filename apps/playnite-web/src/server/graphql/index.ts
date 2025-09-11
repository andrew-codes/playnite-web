import { useCSRFPrevention } from '@graphql-yoga/plugin-csrf-prevention'
import {
  extractFromCookie,
  extractFromHeader,
  useJWT,
} from '@graphql-yoga/plugin-jwt'
import { useCookies } from '@whatwg-node/server-plugin-cookies'
import asyncMqtt from 'async-mqtt'
import { createYoga, Plugin, YogaServerOptions } from 'graphql-yoga'
import { IdentityService } from '../auth/index.js'
import { prisma } from '../data/providers/postgres/client.js'
import logger from '../logger.js'
import type { PlayniteContext } from './context.js'
import schema from './schema.js'
import { subscriptionPublisher } from './subscriptionPublisher.js'

const graphql = async (endpoint: string, signingKey: string) => {
  const domain = process.env.HOST ?? 'localhost'

  const mqtt = await asyncMqtt.connectAsync(
    `tcp://${process.env.MQTT_HOST ?? 'localhost'}:${process.env.MQTT_PORT ?? 1883}`,
    {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    },
  )

  const config: YogaServerOptions<any, PlayniteContext> & {
    plugins: Array<Plugin>
  } = {
    schema,
    graphqlEndpoint: endpoint,
    graphiql: {
      subscriptionsProtocol: 'WS',
    },
    plugins: [
      useCookies<{}>(),
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
        mqtt,
      }

      return ctx
    },
  }

  if (process.env.TEST !== 'e2e') {
    config.plugins.push(
      useCSRFPrevention({ requestHeaders: ['x-graphql-yoga-csrf'] }),
    )
    config.cors = {
      origin: [domain].concat(process.env.ADDITIONAL_ORIGINS?.split(',') ?? []),
      credentials: true,
      allowedHeaders: ['X-Custom-Header'],
      methods: ['GET', 'POST'],
    }
  }

  config.plugins.push({
    onError({ error, context }) {
      logger.error('GraphQL Error:', error)
    },
  })

  return createYoga(config)
}

export default graphql
