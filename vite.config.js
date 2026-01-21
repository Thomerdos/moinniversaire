import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    UnoCSS(),
    vue(),
  ],
  // Utilise VITE_BASE_PATH pour les previews PR, sinon '/moinniversaire/' pour la production
  base: process.env.VITE_BASE_PATH || '/moinniversaire/',
})
