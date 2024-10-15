import {
  ApolloClient,
  InMemoryCache,
  Operation,
  split,
} from '@apollo/client/apollo-client.cjs'
import { SchemaLink } from '@apollo/client/link/schema/schema.cjs'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions/subscriptions.cjs'
import { ApolloProvider } from '@apollo/client/react/react.cjs'
import { getDataFromTree } from '@apollo/client/react/ssr'
import { getMainDefinition } from '@apollo/client/utilities'
import { CacheProvider } from '@emotion/react'
import { configureStore } from '@reduxjs/toolkit'
import type { AppLoadContext, EntryContext } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import createDebugger from 'debug'
import { FragmentDefinitionNode, OperationDefinitionNode } from 'graphql'
import { createClient } from 'graphql-ws'
import { isbot } from 'isbot'
import jwt from 'jsonwebtoken'
import { renderToStaticMarkup } from 'react-dom/server'
import { Helmet } from 'react-helmet'
import { Provider } from 'react-redux'
import { renderHeadToString } from 'remix-island'
import { Claim } from '../.generated/types.generated'
import { reducer } from './api/client/state'
import createEmotionCache from './createEmotionCache'
import { Head } from './root'
import EntityConditionalDataApi from './server/data/entityConditional/DataApi'
import InMemoryDataApi from './server/data/inMemory/DataApi'
import { getDbClient } from './server/data/mongo/client'
import MongoDataApi from './server/data/mongo/DataApi'
import PriorityDataApi from './server/data/priority/DataApi'
import { User } from './server/data/types.entities'
import { PlayniteContext } from './server/graphql/context'
import schema from './server/graphql/schema'
import { createNull } from './server/oid'
// import { preloadRouteAssets } from 'remix-utils/preload-route-assets'

const debug = createDebugger('playnite-web/entry.server.tsx')
const ABORT_DELAY = 5_000

async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext,
) {
  return isbot(request.headers.get('user-agent'))
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
      )
}

async function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const clientSideCache = createEmotionCache()
  const store = configureStore({ reducer })
  const domain = process.env.HOST ?? 'localhost'
  const port = process.env.PORT ?? '3000'

  let claim: Claim = {
    user: {
      _type: 'User',
      id: createNull('User').toString(),
      username: '',
      isAuthenticated: false,
    } as User,
    credential: '',
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
    new Set([ mongoApi]),
  )
  const schemaLink = new SchemaLink({
    schema,
    context: {
      signingKey: process.env.SECRET ?? 'secret',
      domain,
      jwt: claim,
      queryApi: dataApi,
      updateQueryApi: dataApi,
    } as Partial<PlayniteContext>,
  })

  const link = split(
    ({ query }: Operation) => {
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

  const client = new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache(),
    link,
  })
  const App = (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <RemixServer
          context={remixContext}
          url={request.url}
          abortDelay={ABORT_DELAY}
        />
      </Provider>
    </ApolloProvider>
  )

  return new Promise((resolve, reject) => {
    return getDataFromTree(App).then(() => {
      // Extract the entirety of the Apollo Client cache's current state
      const initialState = client.extract()

      const renderedOutput = renderToStaticMarkup(
        <>
          <CacheProvider value={clientSideCache}>{App}</CacheProvider>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__APOLLO_STATE__=${JSON.stringify(
                initialState,
              ).replace(/</g, '\\u003c')}`, // The replace call escapes the < character to prevent cross-site scripting attacks that are possible via the presence of </script> in a string literal
            }}
          />
        </>,
      )

      const head = renderHeadToString({ request, remixContext, Head })
      const helmet = Helmet.renderStatic()

      responseHeaders.set('Content-Type', 'text/html')
      resolve(
        new Response(
          `<!DOCTYPE html><html lang="en-US"><head>${head}${helmet.link.toString()}</head><body><div id="root">${renderedOutput}</div></body></html>`,
          {
            headers: responseHeaders,
            status: responseStatusCode,
          },
        ),
      )
    })
  })
}

async function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const clientSideCache = createEmotionCache()
  const store = configureStore({ reducer })
  let claim: Claim = {
    user: {
      _type: 'User',
      id: createNull('User').toString(),
      username: '',
      isAuthenticated: false,
    } as User,
    credential: '',
  }
  const domain = process.env.HOST ?? 'localhost'
  const port = process.env.PORT ?? '3000'

  try {
    const cookieValues =
      request.headers
        .get('Cookie')
        ?.split('\n')
        .map((cookieString) => cookieString.split('=')) ?? []
    const authCookie = cookieValues.find(([key]) => key === 'authorization')

    if (authCookie) {
      const value = decodeURIComponent(authCookie[1] ?? '')
      const [type, token] = value.split(' ')
      if (type !== 'Bearer') {
        throw new Error('Invalid token')
      }
      claim = jwt.decode(token, process.env.SECRET ?? 'secret', {
        issuer: domain,
        algorithm: 'HS256',
      })
    }
  } catch (error) {
    debug(error)
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
  const schemaLink = new SchemaLink({
    schema,
    context: {
      signingKey: process.env.SECRET ?? 'secret',
      domain: domain,
      jwt: claim,
      queryApi: dataApi,
      updateQueryApi: dataApi,
    } as Partial<PlayniteContext>,
  })

  const link = split(
    ({ query }: Operation) => {
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
  const client = new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache(),
    link,
  })
  const App = (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <RemixServer
          context={remixContext}
          url={request.url}
          abortDelay={ABORT_DELAY}
        />
      </Provider>
    </ApolloProvider>
  )

  return new Promise((resolve, reject) => {
    return getDataFromTree(App).then(() => {
      // Extract the entirety of the Apollo Client cache's current state
      const initialState = client.extract()

      const renderedOutput = renderToStaticMarkup(
        <>
          <CacheProvider value={clientSideCache}>{App}</CacheProvider>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__APOLLO_STATE__=${JSON.stringify(
                initialState,
              ).replace(/</g, '\\u003c')}`, // The replace call escapes the < character to prevent cross-site scripting attacks that are possible via the presence of </script> in a string literal
            }}
          />
        </>,
      )

      const head = renderHeadToString({ request, remixContext, Head })
      const helmet = Helmet.renderStatic()

      responseHeaders.set('Content-Type', 'text/html')
      resolve(
        new Response(
          `<!DOCTYPE html><html lang="en-US"><head>${head}${helmet.link.toString()}</head><body><div id="root">${renderedOutput}</div></body></html>`,
          {
            headers: responseHeaders,
            status: responseStatusCode,
          },
        ),
      )
    })
  })
}

export default handleRequest
