import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevtools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevtools(),
  ],
  server: {
    port: 11369,
    host: 'localhost'
  },
  build: {
    outDir: '../SmartAbp.Web/wwwroot/dist'
  }
})
