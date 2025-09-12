import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import vueDevtools from "vite-plugin-vue-devtools"
import Icons from "unplugin-icons/vite"
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
      "@smartabp/lowcode-core": fileURLToPath(new URL("./packages/lowcode-core/src", import.meta.url)),
      "@smartabp/lowcode-designer": fileURLToPath(new URL("./packages/lowcode-designer/src", import.meta.url)),
      "@smartabp/lowcode-codegen": fileURLToPath(new URL("./packages/lowcode-codegen/src", import.meta.url)),
      "@smartabp/lowcode-api": fileURLToPath(new URL("./packages/lowcode-api/src", import.meta.url)),
      "@smartabp/lowcode-ui-vue": fileURLToPath(new URL("./packages/lowcode-ui-vue/src", import.meta.url))
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
      "dayjs"
    ],
  },
  server: {
    host: "0.0.0.0", // 绑定所有可用地址
    port: 11369,
    strictPort: true,
    watch: {
      ignored: [
        "**/packages/**/__tests__/**",
        "**/packages/**/examples/**"
      ]
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
        }
      }
    }
  },
})
