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
import { reducer } from './api/client/state'
import createEmotionCache from './createEmotionCache'
import { Head } from './root'
import data from './server/data/data.js'
import { User } from './server/data/types.entities.js'
import { PlayniteContext } from './server/graphql/context.js'
import schema from './server/graphql/schema.js'
import { createNull } from './server/oid.js'
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

  let user = {
    _type: 'User',
    id: createNull('User').toString(),
    username: 'Unknown',
    isAuthenticated: false,
  } as User
  try {
    const cookie = request.headers.get('Cookie')
    const authCookie: string | null =
      (
        cookie
          ?.split(';')
          .map((c) => c.trim())
          .find((c) => c.startsWith('authorization=')) ?? ''
      ).split('=')[1] ?? null
    if (authCookie) {
      user = jwt.decode(authCookie, process.env.SECRET ?? 'secret', {
        issuer: domain,
        algorithm: 'HS256',
      })
    }
  } catch (error) {
    debug(error)
  }

  const dataApi = await data()

  const schemaLink = new SchemaLink({
    schema,
    context: {
      signingKey: process.env.SECRET ?? 'secret',
      domain,
      jwt: { payload: user },
      queryApi: dataApi.query,
      updateQueryApi: dataApi.update,
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
  const domain = process.env.HOST ?? 'localhost'
  const port = process.env.PORT ?? '3000'

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

  let user: Partial<User> = {
    _type: 'User',
    id: createNull('User').toString(),
    username: 'Unknown',
    isAuthenticated: false,
  }
  try {
    const cookie = request.headers.get('Cookie')
    const authCookie: string | null =
      (
        cookie
          ?.split(';')
          .map((c) => c.trim())
          .find((c) => c.startsWith('authorization=')) ?? ''
      ).split('=')[1] ?? null
    if (authCookie) {
      user = jwt.decode(authCookie, process.env.SECRET ?? 'secret', {
        issuer: domain,
        algorithm: 'HS256',
      })
    }
  } catch (error) {
    debug(error)
  }

  const dataApi = await data()

  const schemaLink = new SchemaLink({
    schema,
    context: {
      signingKey: process.env.SECRET ?? 'secret',
      domain: domain,
      jwt: { payload: user },
      queryApi: dataApi.query,
      updateQueryApi: dataApi.update,
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
