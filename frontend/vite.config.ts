import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// get env var
const API_URL = process.env.API_URL || 'http://localhost:3001';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      // redirect /api to the backend server
      '/api': {
        target: API_URL, // Adjust the port if your backend runs
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove /api
      },
    }
  }
})
