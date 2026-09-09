import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // Svaki poziv koji počinje s '/api' Vite će preusmjeriti na data.zagreb.hr
      '/api': {
        target: 'https://data.zagreb.hr',
        changeOrigin: true,
      }
    }
  }
})