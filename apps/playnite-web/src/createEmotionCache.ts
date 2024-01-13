import createCache from '@emotion/cache'

function createEmotionCache() {
  return createCache({ key: 'css' })
}

export default createEmotionCache
