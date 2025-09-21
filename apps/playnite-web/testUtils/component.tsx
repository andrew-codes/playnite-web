import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client'
import { HttpLink } from '@apollo/client/core'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { ApolloProvider } from '@apollo/client/react'
import { getMainDefinition } from '@apollo/client/utilities'
import { Box, CssBaseline, ThemeProvider } from '@mui/material'
import { configureStore, StateFromReducersMapObject } from '@reduxjs/toolkit'
import { FragmentDefinitionNode, OperationDefinitionNode } from 'graphql'
import { createClient } from 'graphql-ws'
import { FC, PropsWithChildren } from 'react'
import { Provider } from 'react-redux'
import { reducer } from '../src/api/client/state'
import muiTheme from '../src/muiTheme'

const TestWrapper: FC<
  PropsWithChildren<{
    preloadedState?: StateFromReducersMapObject<typeof reducer>
  }>
> = ({ children, preloadedState }) => {
  const store = configureStore({
    reducer,
    preloadedState: preloadedState ?? {},
  })

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
    cache: new InMemoryCache().restore(window.__APOLLO_STATE__),
    uri: `${location.protocol}//${host}/api`,
    link,
  })

  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <ThemeProvider theme={muiTheme('desktop')}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </Provider>
    </ApolloProvider>
  )
}

const Boundary: FC<PropsWithChildren<{ maxWidth?: number }>> = ({
  children,
  maxWidth = 200,
}) => {
  return (
    <Box padding={16} maxWidth={maxWidth}>
      {children}
    </Box>
  )
}

export * from './'
export { Boundary, TestWrapper }
