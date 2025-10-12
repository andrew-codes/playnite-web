function resolve(assetPathFromRoot: string) {
  let prefix = '/_next/static/media'
  if (
    process.env.NODE_ENV !== 'production' ||
    (process.env.TEST === 'e2e' && process.env.CI !== 'true')
  ) {
    prefix = ''
  }

  return `${prefix}/${assetPathFromRoot.replace(/^\/+/, '')}`
}

export { resolve }
