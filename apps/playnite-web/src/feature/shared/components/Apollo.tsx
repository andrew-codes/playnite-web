'use client'
// ^ this file needs the "use client" pragma

import { ApolloLink, HttpLink } from '@apollo/client'
import {
  ApolloClient,
  ApolloNextAppProvider,
} from '@apollo/client-integration-nextjs'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import {
  FragmentDefinitionNode,
  OperationDefinitionNode,
} from 'graphql/language/ast'
import { inMemoryCache } from '../gql/inMemoryCache'

function makeClient() {
  const wsProtocol =
    typeof window !== 'undefined' && window.location.protocol === 'https:'
      ? 'wss'
      : 'ws'
  const wsHost =
    typeof window !== 'undefined' ? window.location.host : 'localhost:3000'
  const wsUrl = `${wsProtocol}://${wsHost}/api`

  const wsLink = new GraphQLWsLink(
    createClient({
      url: wsUrl,
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
  const httpLink = new HttpLink({
    uri: `/api`,
    credentials: 'same-origin',
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
    httpLink,
  )

  return new ApolloClient({
    cache: inMemoryCache,
    link,
  })
}

// you need to create a component to wrap your app in
function Apollo({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  )
}

export { Apollo }
