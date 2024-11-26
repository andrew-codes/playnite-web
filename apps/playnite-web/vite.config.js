import { vitePlugin as remix } from '@remix-run/dev'
// import { RemixVitePWA } from '@vite-pwa/remix'
import { remixRoutes } from 'remix-routes/vite'
import { defineConfig } from 'vite'
import istanbul from 'vite-plugin-istanbul'

// const { RemixVitePWAPlugin, RemixPWAPreset } = RemixVitePWA()

const config = defineConfig({
  plugins: [
    remix({
      appDirectory: 'src',
      presets: [],
    }),
    remixRoutes(),
  ],
  define: {
    'globalThis.__DEV__': JSON.stringify(false),
  },
})

if (process.env.INSTRUMENT === 'true') {
  config.plugins.push(
    istanbul({
      cypress: true,
      exclude: ['**/__tests__', '**/__component_tests__', '**/.yarn'],
      extension: ['.ts', '.tsx'],
      forceBuildInstrument: true,
      include: 'src/**/*',
      requireEnv: false,
    }),
  )
}

export default config
