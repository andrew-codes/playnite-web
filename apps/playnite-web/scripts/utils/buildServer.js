const { build } = require('esbuild')

build({
  entryPoints: ['server.ts'],
  bundle: true,
  minify: true,
  external: ['lightningcss', 'esbuild', 'sharp'],
  outfile: `server.${process.env.NODE_ENV ?? 'development'}.js`,
  platform: 'node',
  sourcemap: process.env.NODE_ENV !== 'production',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
})
