import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Pokedex',
        short_name: 'Pokedex',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        description: 'Pokedex Progressive Web App',
        icons: [
          {
            src: 'pokeball.jpg',
            sizes: '192x192',
            type: 'image/jpg'
          },
          {
            src: 'pokeball.jpg',
            sizes: '512x512',
            type: 'image/jpg'
          }
        ]
      }
    })
  ]
});