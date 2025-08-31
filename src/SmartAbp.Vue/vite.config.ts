import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevtools from 'vite-plugin-vue-devtools'
import dns from 'dns'

// 保证 DNS 解析 localhost 时不过滤非匹配网卡
dns.setDefaultResultOrder('verbatim')


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevtools(),
  ],
  server: {
    host: '0.0.0.0',    // 绑定所有可用地址
    port: 11369,
    strictPort: true
  },
  build: {
    outDir: '../SmartAbp.Web/wwwroot/dist'
  }
})
