const { build } = require('esbuild')
const pkg = require('../../package.json')

build({
  entryPoints: ['server.ts'],
  bundle: true,
  minify: true,
  external: ['lightningcss', 'esbuild'].concat(
    Object.keys(pkg.devDependencies),
  ),
  outfile: `server.${process.env.NODE_ENV ?? 'development'}.js`,
  platform: 'node',
  sourcemap: process.env.NODE_ENV !== 'production',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
})
