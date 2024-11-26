import { useCSRFPrevention } from '@graphql-yoga/plugin-csrf-prevention'
import { useJWT } from '@graphql-yoga/plugin-jwt'
import { useCookies } from '@whatwg-node/server-plugin-cookies'
import { createYoga } from 'graphql-yoga'
import { AsyncMqttClient } from 'mqtt-client'
import { IdentityService } from '../auth/index'
import EntityConditionalDataApi from '../data/entityConditional/DataApi'
import InMemoryDataApi from '../data/inMemory/DataApi'
import { getDbClient } from '../data/mongo/client'
import MongoDataApi from '../data/mongo/DataApi'
import PriorityDataApi from '../data/priority/DataApi'
import type { PlayniteContext } from './context'
import schema from './schema'
import { subscriptionPublisher } from './subscriptionPublisher'

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
    context: async (req): Promise<PlayniteContext> => {
      const db = (await getDbClient()).db('games')
      const mongoApi = new MongoDataApi(db)
      const inMemoryApi = new InMemoryDataApi()
      const userInMemory = new EntityConditionalDataApi(
        new Set(['User']),
        inMemoryApi,
        inMemoryApi,
      )
      const dataApi = new PriorityDataApi(
        new Set([userInMemory, mongoApi]),
        new Set([userInMemory, mongoApi]),
        new Set([mongoApi]),
      )
      return {
        ...req,
        domain,
        identityService: new IdentityService(dataApi, signingKey, domain),
        mqttClient,
        queryApi: dataApi,
        signingKey,
        subscriptionPublisher,
        updateQueryApi: dataApi,
      }
    },
  })
}

export default graphql
