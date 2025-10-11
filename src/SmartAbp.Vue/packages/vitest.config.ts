/**
 * Vitest配置 - packages测试
 */
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    test: {
        globals: true,
        environment: 'jsdom', // 改为jsdom以支持Vue组件
        include: ['__tests__/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/**',
                'dist/**',
                '**/*.d.ts',
                '**/__tests__/**',
                '**/mocks/**'
            ]
        },
        testTimeout: 10000
    },
    resolve: {
        alias: {
            '@smartabp/metadata-core': resolve(__dirname, './metadata-core/dist/esm'),
            '@smartabp/lowcode-shared': resolve(__dirname, './lowcode-shared/dist/esm'),
            '@smartabp/lowcode-api': resolve(__dirname, './lowcode-api/dist/esm'),
            '@smartabp/lowcode-core': resolve(__dirname, './lowcode-core/dist/esm'),
            '@smartabp/lowcode-designer': resolve(__dirname, './lowcode-designer/dist/esm')
        }
    }
})

