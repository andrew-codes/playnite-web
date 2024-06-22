import { vitePlugin as remix } from '@remix-run/dev'
import { RemixVitePWA } from '@vite-pwa/remix'
import { remixRoutes } from 'remix-routes/vite'
import { defineConfig } from 'vite'

const { RemixVitePWAPlugin, RemixPWAPreset } = RemixVitePWA()

export default defineConfig({
  plugins: [
    remix({
      appDirectory: 'src',
      presets: [RemixPWAPreset()],
    }),
    remixRoutes(),
    RemixVitePWAPlugin({
      manifest: {
        short_name: 'PW',
        name: 'Playnite Web',
        start_url: '/',
        display: 'standalone',
        background_color: '#d3d7dd',
        theme_color: '#c34138',
        shortcuts: [
          {
            name: 'Homepage',
            url: '/',
            icons: [
              {
                src: '/icons/android-icon-96x96.png',
                sizes: '96x96',
                type: 'image/png',
                purpose: 'any monochrome',
              },
            ],
          },
        ],
        icons: [
          {
            src: '/icons/android-icon-36x36.png',
            sizes: '36x36',
            type: 'image/png',
          },
          {
            src: '/icons/android-icon-48x48.png',
            sizes: '48x48',
            type: 'image/png',
          },
          {
            src: '/icons/android-icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: '/icons/android-icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: '/icons/android-icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: '/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/android-chrome-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
        ],
      },
      registerType: 'autoUpdate',
    }),
  ],
})
