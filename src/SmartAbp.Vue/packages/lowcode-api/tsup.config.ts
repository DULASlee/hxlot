import { defineConfig } from 'tsup'

export default defineConfig({
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📦 入口配置 - 多入口支持按需加载
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  entry: {
    // 主入口
    index: 'src/index.ts',
    
    // HTTP客户端独立入口
    'http-client/index': 'src/http-client.ts',
    
    // 代码生成器API独立入口
    'generators/index': 'src/generators/index.ts',
    
    // Composables独立入口
    'composables/index': 'src/composables/index.ts',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏗️ 构建配置
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // 输出格式
  format: ['esm', 'cjs'],
  
  // 生成类型声明
  dts: true,
  
  // 代码分割
  splitting: true,
  
  // Source Map
  sourcemap: true,
  
  // 清理输出目录
  clean: true,
  
  // Tree-shaking
  treeshake: true,
  
  // 输出目录
  outDir: 'dist',
  
  // 目标环境
  target: 'es2020',
  
  // 平台
  platform: 'browser',
  
  // 压缩配置
  minify: false,
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📦 外部依赖
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  external: [
    'vue',
    '@smartabp/lowcode-shared',
  ],
})

