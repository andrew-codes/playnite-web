import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client'
import { SchemaLink } from '@apollo/client/link/schema'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { ApolloProvider } from '@apollo/client/react'
import { getDataFromTree, prerenderStatic } from '@apollo/client/react/ssr'
import { getMainDefinition } from '@apollo/client/utilities'
import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import { configureStore } from '@reduxjs/toolkit'
import type { AppLoadContext, EntryContext } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import { FragmentDefinitionNode, OperationDefinitionNode } from 'graphql'
import { createClient } from 'graphql-ws'
import jwt from 'jsonwebtoken'
import { renderToString } from 'react-dom/server'
import { Provider } from 'react-redux'
import { User } from '../.generated/types.generated'
import { reducer } from './api/client/state'
import createEmotionCache from './createEmotionCache'
import { prisma } from './server/data/providers/postgres/client'
import { PlayniteContext } from './server/graphql/context.js'
import schema from './server/graphql/schema.js'
import logger from './server/logger.js'
import { createNull } from './server/oid.js'
// import { preloadRouteAssets } from 'remix-utils/preload-route-assets'

const ABORT_DELAY = 5_000

async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext,
) {
  return handleBrowserRequest(
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

  let user: User = {
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
      let cookieUser = jwt.decode(authCookie, {
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

  const schemaLink = new SchemaLink({
    schema,
    context: {
      signingKey: process.env.SECRET ?? 'secret',
      domain,
      jwt: { payload: user },
    } as Partial<PlayniteContext>,
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

      const renderedOutput = renderToString(
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

      responseHeaders.set('Content-Type', 'text/html')
      resolve(
        new Response(`<!DOCTYPE html>${renderedOutput}`, {
          headers: responseHeaders,
          status: responseStatusCode,
        }),
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
      let cookieUser = jwt.decode(authCookie, {
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

  const schemaLink = new SchemaLink({
    schema,
    context: {
      signingKey: process.env.SECRET ?? 'secret',
      domain: domain,
      jwt: { payload: user },
      db: prisma,
    } as Partial<PlayniteContext>,
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
  const client = new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache(),
    link,
  })

  const clientSideCache = createEmotionCache()
  const { extractCriticalToChunks, constructStyleTagsFromChunks } =
    createEmotionServer(clientSideCache)

  const App = (
    <CacheProvider value={clientSideCache}>
      <ApolloProvider client={client}>
        <RemixServer
          context={remixContext}
          url={request.url}
          abortDelay={ABORT_DELAY}
        />
      </ApolloProvider>
    </CacheProvider>
  )

  const result = await prerenderStatic({
    tree: App,
    renderFunction: renderToString,
  })
  const initialState = client.extract()

  const html = result.result

  const emotionChunks = extractCriticalToChunks(html)
  const emotionStyleTags = constructStyleTagsFromChunks(emotionChunks)
  let doc = html.replace(
    '<meta name="emotion-insertion-point" content=""/>',
    `<meta name="emotion-insertion-point" content=""/>${emotionStyleTags}`,
  )

  doc = `<!DOCTYPE html>${doc}`

  const apolloStateScript = `<script>window.__APOLLO_STATE__=${JSON.stringify(initialState).replace(/</g, '\\u003c')}</script>`
  doc = doc.replace(
    '</body>',
    `${apolloStateScript}${process.env.TEST === 'e2e' ? '<script defer src="http://localhost:8097"></script>' : ''}</body>`,
  )

  responseHeaders.set('Content-Type', 'text/html')
  return new Response(doc, {
    headers: responseHeaders,
    status: responseStatusCode,
  })
}

export default handleRequest
