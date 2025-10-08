/**
 * 专业ESLint配置 - 2025年企业级标准
 * 基于SmartAbp项目实际需求
 */

module.exports = {
    root: true,
    env: {
        node: true,
        browser: true,
        es2022: true
    },
    extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        '@typescript-eslint/recommended-requiring-type-checking',
        'plugin:vue/vue3-recommended',
        'plugin:security/recommended',
        'plugin:unicorn/recommended'
    ],
    parser: 'vue-eslint-parser',
    parserOptions: {
        ecmaVersion: 2022,
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
        project: './tsconfig.json'
    },
    plugins: [
        '@typescript-eslint',
        'vue',
        'security',
        'unicorn',
        'import'
    ],
    rules: {
        // 类型安全 - 严格模式
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'error',
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-return': 'error',
        '@typescript-eslint/prefer-readonly': 'error',
        '@typescript-eslint/strict-boolean-expressions': 'error',

        // 代码质量
        'complexity': ['error', { max: 10 }],
        'max-lines-per-function': ['error', { max: 50 }],
        'max-depth': ['error', { max: 4 }],
        'max-params': ['error', { max: 4 }],

        // 安全规则
        'security/detect-object-injection': 'error',
        'security/detect-non-literal-regexp': 'error',
        'security/detect-unsafe-regex': 'error',
        'security/detect-buffer-noassert': 'error',

        // Vue最佳实践
        'vue/require-prop-types': 'error',
        'vue/require-default-prop': 'error',
        'vue/no-unused-properties': 'error',
        'vue/no-unused-refs': 'error',
        'vue/require-explicit-emits': 'error',

        // 性能优化
        'unicorn/prefer-node-protocol': 'error',
        'unicorn/no-array-for-each': 'error',
        'unicorn/prefer-array-some': 'error',
        'unicorn/prefer-includes': 'error',

        // 代码风格
        'import/order': ['error', {
            'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
            'newlines-between': 'always'
        }],
        'import/no-duplicates': 'error',
        'import/no-unresolved': 'error'
    },
    overrides: [
        {
            files: ['*.vue'],
            rules: {
                'vue/multi-word-component-names': 'off',
                'vue/no-multiple-template-root': 'off'
            }
        },
        {
            files: ['*.test.ts', '*.spec.ts'],
            rules: {
                '@typescript-eslint/no-explicit-any': 'off'
            }
        }
    ],
    settings: {
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true
            }
        }
    }
};
