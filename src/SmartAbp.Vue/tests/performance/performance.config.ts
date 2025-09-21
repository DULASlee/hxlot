/**
 * Performance Testing Configuration
 * Advanced UI Component Library - Phase 3 Week 4
 * Component performance benchmarks and memory usage analysis
 */

import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

// Performance test thresholds
export const performanceThresholds = {
  // Component render times (milliseconds)
  render: {
    simple: 16,     // Single frame budget
    complex: 50,    // Complex components
    large: 100      // Large datasets
  },
  
  // Memory usage (MB)
  memory: {
    baseline: 50,    // Initial memory
    component: 5,    // Per component
    dataset: 20      // Large datasets
  },
  
  // Bundle size limits (KB)
  bundle: {
    component: 100,  // Individual component
    total: 2000,     // Total bundle
    vendor: 1500     // Vendor bundle
  },
  
  // Network requests
  network: {
    critical: 3,     // Critical path requests
    total: 10        // Total requests
  }
}

// Performance test configuration
export default defineConfig({
  test: {
    // Performance-specific test environment
    environment: 'jsdom',
    
    // Performance test globals
    globals: true,
    
    // Test setup for performance monitoring
    setupFiles: [
      './tests/performance/setup.ts'
    ],
    
    // Performance test reporters
    reporters: [
      'default',
      ['json', { outputFile: 'test-results/performance-results.json' }],
      ['html', { outputFile: 'test-results/performance-report.html' }]
    ],
    
    // Coverage for performance-critical code
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'coverage/performance',
      include: [
        'src/components/**/**.{ts,vue}',
        'src/performance/**/**.ts',
        'packages/lowcode-designer/src/components/**/**.{ts,vue}'
      ],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/__tests__/',
        'dist/'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // Performance test timeout
    testTimeout: 30000,
    
    // Benchmark configuration
    benchmark: {
      include: ['**/*.bench.{ts,js}'],
      reporters: ['default', 'json'],
      outputFile: 'test-results/benchmark-results.json'
    }
  },
  
  // Build optimizations for performance testing
  build: {
    target: 'esnext',
    minify: false, // Disable for accurate performance measurement
    sourcemap: true,
    rollupOptions: {
      external: ['vue', 'element-plus'],
      output: {
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus'
        }
      }
    }
  },
  
  // Resolution for performance test imports
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src'),
      '@components': resolve(__dirname, '../../packages/lowcode-designer/src/components'),
      '@tests': resolve(__dirname, '../../tests'),
      '@performance': resolve(__dirname, '../../src/performance')
    }
  },
  
  // Define performance test environment variables
  define: {
    __PERFORMANCE_TEST__: true,
    __BENCHMARK_MODE__: true
  }
})