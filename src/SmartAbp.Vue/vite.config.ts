import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import vueDevtools from "vite-plugin-vue-devtools"
import Icons from "unplugin-icons/vite"
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
    (process.env.NODE_ENV !== "production" ? moduleWizardDev() : undefined) as any,
    (process.env.NODE_ENV !== "production" ? vueDevtools() : undefined) as any,
    AutoImport({
      resolvers: [ElementPlusResolver()],
      dts: true,
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: true,
    }),
    Icons({
      autoInstall: true,
      compiler: "vue3",
      scale: 1,
      defaultClass: "",
      defaultStyle: "",
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@smartabp/lowcode-core": fileURLToPath(
        new URL("./packages/lowcode-core", import.meta.url),
      ),
      "@smartabp/lowcode-designer": fileURLToPath(
        new URL("./packages/lowcode-designer", import.meta.url),
      ),
      "@smartabp/lowcode-codegen": fileURLToPath(
        new URL("./packages/lowcode-codegen", import.meta.url),
      ),
      "@smartabp/lowcode-api": fileURLToPath(
        new URL("./packages/lowcode-api", import.meta.url),
      ),
      "@smartabp/lowcode-ui-vue": fileURLToPath(
        new URL("./packages/lowcode-ui-vue", import.meta.url),
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
      "^/(connect|api|swagger|health-status)(/.*)?": {
        target: "https://localhost:44379",
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
