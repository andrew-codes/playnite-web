import createCache from '@emotion/cache'

function createEmotionCache() {
  let insertionPoint: HTMLElement | undefined

  if (typeof document !== 'undefined') {
    const el = document.querySelector<HTMLMetaElement>(
      'meta[name="emotion-insertion-point"]',
    )
    insertionPoint = el ?? undefined
  }

  return createCache({
    key: 'css',
    insertionPoint,
  })
}

export default createEmotionCache
