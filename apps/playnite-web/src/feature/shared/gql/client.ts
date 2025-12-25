import {
  ApolloClient,
  registerApolloClient,
} from '@apollo/client-integration-nextjs'
import { ApolloLink } from '@apollo/client/link'
import { SchemaLink } from '@apollo/client/link/schema'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import {
  FragmentDefinitionNode,
  OperationDefinitionNode,
} from 'graphql/language/ast'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { User } from '../../../../.generated/types.generated'
import prisma from '../../../server/data/providers/postgres/client'
import { PlayniteContext } from '../../../server/graphql/context'
import { createDataLoaders } from '../../../server/graphql/dataloaders'
import schema from '../../../server/graphql/schema'
import logger from '../../../server/logger'
import { createNull } from '../../../server/oid'
import { inMemoryCache } from './inMemoryCache'

const { getClient, query, PreloadQuery } = registerApolloClient(async () => {
  const domain = process.env.HOST ?? 'localhost'
  const port = parseInt(process.env.PORT ?? '3000', 10)
  const secret = process.env.SECRET

  let user: User = {
    id: createNull('User').toString(),
    username: 'Unknown',
    isAuthenticated: false,
  } as User
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('authorization')?.value ?? null
    if (authCookie) {
      const cookieUser = jwt.decode(authCookie, {
        // secret: process.env.SECRET ?? 'secret',
        // issuer: domain,
        // algorithm: 'HS256',
      })
      if (cookieUser) {
        user = cookieUser as User
      }
    }
  } catch (error) {
    logger.warn('Failed to decode JWT token from cookie.', error)
  }

  const wsLink = new GraphQLWsLink(
    createClient({
      url: `ws://${domain}:${port}/api`,
      connectionParams: {
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        credentials: true,
      },
      on: {
        connected: () => console.info('GraphQLWsLink connected'),
        closed: () => console.info('GraphQLWsLink closed'),
      },
    }),
  )

  const schemaLink = new SchemaLink({
    schema,
    validate: false,
    context: {
      signingKey: secret,
      domain: domain,
      jwt: { payload: user },
      db: prisma,
      loaders: createDataLoaders(prisma),
    } as unknown as Partial<PlayniteContext>,
  })

  const link = ApolloLink.split(
    ({ query }: ApolloLink.Operation) => {
      const mainDefinition: OperationDefinitionNode | FragmentDefinitionNode =
        getMainDefinition(query)
      return (
        mainDefinition.kind === 'OperationDefinition' &&
        mainDefinition.operation === 'subscription'
      )
    },
    wsLink,
    schemaLink,
  )

  return new ApolloClient({
    cache: inMemoryCache,
    link,
  })
})

export { getClient, PreloadQuery, query }
