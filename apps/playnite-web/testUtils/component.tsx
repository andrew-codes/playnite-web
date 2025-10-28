import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { ApolloProvider } from '@apollo/client/react'
import { getMainDefinition } from '@apollo/client/utilities'
import { Box, CssBaseline, ThemeProvider } from '@mui/material'
import { StateFromReducersMapObject } from '@reduxjs/toolkit'
import { FragmentDefinitionNode, OperationDefinitionNode } from 'graphql'
import { createClient } from 'graphql-ws'
import { FC, PropsWithChildren } from 'react'
import { reducer } from '../src/api/client/state'
import { Redux } from '../src/feature/shared/components/Redux'
import muiTheme from '../src/muiTheme'

function makeClient() {
  const wsLink = new GraphQLWsLink(
    createClient({
      url: `ws://localhost/api`,
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
    cache: new InMemoryCache(),
    link,
  })
}

const TestWrapper: FC<
  PropsWithChildren<{
    preloadedState?: StateFromReducersMapObject<typeof reducer>
  }>
> = ({ children, preloadedState }) => {
  return (
    <ApolloProvider client={makeClient()}>
      <Redux>
        <ThemeProvider theme={muiTheme('desktop')}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </Redux>
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

export { Boundary, TestWrapper }
