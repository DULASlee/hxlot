/**
 * packages性能优化配置
 * 优化packages的加载和运行时性能
 */

export default {
  /**
   * 代码分割配置
   */
  codeSplitting: {
    // 按包拆分
    splitByPackage: true,
    // 最小chunk大小 (20KB)
    minSize: 20000,
    // 最大chunk大小 (200KB)
    maxSize: 200000,
    // 优先级
    priority: {
      'lowcode-shared': 100,
      'lowcode-core': 90,
      'lowcode-api': 80,
      'lowcode-designer': 70,
      'lowcode-tools': 60
    }
  },

  /**
   * Tree-shaking配置
   */
  treeSh aking: {
    // 启用
    enabled: true,
    // 标记未使用导出
    usedExports: true,
    // 副作用配置
    sideEffects: {
      // 无副作用的包
      noSideEffects: [
        '@smartabp/lowcode-shared/utils',
        '@smartabp/lowcode-shared/validators',
        '@smartabp/lowcode-shared/constants'
      ],
      // 有副作用的包
      hasSideEffects: [
        '@smartabp/lowcode-shared/error',
        '@smartabp/lowcode-shared/logging'
      ]
    }
  },

  /**
   * 懒加载配置
   */
  lazyLoading: {
    // 启用组件懒加载
    components: true,
    // 路由懒加载
    routes: true,
    // 预加载关键包
    preload: [
      '@smartabp/lowcode-shared',
      '@smartabp/lowcode-core'
    ],
    // 预取次要包
    prefetch: [
      '@smartabp/lowcode-designer',
      '@smartabp/lowcode-tools'
    ]
  },

  /**
   * 缓存配置
   */
  caching: {
    // 持久化缓存
    persistent: true,
    // 缓存目录
    cacheDirectory: 'node_modules/.cache/lowcode-packages',
    // 缓存版本
    version: '1.0.0',
    // 缓存策略
    strategy: {
      // 开发环境：内存缓存
      development: 'memory',
      // 生产环境：文件系统缓存
      production: 'filesystem'
    }
  },

  /**
   * 压缩配置
   */
  compression: {
    // 启用Gzip
    gzip: true,
    // 启用Brotli
    brotli: true,
    // 压缩级别 (1-9)
    level: 9,
    // 最小压缩大小
    threshold: 10240 // 10KB
  },

  /**
   * 依赖优化
   */
  dependencies: {
    // 预构建依赖
    prebundle: true,
    // 外部化依赖
    external: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus'
    ],
    // 共享依赖
    shared: {
      vue: { singleton: true, requiredVersion: '^3.4.0' },
      'vue-router': { singleton: true, requiredVersion: '^4.2.0' },
      pinia: { singleton: true, requiredVersion: '^2.1.0' }
    }
  },

  /**
   * 性能预算
   */
  performanceBudget: {
    // 总包大小限制 (500KB)
    maxBundleSize: 512000,
    // 单个chunk大小限制 (200KB)
    maxChunkSize: 204800,
    // 初始加载时间限制 (3s)
    maxInitialLoadTime: 3000,
    // 资源数量限制
    maxResources: 50
  },

  /**
   * 监控配置
   */
  monitoring: {
    // 启用性能监控
    enabled: true,
    // 采样率 (10%)
    sampleRate: 0.1,
    // 上报阈值
    thresholds: {
      // 首次内容绘制 (FCP)
      fcp: 1800,
      // 最大内容绘制 (LCP)
      lcp: 2500,
      // 首次输入延迟 (FID)
      fid: 100,
      // 累积布局偏移 (CLS)
      cls: 0.1
    }
  }
}
