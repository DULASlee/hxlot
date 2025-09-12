module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    // 关闭 type-aware 项目解析，避免 include 覆盖问题
    project: undefined,
    tsconfigRootDir: __dirname,
    extraFileExtensions: ['.vue']
  },
  plugins: ['@typescript-eslint', 'prettier', 'boundaries'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'plugin:prettier/recommended'
  ],
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'auto-imports.d.ts',
    'components.d.ts',
    'cypress/**',
    'eslint.config.*',
    '**/*.d.ts',
    '**/*.vue.js'
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue']
      }
    },
    'boundaries/elements': [
      { type: 'views', pattern: 'src/views/**' },
      { type: 'components', pattern: 'src/components/**' },
      { type: 'stores', pattern: 'src/stores/**' },
      { type: 'router', pattern: 'src/router/**' },
      { type: 'services', pattern: 'src/services/**' },
      { type: 'utils', pattern: 'src/utils/**' },
      { type: 'composables', pattern: 'src/composables/**' },
      { type: 'styles', pattern: 'src/styles/**' },
      { type: 'types', pattern: 'src/types/**' },
      { type: 'lowcode', pattern: 'src/lowcode/**' },
      { type: 'appshell', pattern: 'src/appshell/**' },
      { type: 'examples', pattern: 'src/examples/**' }
    ]
  },
  rules: {
    // 生产代码禁止 console.*，开发期降级为警告
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // 降级严格规则
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-unused-expressions': 'warn',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-unsafe-function-type': 'off',
    'no-empty': ['warn', { allowEmptyCatch: true }],
    'no-case-declarations': 'off',
    // 质量阈值（当前以 warn 运行）
    'complexity': ['warn', 20],
    'max-depth': ['warn', 3],
    'max-params': ['warn', 5],
    'max-statements': ['warn', 50],
    'max-lines-per-function': ['warn', { max: 120, skipBlankLines: true, skipComments: true }],
    'max-lines': ['warn', { max: 900, skipBlankLines: true, skipComments: true }],
    'prettier/prettier': ['warn'],
    // 架构边界
    'boundaries/element-types': ['warn', {
      default: 'disallow',
      message: 'Import violates project boundaries',
      rules: [
        { from: 'views', allow: ['components', 'stores', 'services', 'utils', 'router', 'types', 'composables', 'styles', 'appshell', 'examples'] },
        { from: 'components', allow: ['components', 'utils', 'services', 'types', 'composables', 'styles', 'examples'] },
        { from: 'components', disallow: ['views'] },
        { from: 'stores', allow: ['utils', 'services', 'types', 'composables'] },
        { from: 'stores', disallow: ['views', 'components'] },
        { from: 'services', allow: ['utils', 'types'] },
        { from: 'services', disallow: ['views', 'components', 'stores', 'router'] },
        { from: 'router', allow: ['views', 'components', 'utils', 'types', 'appshell'] },
        { from: 'utils', disallow: ['views', 'components', 'stores', 'router', 'services'] },
        { from: 'types', disallow: ['views', 'components', 'stores', 'router', 'services'] },
        { from: 'composables', allow: ['utils', 'types', 'composables'], disallow: ['views'] },
        { from: 'lowcode', allow: ['lowcode'] },
        { from: 'examples', allow: ['components', 'utils', 'types', 'composables', 'services'] },
        { from: 'appshell', disallow: ['views', 'components', 'stores', 'router', 'services', 'utils'] }
      ]
    }]
  },
  overrides: [
    {
      files: ['src/lowcode/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-function-type': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        'no-empty': 'warn',
        'no-case-declarations': 'off',
        'no-console': ['warn', { allow: ['warn', 'error'] }]
      }
    },
    {
      files: ['src/utils/logging/**/*.ts', 'src/main.ts'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        'no-case-declarations': 'off',
        'no-console': ['warn', { allow: ['warn', 'error'] }]
      }
    },
    {
      files: ['src/**/*.test.ts', 'src/**/__tests__/**/*.ts', 'src/examples/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        'no-global-assign': 'off'
      }
    },
    {
      files: ['src/stores/modules/auth.ts'],
      rules: {
        'no-useless-catch': 'warn'
      }
    }
  ]
}


