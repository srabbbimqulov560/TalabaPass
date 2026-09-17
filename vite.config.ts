import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'TalabaPass - Chegirmalar',
        short_name: 'TalabaPass',
        description: 'Talabalar uchun raqamli ID va maxsus chegirmalar tizimi',
        theme_color: '#0f172a', // Ilovaning tepa qismi (Status bar) rangi
        background_color: '#ffffff',
        display: 'standalone', // To'liq ekran, brauzer qismlarisiz
        orientation: 'portrait', // Faqat tik holatda ishlashi uchun
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Android'da ikonka chiroyli kesilishi uchun
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});