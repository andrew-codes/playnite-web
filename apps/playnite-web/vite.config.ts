import { vitePlugin as remix } from '@remix-run/dev'
// import { RemixVitePWA } from '@vite-pwa/remix'
import { remixRoutes } from 'remix-routes/vite'
import { defineConfig } from 'vite'

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
    'globalThis.__DEV__': JSON.stringify(process.env.NODE_ENV !== 'production'),
    'globalThis.process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'production',
    ),
  },
})

export default config
