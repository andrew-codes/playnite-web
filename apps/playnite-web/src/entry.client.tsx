import { CacheProvider } from '@emotion/react'
import { configureStore } from '@reduxjs/toolkit'
import { loadServiceWorker } from '@remix-pwa/sw'
import { RemixBrowser } from '@remix-run/react'
import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { reducer } from './api/client/state'
import createEmotionCache from './createEmotionCache'

const clientSideCache = createEmotionCache()

startTransition(() => {
  const store = configureStore({ reducer })
  hydrateRoot(
    document.getElementById('root')!,
    <StrictMode>
      <CacheProvider value={clientSideCache}>
        <Provider store={store}>
          <RemixBrowser />
        </Provider>
      </CacheProvider>
    </StrictMode>,
  )
})

loadServiceWorker()
