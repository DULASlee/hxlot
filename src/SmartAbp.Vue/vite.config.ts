import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import vueDevtools from "vite-plugin-vue-devtools"
import Icons from "unplugin-icons/vite"
import IconsResolver from "unplugin-icons/resolver"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import { fileURLToPath, URL } from "node:url"
import dns from "dns"
import moduleWizardDev from "./packages/lowcode-designer/src/dev/moduleWizardDev"

// 保证 DNS 解析 localhost 时不过滤非匹配网卡
dns.setDefaultResultOrder("verbatim")

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ...(process.env.NODE_ENV !== "production" ? [moduleWizardDev()] : []),
    ...(process.env.NODE_ENV !== "production" ? [vueDevtools()] : []),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      dts: true,
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: false,
        }),
        // 🎨 自动导入图标组件
        IconsResolver({
          prefix: 'Icon', // 图标组件前缀改为Icon
          enabledCollections: ['ep', 'carbon', 'mdi', 'fa'], // 启用的图标集
        }),
      ],
      dts: true,
    }),
    Icons({
      autoInstall: true,
      compiler: "vue3",
      scale: 1,
      defaultClass: "",
      defaultStyle: "",
      // 🎨 图标集配置
      collections: {
        // Element Plus Icons
        ep: () => import('@iconify-json/ep/icons.json').then(i => i.default),
        // Carbon Icons (IBM Design)
        carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
        // Material Design Icons
        mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
        // Font Awesome
        fa: () => import('@iconify-json/fa/icons.json').then(i => i.default),
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@smartabp/lowcode-shared": fileURLToPath(
        new URL("./packages/lowcode-shared/src", import.meta.url),
      ),
      "@smartabp/lowcode-core": fileURLToPath(
        new URL("./packages/lowcode-core", import.meta.url),
      ),
      "@smartabp/lowcode-designer": fileURLToPath(
        new URL("./packages/lowcode-designer/src", import.meta.url),
      ),
      "@smartabp/lowcode-codegen": fileURLToPath(
        new URL("./packages/lowcode-codegen/src", import.meta.url),
      ),
      "@smartabp/lowcode-api": fileURLToPath(
        new URL("./packages/lowcode-api/src", import.meta.url),
      ),
      "@smartabp/lowcode-tools": fileURLToPath(
        new URL("./packages/lowcode-tools/src", import.meta.url),
      ),
      "@smartabp/lowcode-ui-vue": fileURLToPath(
        new URL("./packages/lowcode-ui-vue/src", import.meta.url),
      ),
    },
  },
  optimizeDeps: {
    include: [
      "vue",
      "vue-router",
      "pinia",
      "element-plus",
      "@element-plus/icons-vue",
      "echarts",
      "highlight.js",
      "@highlightjs/vue-plugin",
      "dayjs",
    ],
  },
  server: {
    host: "0.0.0.0", // 绑定所有网络接口，确保IPv4可访问
    port: 11369,
    strictPort: false, // 允许端口自动切换，避免冲突
    open: false, // 禁用自动打开浏览器
    cors: true,
    // ✅ 添加 SPA 历史回退支持，确保所有路由都能正确访问
    fs: {
      strict: false,
    },
    watch: {
      ignored: [
        "**/packages/**/__tests__/**",
        "**/packages/**/examples/**",
        "**/node_modules/**",
        "**/dist/**",
        "**/build/**",
        "**/.git/**",
      ],
      usePolling: false, // 禁用轮询，减少CPU使用
    },
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    proxy: {
      "^/(connect|api|swagger|health-status|Account)(/.*)?": {
        target: "https://localhost:44379", // ✅ 修正：指向后端API服务器正确端口（44379），使用https协议
        changeOrigin: true,
        secure: false,
        timeout: 10000, // 增加超时时间
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err)
          })
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url)
          })
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("Received Response from the Target:", proxyRes.statusCode, req.url)
          })
        },
      },
    },
  },
  build: {
    outDir: "../SmartAbp.Web/wwwroot/dist",
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ["vue", "vue-router", "pinia"],
          elementPlus: ["element-plus", "@element-plus/icons-vue"],
          echarts: ["echarts"],
          highlight: ["highlight.js", "@highlightjs/vue-plugin"],
        },
      },
    },
  },
})
