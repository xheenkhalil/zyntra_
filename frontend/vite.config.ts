import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'robots.txt', 'sitemap.xml'],
      manifest: {
        name: 'ZYNTRA — AI-Powered Examination Platform',
        short_name: 'ZYNTRA',
        description: 'AI-powered online examination platform for schools, universities, and businesses. Features AI proctoring, auto-grading, biometric verification, and smart analytics.',
        theme_color: '#111A50',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        categories: ['education', 'productivity', 'business']
        /* icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ] */
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', '@mui/material'],
          charts: ['chart.js', 'react-chartjs-2'],
          math: ['mathlive', 'katex']
        }
      }
    }
  }
})
