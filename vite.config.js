import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    UnoCSS(),
    vue(),
  ],
  base: process.env.VITE_BASE_PATH || '/moinniversaire/',
})
