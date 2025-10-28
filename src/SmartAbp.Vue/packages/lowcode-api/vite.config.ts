import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'http-client/index': resolve(__dirname, 'src/http-client.ts'),
        'generators/index': resolve(__dirname, 'src/generators/index.ts'),
        'composables/index': resolve(__dirname, 'src/composables/index.ts'),
      },
      name: 'SmartAbpLowcodeApi',
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
        '@smartabp/lowcode-shared',
        // Node.js built-ins
        'fs',
        'path',
        'os',
        'crypto',
      ],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  plugins: [
    dts({
      include: [
        'src/index.ts',
        'src/http-client.ts',
        'src/generators/**/*.ts',
        'src/composables/**/*.ts',
        'src/utils/**/*.ts',
        'src/types/**/*.ts',
      ],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
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

