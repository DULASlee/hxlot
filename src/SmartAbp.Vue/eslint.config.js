// Flat ESLint config for SmartAbp.Vue (Stage-1 packages tightening)
// - Vue + TypeScript linting
// - Test globals provided
// - Targeted ignores for known parsing hotspots; to be fixed in Stage-2

import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import vuePlugin from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
    // Ignores (stage-1)
    {
        ignores: [
            'dist/**',
            'coverage/**',
            '**/dist/**',
            '**/*.tgz',
            // tests under packages
            'packages/*/src/**/__tests__/**',
            // temporary: complex preview/code SFCs pending fixes
            'packages/lowcode-designer/src/components/CodePreviewPanel.vue',
            'packages/lowcode-designer/src/views/LowCodeStudioView.vue',
        ]
    },

    // Base JS recommended
    js.configs.recommended,

    // Vue recommended (flat) – provides vue-eslint-parser for .vue SFCs
    ...vuePlugin.configs['flat/recommended'],

    // TypeScript files
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2024,
            sourceType: 'module'
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            vue: vuePlugin
        },
        rules: {
            'no-undef': 'off',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'no-useless-escape': 'off',
            'no-case-declarations': 'off',
            'no-redeclare': 'off'
        }
    },

    // Vue SFC files – use vue-eslint-parser with TS in <script setup>
    {
        files: ['**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tsParser,
                ecmaVersion: 2024,
                sourceType: 'module',
                extraFileExtensions: ['.vue']
            }
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            vue: vuePlugin
        },
        rules: {
            'no-undef': 'off',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'vue/multi-word-component-names': 'off',
            'vue/require-component-is': 'off',
            'vue/no-deprecated-filter': 'off',
            'vue/no-unused-vars': 'off',
            'vue/no-mutating-props': 'off',
            'no-empty': 'off',
            'no-useless-escape': 'off'
        }
    },

    // Declaration files: relax certain TS rules
    {
        files: ['**/*.d.ts'],
        plugins: {
            '@typescript-eslint': tsPlugin
        },
        rules: {
            'no-unused-vars': 'off',
            'no-redeclare': 'off'
        }
    },

    // Test files: provide globals for vitest/jest-like APIs
    {
        files: [
            '**/*.test.ts',
            '**/*.spec.ts',
            '**/__tests__/**/*.ts'
        ],
        languageOptions: {
            globals: {
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                jest: 'readonly'
            }
        },
        rules: {
            'no-undef': 'off',
            'no-unused-vars': 'off'
        }
    }
]
