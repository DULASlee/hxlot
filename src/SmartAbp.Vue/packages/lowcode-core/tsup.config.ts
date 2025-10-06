import { defineConfig } from 'tsup'

export default defineConfig({
  // 入口文件
  entry: {
    index: 'index.ts',
    // 代码生成器独立入口（支持按需加载）
    'generators/index': 'src/generators/index.ts',
    // 引擎独立入口
    'engines/index': 'src/engines/index.ts',
    // 安全工具独立入口
    'security/index': 'src/security/index.ts',
    // 测试工具独立入口
    'testing/index': 'src/testing/index.ts',
  },

  // 输出格式
  format: ['esm', 'cjs'],
  
  // 生成类型声明
  dts: true,
  
  // 代码分割（优化包体积）
  splitting: true,
  
  // Source Map（便于调试）
  sourcemap: true,
  
  // 清理输出目录
  clean: true,
  
  // 外部依赖（不打包进bundle）
  external: [
    'vue',
    'pinia',
    '@smartabp/lowcode-shared',
    '@smartabp/lowcode-api',
    '@vue-flow/minimap',
    '@vue-flow/controls',
    '@vue-flow/background',
  ],
  
  // Tree-shaking（移除未使用代码）
  treeshake: true,
  
  // 压缩配置
  minify: false, // 开发模式不压缩，生产模式由构建流程控制
  
  // 输出配置
  outDir: 'dist',
  
  // 目标环境
  target: 'es2020',
  
  // 平台
  platform: 'browser',
})

