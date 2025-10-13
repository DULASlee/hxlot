import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    plugins: [vue(), vueJsx()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['../tests/setup.ts'],
        include: ['*/src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, '../src'),
            '@components': resolve(__dirname, '../src/components'),
            '@stores': resolve(__dirname, '../src/stores'),
            '@utils': resolve(__dirname, '../src/utils'),
            '@assets': resolve(__dirname, '../src/assets'),
            '@smartabp/lowcode-shared': resolve(__dirname, 'lowcode-shared/src'),
            '@smartabp/lowcode-core': resolve(__dirname, 'lowcode-core/src'),
            '@smartabp/lowcode-api': resolve(__dirname, 'lowcode-api/src'),
            '@smartabp/lowcode-tools': resolve(__dirname, 'lowcode-tools/src'),
            '@smartabp/lowcode-designer': resolve(__dirname, 'lowcode-designer/src'),
            '@smartabp/metadata-core': resolve(__dirname, 'metadata-core/src'),
        },
    },
})


