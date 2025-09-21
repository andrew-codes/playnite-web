import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client'
import { HttpLink } from '@apollo/client/core'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { ApolloProvider } from '@apollo/client/react'
import { getMainDefinition } from '@apollo/client/utilities'
import { CacheProvider } from '@emotion/react'
import { RemixBrowser } from '@remix-run/react'
import { FragmentDefinitionNode, OperationDefinitionNode } from 'graphql'
import { createClient } from 'graphql-ws'
import { startTransition, StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import createEmotionCache from './createEmotionCache'

declare global {
  interface Window {
    __APOLLO_STATE__: any
    Cypress?: any
  }
}

const hydratedState = (window as any).__APOLLO_STATE__

startTransition(() => {
  const host = location.host

  const wsLink = new GraphQLWsLink(
    createClient({
      url: `${location.protocol === 'https:' ? 'wss' : 'ws'}://${host}/api`,
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
    uri: `${location.protocol}//${host}/api`,
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
  const client = new ApolloClient({
    cache: new InMemoryCache().restore(hydratedState || {}),
    link,
  })

  const clientSideCache = createEmotionCache()

  const App = (
    <StrictMode>
      <CacheProvider value={clientSideCache}>
        <ApolloProvider client={client}>
          <RemixBrowser />
        </ApolloProvider>
      </CacheProvider>
    </StrictMode>
  )
  if (window.Cypress) {
    createRoot(document.body).render(App)
  } else {
    hydrateRoot(document, App)
  }
})
