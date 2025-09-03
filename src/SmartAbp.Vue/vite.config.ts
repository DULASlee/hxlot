import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevtools from 'vite-plugin-vue-devtools'
import Icons from 'unplugin-icons/vite'
import { fileURLToPath, URL } from 'node:url'
import dns from 'dns'

// 保证 DNS 解析 localhost 时不过滤非匹配网卡
dns.setDefaultResultOrder('verbatim')


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevtools(),
    Icons({
      autoInstall: true,
      compiler: 'vue3',
      scale: 1,
      defaultClass: '',
      defaultStyle: '',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',    // 绑定所有可用地址
    port: 11369,
    strictPort: true,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    proxy: {
      '^/(connect|api|swagger|health-status)(/.*)?': {
        target: 'https://localhost:44379',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: '../SmartAbp.Web/wwwroot/dist'
  }
})
