import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Raciku - Pharmacy Management System
// Offline-first: service worker caches app shell + assets so the app
// keeps working with no internet. Data itself is stored locally via
// Dexie (IndexedDB) and synced to Supabase whenever a connection exists.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Raciku - Apotek Jadi Mudah',
        short_name: 'Raciku',
        description: 'Sistem manajemen apotek offline-first',
        theme_color: '#16A34A',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        // Cache app shell aggressively; data comes from IndexedDB, not network
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/rest/v1') || url.pathname.startsWith('/auth/v1'),
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173
  }
})
