import { useCSRFPrevention } from '@graphql-yoga/plugin-csrf-prevention'
import { useJWT } from '@graphql-yoga/plugin-jwt'
import { useCookies } from '@whatwg-node/server-plugin-cookies'
import type { AsyncMqttClient } from 'async-mqtt'
import { createYoga, YogaServerOptions } from 'graphql-yoga'
import { IdentityService } from '../auth/index.js'
import EntityConditionalDataApi from '../data/entityConditional/DataApi.js'
import InMemoryDataApi from '../data/inMemory/DataApi.js'
import { getDbClient } from '../data/mongo/client.js'
import MongoDataApi from '../data/mongo/DataApi.js'
import PriorityDataApi from '../data/priority/DataApi.js'
import { updater } from '../updater.js'
import type { PlayniteContext } from './context.js'
import schema from './schema.js'
import { subscriptionPublisher } from './subscriptionPublisher.js'

const graphql = (
  endpoint: string,
  signingKey: string,
  mqttClient: AsyncMqttClient,
) => {
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
        update: updater(mqttClient, dataApi, dataApi, dataApi),
      }
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
