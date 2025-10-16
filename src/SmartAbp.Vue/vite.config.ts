import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import dns from "dns"
import { fileURLToPath, URL } from "node:url"
import AutoImport from "unplugin-auto-import/vite"
import IconsResolver from "unplugin-icons/resolver"
import Icons from "unplugin-icons/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import Components from "unplugin-vue-components/vite"
import { defineConfig } from "vite"
import vueDevtools from "vite-plugin-vue-devtools"
import moduleWizardDev from "./packages/lowcode-designer/src/dev/moduleWizardDev"
import vitePluginLowCode from "./packages/lowcode-tools/src/vite"
import { createComponentConflictDetector } from "./src/utils/vite/conflictDetector"
import { createPackagesResolver } from "./src/utils/vite/packagesResolver"
// 🎨 图标集按需加载（只在生产环境预加载，开发环境按需）
// Offline icon collections (static JSON) with import assertions

// 仅在生产环境按需加载压缩插件；缺失时优雅降级
async function loadCompressionPlugin() {
  if (process.env.NODE_ENV !== 'production') return undefined
  try {
    const { default: viteCompression } = await import('vite-plugin-compression')
    return viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
      filter: /\.(js|css|html|json|svg)$/i,
      compressionOptions: { level: 11 },
    })
  } catch {
    console.warn('vite-plugin-compression 未安装，已跳过生产压缩插件')
    return undefined
  }
}

// 保证 DNS 解析 localhost 时不过滤非匹配网卡
dns.setDefaultResultOrder("verbatim")

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const compression = await loadCompressionPlugin()
  const isProduction = mode === 'production'
  const isDevelopment = mode === 'development'

  return {
    plugins: [
      // Brotli压缩（生产环境按需，缺失时跳过）
      compression,
      // 🔍 编译期组件名冲突检测（只在生产环境启用，开发环境跳过以提升启动速度）
      ...(isProduction ? [
        createComponentConflictDetector({
          packagesRoot: 'packages',
          packageComponentDirs: [
            'lowcode-shared/src/components',
            'lowcode-core/src/components',
            'lowcode-designer/src/components',
            'lowcode-api/src/components',
            'lowcode-tools/src/components',
          ],
          namingRules: {
            'lowcode-shared': 'Ls',
            'lowcode-core': 'Lc',
            'lowcode-designer': 'Ld',
            'lowcode-api': 'La',
            'lowcode-tools': 'Lt',
          },
          includeMainApp: true,
          mainComponentsDir: 'src/components',
          failOnConflict: true,
          largeFileLineThreshold: 300,
          // 排除仅用于 PoC/测试的代码生成器组件，避免与正式组件名冲突
          excludeDirs: [
            'lowcode-designer/src/components/CodeGenerator',
          ],
        })
      ] : []),
      vue(),
      vueJsx(),
      // 🔧 开发环境专用插件
      ...(isDevelopment ? [moduleWizardDev()] : []),
      // 🔧 Vue Devtools（通过环境变量控制，默认关闭以提升性能）
      ...(isDevelopment && process.env.ENABLE_DEVTOOLS === 'true' ? [vueDevtools()] : []),
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
          // 🎯 自动导入packages组件
          createPackagesResolver({
            packagesRoot: 'packages',
            enableCache: true,
            debug: isDevelopment
          }),
        ],
        // 🔍 组件扫描目录配置（开发环境减少扫描范围以提升启动速度）
        dirs: isDevelopment ? [
          // 开发环境：只扫描主应用组件，packages通过resolver按需加载
          'src/components',
        ] : [
          // 生产环境：扫描所有目录
          'src/components',
          'packages/lowcode-shared/src/components',
          'packages/lowcode-core/src/components',
          'packages/lowcode-designer/src/components',
          'packages/lowcode-api/src/components',
          'packages/lowcode-tools/src/components',
        ],
        // 🎯 深度扫描（生产环境启用，开发环境禁用以提升性能）
        deep: isProduction,
        // 📝 自动生成TypeScript类型声明
        dts: 'components.d.ts',
        // 🎯 支持的文件扩展名
        extensions: ['vue'],
        // 🎯 包含的文件模式
        include: [/\.vue$/, /\.vue\?vue/],
        // 🎯 排除的目录
        exclude: [
          /[\\/]node_modules[\\/]/,
          /[\\/]\.git[\\/]/,
          /[\\/]__tests__[\\/]/,
          /[\\/]examples[\\/]/,
          // 开发环境额外排除 CodeGenerator 目录
          ...(isDevelopment ? [/[\\/]CodeGenerator[\\/]/] : []),
        ],
      }),
      Icons({
        autoInstall: true,
        compiler: "vue3",
        scale: 1,
        defaultClass: "",
        defaultStyle: "",
        // 🎨 图标集配置（开发环境按需加载，生产环境预加载）
        // 开发环境不预加载图标集，用到时才加载，提升启动速度
      }),
      // 🔧 SmartAbp低代码插件（开发期）
      vitePluginLowCode(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@smartabp/lowcode-shared": fileURLToPath(
          new URL("./packages/lowcode-shared/src", import.meta.url),
        ),
        "@smartabp/lowcode-core": fileURLToPath(
          new URL("./packages/lowcode-core/src", import.meta.url),
        ),
        "@smartabp/lowcode-designer": fileURLToPath(
          new URL("./packages/lowcode-designer/src", import.meta.url),
        ),
        "@smartabp/lowcode-codegen": fileURLToPath(
          new URL("./packages/lowcode-codegen", import.meta.url),
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
      port: 9001,
      strictPort: true, // 固定端口9001，避免自动切换
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
        "^/(connect|api|abp|swagger|health-status|Account|codegen|metadata|database|db|hubs|signalr)(/.*)?": {
          target: "https://localhost:9002", // 指向后端（9002）
          changeOrigin: true,
          secure: false,
          ws: true,
          timeout: 10000, // 增加超时时间
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.log("proxy error", err)
            })
            proxy.on("proxyReq", (_proxyReq, req, _res) => {
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
        // 🎯 排除测试HTML文件，只构建主入口
        input: {
          main: fileURLToPath(new URL("./index.html", import.meta.url)),
        },
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
          chunkFileNames: (_chunkInfo) => {
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
  }
})
