const { build } = require('esbuild')

console.log('Building server...')

build({
  entryPoints: ['server.ts'],
  bundle: true,
  minify: true,
  external: [
    'lightningcss',
    'esbuild',
    'sharp',
    'fsevents',
    '@img/sharp-darwin-arm64',
    '@img/sharp-darwin-x64',
    '@img/sharp-libvips-darwin-arm64',
    '@img/sharp-libvips-darwin-x64',
    '@img/sharp-libvips-linux-arm',
    '@img/sharp-libvips-linux-arm64',
    '@img/sharp-libvips-linux-s390x',
    '@img/sharp-libvips-linux-x64',
    '@img/sharp-libvips-linuxmusl-arm64',
    '@img/sharp-libvips-linuxmusl-x64',
    '@img/sharp-linux-arm',
    '@img/sharp-linux-arm64',
    '@img/sharp-linux-s390x',
    '@img/sharp-linux-x64',
    '@img/sharp-linuxmusl-arm64',
    '@img/sharp-linuxmusl-x64',
    '@img/sharp-wasm32',
    '@img/sharp-win32-ia32',
    '@img/sharp-win32-x64',
    'playnite-web-game-db-updater/index.js',
  ],
  outfile: `server.${process.env.NODE_ENV ?? 'development'}.js`,
  platform: 'node',
  sourcemap: process.env.NODE_ENV !== 'production',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
})
  .then((v) => {
    console.log('Server build complete.')
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
