import { vitePlugin as remix } from '@remix-run/dev'
// import { RemixVitePWA } from '@vite-pwa/remix'
import { remixRoutes } from 'remix-routes/vite'
import { defineConfig } from 'vite'

// const { RemixVitePWAPlugin, RemixPWAPreset } = RemixVitePWA()

export default defineConfig({
  plugins: [
    remix({
      appDirectory: 'src',
      presets: [],
    }),
    remixRoutes(),
  ],
})
