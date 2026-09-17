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
            src: 'https://cdn-icons-png.flaticon.com/512/5968/5968260.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/5968/5968260.png',
            sizes: '512x512',
            type: 'image/png'
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