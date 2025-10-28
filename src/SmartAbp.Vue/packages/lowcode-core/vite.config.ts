import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'index.ts'),
        'generators/index': resolve(__dirname, 'src/generators/index.ts'),
        'engines/index': resolve(__dirname, 'src/engines/index.ts'),
        'security/index': resolve(__dirname, 'src/security/index.ts'),
        'testing/index': resolve(__dirname, 'src/testing/index.ts'),
      },
      name: 'SmartAbpLowcodeCore',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'mjs' : 'cjs'
        return `${entryName}.${ext}`
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2020',
    rollupOptions: {
      external: [
        'vue',
        'pinia',
        '@smartabp/lowcode-shared',
        '@smartabp/lowcode-api',
        '@smartabp/lowcode-tools',
        '@smartabp/lowcode-designer',
        '@vue-flow/minimap',
        '@vue-flow/controls',
        '@vue-flow/background',
        // Node.js built-ins
        'fs',
        'path',
        'os',
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
    vue(),
    dts({
      include: [
        'index.ts',
        'src/generators/**/*.ts',
        'src/engines/**/*.ts',
        'src/security/**/*.ts',
        'src/testing/**/*.ts',
        'src/stores/**/*.ts',
        'src/utils/**/*.ts',
        'src/types/**/*.ts',
      ],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
        'tests/**/*.ts',
      ],
      outDir: 'dist',
      copyDtsFiles: true,
      staticImport: true,
      skipDiagnostics: false,
      logDiagnostics: true,
      rollupTypes: false,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})

