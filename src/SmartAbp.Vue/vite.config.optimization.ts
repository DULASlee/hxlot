/**
 * Vite构建优化配置
 * 包含分包策略、代码压缩、资源优化等
 */

import { defineConfig, type Plugin } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

/**
 * 分包策略配置
 */
export const chunkSplitConfig = {
  manualChunks: (id: string) => {
    // 1. Vue核心库
    if (id.includes('node_modules/vue')) {
      return 'vue-core'
    }
    if (id.includes('node_modules/vue-router')) {
      return 'vue-router'
    }
    if (id.includes('node_modules/pinia')) {
      return 'pinia'
    }
    
    // 2. Element Plus UI库
    if (id.includes('node_modules/element-plus')) {
      return 'element-plus'
    }
    
    // 3. 图标库
    if (id.includes('node_modules/@iconify')) {
      return 'iconify'
    }
    
    // 4. 工具库
    if (id.includes('node_modules/axios')) {
      return 'axios'
    }
    if (id.includes('node_modules/lodash')) {
      return 'lodash'
    }
    if (id.includes('node_modules/dayjs')) {
      return 'dayjs'
    }
    
    // 5. lowcode packages - 按package拆分
    if (id.includes('packages/lowcode-shared')) {
      return 'lowcode-shared'
    }
    if (id.includes('packages/lowcode-core')) {
      return 'lowcode-core'
    }
    if (id.includes('packages/lowcode-designer')) {
      return 'lowcode-designer'
    }
    if (id.includes('packages/lowcode-api')) {
      return 'lowcode-api'
    }
    if (id.includes('packages/lowcode-tools')) {
      return 'lowcode-tools'
    }
    
    // 6. 其他node_modules统一打包
    if (id.includes('node_modules')) {
      return 'vendor'
    }
    
    // 7. 大文件独立分包 (>500kb)
    // 注意：这需要配合rollup的manualChunks函数使用
  }
}

/**
 * 构建优化配置
 */
export const buildOptimizationConfig = {
  // 目标浏览器
  target: 'es2015',
  
  // 生产环境移除console
  minify: 'terser' as const,
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info', 'console.debug']
    }
  },
  
  // 启用CSS代码分割
  cssCodeSplit: true,
  
  // 生成sourcemap (仅错误监控使用)
  sourcemap: 'hidden' as const,
  
  // Rollup配置
  rollupOptions: {
    output: {
      // 分包配置
      ...chunkSplitConfig,
      
      // 资源文件命名
      chunkFileNames: 'assets/js/[name]-[hash].js',
      entryFileNames: 'assets/js/[name]-[hash].js',
      assetFileNames: (assetInfo) => {
        const info = assetInfo.name || ''
        
        // 图片资源
        if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(info)) {
          return 'assets/images/[name]-[hash][extname]'
        }
        
        // 字体资源
        if (/\.(woff2?|eot|ttf|otf)$/i.test(info)) {
          return 'assets/fonts/[name]-[hash][extname]'
        }
        
        // CSS文件
        if (/\.css$/i.test(info)) {
          return 'assets/css/[name]-[hash][extname]'
        }
        
        // 其他资源
        return 'assets/[name]-[hash][extname]'
      }
    },
    
    // 外部化依赖（可选，用于CDN）
    // external: ['vue', 'vue-router', 'pinia', 'element-plus']
  },
  
  // chunk大小警告限制
  chunkSizeWarningLimit: 1000, // 1MB
  
  // 预渲染配置（可选）
  // ssr: false
}

/**
 * 性能分析插件配置
 */
export const performancePlugins: Plugin[] = [
  // Bundle分析可视化
  visualizer({
    filename: 'dist/stats.html',
    open: false, // 构建后自动打开
    gzipSize: true,
    brotliSize: true,
    template: 'treemap' // treemap | sunburst | network
  }) as Plugin,
  
  // Gzip压缩
  viteCompression({
    verbose: true,
    disable: false,
    threshold: 10240, // 10KB以上才压缩
    algorithm: 'gzip',
    ext: '.gz',
    deleteOriginFile: false
  }),
  
  // Brotli压缩
  viteCompression({
    verbose: true,
    disable: false,
    threshold: 10240,
    algorithm: 'brotliCompress',
    ext: '.br',
    deleteOriginFile: false
  })
]

/**
 * 依赖预构建优化
 */
export const optimizeDepsConfig = {
  include: [
    'vue',
    'vue-router',
    'pinia',
    'element-plus',
    'axios',
    '@vueuse/core',
    'dayjs'
  ],
  
  // 排除预构建
  exclude: [
    // 本地packages不需要预构建
    '@smartabp/lowcode-shared',
    '@smartabp/lowcode-core',
    '@smartabp/lowcode-designer',
    '@smartabp/lowcode-api',
    '@smartabp/lowcode-tools'
  ]
}

/**
 * 开发服务器优化
 */
export const serverOptimizationConfig = {
  // 预热常用文件
  warmup: {
    clientFiles: [
      './src/main.ts',
      './src/App.vue',
      './src/router/index.ts',
      './src/stores/*.ts',
      './src/components/**/*.vue'
    ]
  },
  
  // HMR优化
  hmr: {
    overlay: true,
    // 限制HMR传播
    // 当文件变更时，只更新必要的模块
  }
}

/**
 * 资源内联阈值配置
 */
export const assetInlineConfig = {
  // 小于4KB的资源内联为base64
  assetsInlineLimit: 4096,
  
  // 内联CSS
  cssInlineLimit: 4096
}

/**
 * 完整的Vite优化配置
 */
export default defineConfig({
  build: {
    ...buildOptimizationConfig,
    ...assetInlineConfig
  },
  
  optimizeDeps: optimizeDepsConfig,
  
  server: serverOptimizationConfig,
  
  plugins: performancePlugins
})
