import { CacheProvider } from '@emotion/react'
import { loadServiceWorker } from '@remix-pwa/sw'
import { RemixBrowser } from '@remix-run/react'
import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import createEmotionCache from './createEmotionCache'

const clientSideCache = createEmotionCache()

startTransition(() => {
  hydrateRoot(
    document.getElementById('root')!,
    <StrictMode>
      <CacheProvider value={clientSideCache}>
        <RemixBrowser />
      </CacheProvider>
    </StrictMode>,
  )
})

loadServiceWorker()
