import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'theme/index': resolve(__dirname, 'src/theme/index.ts'),
        'theme/tokens': resolve(__dirname, 'src/theme/tokens.ts'),
        'types/index': resolve(__dirname, 'src/types/index.ts'),
      },
      name: 'SmartAbpLowcodeShared',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'mjs' : 'cjs'
        return `${entryName}.${ext}`
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [
        'vue',
        'pinia',
        'zod',
        '@smartabp/metadata-core',
        '@smartabp/lowcode-api',
        'element-plus',
        '@vue-flow/core',
        // Node.js built-ins
        'fs',
        'path',
        'os',
        'child_process',
        'crypto',
      ],
      output: {
        globals: {
          vue: 'Vue',
          pinia: 'Pinia',
        },
      },
    },
  },
  plugins: [
    dts({
      // 只为主入口生成类型定义
      include: [
        'src/index.ts',
        'src/theme/**/*.ts',
        'src/types/**/*.ts',
        'src/validation/**/*.ts',
        'src/utils/**/*.ts',
        'src/composables/**/*.ts',
      ],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
        'src/**/*.vue',
        'src/performance/**',
        'src/devtools/**',
      ],
      outDir: 'dist',
      copyDtsFiles: true,
      staticImport: true,
      skipDiagnostics: false,
      logDiagnostics: true,
      rollupTypes: false, // 不合并类型定义，保持原始结构
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})

