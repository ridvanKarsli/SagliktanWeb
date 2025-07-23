import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Sağlıktan',
        short_name: 'Sağlıktan',
        description: 'Sağlık sosyal platformu ve AI asistanı',
        theme_color: '#0B3A4E',
        background_color: '#FAF9F6',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/sagliktanLogo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/sagliktanLogo.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/sagliktanLogo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.sagliktan\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 gün
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    })
  ],
})
