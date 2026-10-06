import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/grnr-stck-ui/',
  plugins: [
    react(),
    {
      name: 'copy-404-fallback',
      closeBundle() {
        const distDir = path.resolve(__dirname, 'dist');
        const indexHtml = path.join(distDir, 'index.html');
        const notFoundHtml = path.join(distDir, '404.html');
        if (fs.existsSync(indexHtml)) {
          fs.copyFileSync(indexHtml, notFoundHtml);
        }
      }
    }
  ],
  server: {

    host: 'grnr-stck-api.onrender.com',
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://grnr-stck-api.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
