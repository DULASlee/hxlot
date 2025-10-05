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
    // Phoenix Week 2 优化：启用CSS代码分割
    cssCodeSplit: true,
    // 启用源码映射（生产环境使用hidden以保护源码）
    sourcemap: process.env.NODE_ENV === 'production' ? 'hidden' : true,
    // 优化模块预加载
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      output: {
        // Phoenix Week 2 优化：智能代码分割策略
        manualChunks: (id) => {
          // Vue核心生态
          if (id.includes('node_modules/vue') || 
              id.includes('node_modules/vue-router') || 
              id.includes('node_modules/pinia')) {
            return 'vue-core'
          }
          
          // Element Plus UI库
          if (id.includes('node_modules/element-plus')) {
            return 'element-plus'
          }
          
          // Element Plus Icons
          if (id.includes('node_modules/@element-plus/icons-vue')) {
            return 'element-icons'
          }
          
          // ECharts可视化库（按需加载）
          if (id.includes('node_modules/echarts')) {
            return 'echarts'
          }
          
          // 代码高亮库
          if (id.includes('node_modules/highlight.js') || 
              id.includes('node_modules/@highlightjs')) {
            return 'highlight'
          }
          
          // Monaco Editor（如有使用）
          if (id.includes('node_modules/monaco-editor')) {
            return 'monaco'
          }
          
          // 日期处理库
          if (id.includes('node_modules/dayjs')) {
            return 'dayjs'
          }
          
          // 工具库
          if (id.includes('node_modules/lodash')) {
            return 'lodash'
          }
          
          // Phoenix Week 2 优化：低代码引擎按包分割
          if (id.includes('/packages/lowcode-shared/')) {
            return 'lowcode-shared'
          }
          if (id.includes('/packages/lowcode-core/')) {
            return 'lowcode-core'
          }
          if (id.includes('/packages/lowcode-designer/')) {
            return 'lowcode-designer'
          }
          if (id.includes('/packages/lowcode-api/')) {
            return 'lowcode-api'
          }
          if (id.includes('/packages/lowcode-tools/')) {
            return 'lowcode-tools'
          }
          
          // 其他node_modules（小型库统一打包）
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
        
        // Phoenix Week 2 优化：文件命名策略（带hash缓存）
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').slice(-2).join('/') : 'chunk'
          return `js/[name]-[hash].js`
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // 按资源类型分类存储
          if (assetInfo.name?.endsWith('.css')) {
            return 'css/[name]-[hash][extname]'
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name || '')) {
            return 'images/[name]-[hash][extname]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return 'fonts/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
      
      // Phoenix Week 2 优化：Tree-shaking优化
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    
    // Phoenix Week 2 优化：压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除console（生产环境）
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        // 移除无用代码
        pure_funcs: process.env.NODE_ENV === 'production' 
          ? ['console.log', 'console.info', 'console.debug'] 
          : [],
      },
      format: {
        // 移除注释
        comments: false,
      },
    },
    
    // Phoenix Week 2 优化：报告分析
    reportCompressedSize: true,
    
    // 提高构建性能
    target: 'es2015',
  },
})
