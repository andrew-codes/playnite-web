import { ApolloClient, InMemoryCache } from '@apollo/client/core/core.cjs'
import { ApolloProvider } from '@apollo/client/react/react.cjs'
import { CacheProvider } from '@emotion/react'
import { configureStore } from '@reduxjs/toolkit'
import { RemixBrowser } from '@remix-run/react'
import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { reducer } from './api/client/state'
import createEmotionCache from './createEmotionCache'

declare global {
  interface Window {
    __APOLLO_STATE__: any
  }
}

const clientSideCache = createEmotionCache()

startTransition(() => {
  const store = configureStore({ reducer })
  const client = new ApolloClient({
    cache: new InMemoryCache().restore(window.__APOLLO_STATE__),
    uri: 'http://localhost:3000/api',
  })

  hydrateRoot(
    document.getElementById('root')!,
    <StrictMode>
      <CacheProvider value={clientSideCache}>
        <ApolloProvider client={client}>
          <Provider store={store}>
            <RemixBrowser />
          </Provider>
        </ApolloProvider>
      </CacheProvider>
    </StrictMode>,
  )
})
