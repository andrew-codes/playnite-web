const { build } = require('esbuild')
// const {
//   nodeModulesPolyfillPlugin,
// } = require('esbuild-plugins-node-modules-polyfill')
const pkg = require('./package.json')

build({
  entryPoints: ['server.ts'],
  bundle: true,
  minify: true,
  external: ['lightningcss', 'esbuild'].concat(
    Object.keys(pkg.devDependencies),
  ),
  outfile: `server.${process.env.NODE_ENV ?? 'development'}.js`,
  platform: 'node',
  // plugins: [nodeModulesPolyfillPlugin({ modules: ['crypto'] })],
})
