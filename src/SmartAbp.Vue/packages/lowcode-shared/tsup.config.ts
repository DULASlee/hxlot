import { defineConfig } from 'tsup'

export default defineConfig({
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📦 入口配置 - 多入口支持按需加载
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  entry: {
    // 主入口（包含所有导出）
    index: 'src/index.ts',

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📋 核心模块独立入口（支持按需导入）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // 验证系统
    'validation/index': 'src/validation/unified-validator.ts',
    // 🟡 Phase 3B: validation/adapter已删除（metadata-adapter.ts已废弃）

    // 版本管理
    'version/index': 'src/version/SchemaVersionManager.ts',
    'version/composable': 'src/version/useSchemaVersion.ts',

    // 缓存管理
    'cache/index': 'src/cache/UnifiedCacheManager.ts',

    // 内存管理
    'memory/index': 'src/memory/GlobalMemoryMonitor.ts',

    // 事件系统
    'events/index': 'src/events/UnifiedEventBus.ts',

    // 日志系统
    'logging/index': 'src/logging/LogPolicyManager.ts',
    'logging/error': 'src/logging/ErrorLogIntegration.ts',

    // 错误处理
    'error/index': 'src/error/GlobalErrorHandler.ts',

    // 主题系统
    'theme/index': 'src/theme/ThemeManager.ts',
    'theme/tokens': 'src/theme/tokens.ts',

    // 组件系统
    'components/index': 'src/components/index.ts',
    'components/hocs': 'src/components/hocs/index.ts',

    // Composables
    'composables/index': 'src/composables/index.ts',
    'composables/validation': 'src/composables/useValidation.ts',

    // 工具函数
    'utils/index': 'src/utils/index.ts',
    'utils/array': 'src/utils/array.ts',
    'utils/object': 'src/utils/object.ts',
    'utils/string': 'src/utils/string.ts',

    // 类型系统
    'types/index': 'src/types/index.ts',
    'types/schema': 'src/types/unified-schema.ts',

    // 国际化
    'i18n/index': 'src/i18n/validation-i18n.ts',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏗️ 构建配置
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // 输出格式（ESM + CommonJS双格式支持）
  format: ['esm', 'cjs'],

  // 生成TypeScript类型声明文件
  // ⚠️ 暂时禁用：tsconfig和类型导出问题待修复
  dts: false,

  // 代码分割（优化包体积，提升加载性能）
  splitting: true,

  // Source Map（便于调试）
  sourcemap: true,

  // 清理输出目录
  clean: true,

  // Tree-shaking（移除未使用代码）
  treeshake: true,

  // 输出目录
  outDir: 'dist',

  // 目标环境
  target: 'es2020',

  // 平台
  platform: 'browser',

  // 压缩配置（开发模式不压缩）
  minify: false,

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📦 外部依赖（不打包进bundle）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  external: [
    'vue',
    'pinia',
    'zod',
    '@smartabp/metadata-core',
    '@smartabp/metadata-core/schema',
    '@smartabp/lowcode-api',
    'element-plus',
    '@vue-flow/core',
    // Node.js built-ins（用于开发工具，不打包到浏览器端）
    'fs',
    'path',
    'os',
    'child_process',
    'crypto',
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔧 高级配置
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // 处理.vue文件
  esbuildOptions(options) {
    options.loader = {
      ...options.loader,
      '.vue': 'ts',
    }
  },

  // 确保package.json的exports配置生效
  // tsup会自动根据entry和format生成正确的导出路径
})

