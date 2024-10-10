import { useCSRFPrevention } from '@graphql-yoga/plugin-csrf-prevention'
import { useJWT } from '@graphql-yoga/plugin-jwt'
import { useCookies } from '@whatwg-node/server-plugin-cookies'
import createDebugger from 'debug'
import { createYoga } from 'graphql-yoga'
import { AsyncMqttClient } from 'mqtt-client'
import type { PlayniteContext } from './context'
import { Domain } from './Domain'
import schema from './schema'
import { subscriptionPublisher } from './subscriptionPublisher'

const debug = createDebugger('playnite-web/graph/mqtt-subscription-events')

const graphql = (
  endpoint: string,
  signingKey: string,
  mqttClient: AsyncMqttClient,
) => {
  const domain = process.env.HOST ?? 'localhost'

  return createYoga({
    schema,
    graphqlEndpoint: endpoint,
    graphiql: {
      subscriptionsProtocol: 'WS',
    },
    cors: {
      origin: [domain].concat(process.env.ADDITIONAL_ORIGINS?.split(',') ?? []),
      credentials: true,
      allowedHeaders: ['X-Custom-Header'],
      methods: ['GET', 'POST'],
    },
    plugins: [
      useCSRFPrevention({ requestHeaders: ['x-graphql-yoga-csrf'] }),
      useCookies(),
      useJWT({
        issuer: domain,
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
      domain,
      api: new Domain(),
      mqttClient,
      subscriptionPublisher,
    }),
  })
}

export default graphql
