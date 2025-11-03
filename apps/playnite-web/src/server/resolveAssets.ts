function resolve(assetPathFromRoot: string) {
  // Game assets are now served via Express static middleware at /game-assets
  // Regular assets continue to use /_next/static/media in production
  const isGameAsset = assetPathFromRoot.startsWith('game-assets/')
  
  let prefix = ''
  if (isGameAsset) {
    prefix = ''
  } else if (
    process.env.NODE_ENV === 'production' &&
    !(process.env.TEST === 'e2e' && process.env.CI !== 'true')
  ) {
    prefix = '/_next/static/media'
  }

  return `${prefix}/${assetPathFromRoot.replace(/^\/+/, '')}`
}

export { resolve }
