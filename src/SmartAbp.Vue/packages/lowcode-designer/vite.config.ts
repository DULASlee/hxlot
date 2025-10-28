import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'components/index': resolve(__dirname, 'src/components/index.ts'),
        'views/index': resolve(__dirname, 'src/views/index.ts'),
      },
      name: 'SmartAbpLowcodeDesigner',
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
        '@smartabp/lowcode-core',
        '@smartabp/lowcode-shared',
        '@smartabp/lowcode-api',
        '@vue-flow/core',
        '@vue-flow/minimap',
        '@vue-flow/controls',
        '@vue-flow/background',
        'element-plus',
        'fs',
        'path',
        'os',
      ],
      output: {
        globals: {
          vue: 'Vue',
          pinia: 'Pinia',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src'),
    },
  },
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.test.ts', 'src/**/*.vue'],
      outDir: 'dist',
      copyDtsFiles: true,
      staticImport: true,
      rollupTypes: false,
    }),
  ],
})

