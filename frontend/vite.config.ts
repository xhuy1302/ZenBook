import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import i18nextLoader from 'vite-plugin-i18next-loader'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    i18nextLoader({
      paths: ['./src/i18n/locales'],
      namespaceResolution: 'basename'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@defines': path.resolve(__dirname, './src/defines'),
      '@pages': path.resolve(__dirname, './src/pages')
    }
  }
})
