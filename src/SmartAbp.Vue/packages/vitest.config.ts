/**
 * Vitest配置 - packages单元测试
 */

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  test: {
    // 测试环境
    environment: 'jsdom',
    
    // 全局API
    globals: true,
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        '**/*.stories.ts',
        '**/__tests__/**',
      ],
      // 覆盖率阈值
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    
    // 包含的测试文件
    include: [
      '**/packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    
    // 排除的文件
    exclude: [
      'node_modules/**',
      'dist/**',
      '.generated/**',
    ],
    
    // 别名
    alias: {
      '@smartabp/lowcode-shared': resolve(__dirname, './lowcode-shared/src'),
      '@smartabp/lowcode-core': resolve(__dirname, './lowcode-core/src'),
      '@smartabp/lowcode-api': resolve(__dirname, './lowcode-api/src'),
      '@smartabp/lowcode-designer': resolve(__dirname, './lowcode-designer/src'),
      '@smartabp/lowcode-tools': resolve(__dirname, './lowcode-tools/src'),
    },
    
    // 设置文件
    setupFiles: ['./packages/test-setup.ts'],
    
    // 并发
    maxConcurrency: 5,
    
    // 超时
    testTimeout: 10000,
    
    // 监听模式
    watch: false,
  },
  
  resolve: {
    alias: {
      '@smartabp/lowcode-shared': resolve(__dirname, './lowcode-shared/src'),
      '@smartabp/lowcode-core': resolve(__dirname, './lowcode-core/src'),
      '@smartabp/lowcode-api': resolve(__dirname, './lowcode-api/src'),
      '@smartabp/lowcode-designer': resolve(__dirname, './lowcode-designer/src'),
      '@smartabp/lowcode-tools': resolve(__dirname, './lowcode-tools/src'),
    },
  },
})
