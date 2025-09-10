import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'
import globals from 'globals'

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'eslint.config.mjs',
      '**/*.vue.js'
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      }
    }
  },
  // Vue Flat 推荐规则（需展开避免嵌套数组）
  ...pluginVue.configs['flat/recommended'],
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2020,
        sourceType: 'module',
        // 不启用 type-aware lint，避免 tsconfig include 覆盖问题
        tsconfigRootDir: process.cwd(),
        extraFileExtensions: ['.vue']
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      }
    },
    plugins: {
      vue: pluginVue,
      '@typescript-eslint': tsPlugin
    },
    rules: {
      'no-console': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  },
  // 低代码子集：暂时放宽环境与未使用规则，聚焦语法与结构问题
  {
    files: ['src/lowcode/**/*.{ts,tsx,vue}'],
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-case-declarations': 'off'
    }
  },
  // 测试与示例覆盖：放宽部分规则
  {
    files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', 'src/lowcode/examples/**/*.{ts,tsx}'],
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off'
    }
  }
]


