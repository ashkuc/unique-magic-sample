import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // base: '/unique-magic-sample/',
  base: process.env.NODE_ENV === 'production' ? '/unique-magic-sample/' : '/',
})
