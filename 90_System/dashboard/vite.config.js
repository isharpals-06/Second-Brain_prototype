import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    host: true, // Allow Vite to listen on 0.0.0.0 for Docker networking
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://127.0.0.1:3010',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
