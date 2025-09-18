'use client'

import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { useServerInsertedHTML } from 'next/navigation'
import { FC, PropsWithChildren, useState } from 'react'

const Emotion: FC<PropsWithChildren> = ({ children }) => {
  const [cache] = useState(() => {
    const cache = createCache({ key: 'css' })
    cache.compat = true
    return cache
  })

  useServerInsertedHTML(() => {
    return (
      <style
        data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: Object.values(cache.inserted).join(' '),
        }}
      />
    )
  })

  return <CacheProvider value={cache}>{children}</CacheProvider>
}

export { Emotion }
