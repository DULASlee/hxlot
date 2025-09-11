const path = require('path')

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
    project: './tsconfig.json',
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
    // 代码质量阈值（先以 warn 运行，逐步收紧到 error）
    'complexity': ['warn', 10],
    'max-depth': ['warn', 3],
    'max-params': ['warn', 4],
    'max-statements': ['warn', 30],
    'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
    'max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
    'prettier/prettier': ['warn'],
    // Enforce architecture boundaries (refined)
    'boundaries/element-types': ['warn', {
      default: 'disallow',
      message: 'Import violates project boundaries',
      rules: [
        // views can consume presentation and domain-facing layers
        { from: 'views', allow: ['components', 'stores', 'services', 'utils', 'router', 'types', 'composables', 'styles', 'appshell', 'examples'] },
        // components cannot import views; can use utils/services/types/composables/styles
        { from: 'components', allow: ['components', 'utils', 'services', 'types', 'composables', 'styles', 'examples'] },
        { from: 'components', disallow: ['views'] },
        // stores should not depend on views/components; can use utils/services/types
        { from: 'stores', allow: ['utils', 'services', 'types', 'composables'] },
        { from: 'stores', disallow: ['views', 'components'] },
        // services are low-level, only utils/types
        { from: 'services', allow: ['utils', 'types'] },
        { from: 'services', disallow: ['views', 'components', 'stores', 'router'] },
        // router can reference views (route components), utils/types and appshell generated routes
        { from: 'router', allow: ['views', 'components', 'utils', 'types', 'appshell'] },
        // utils/types/composables are leaf-like; disallow importing from higher layers
        { from: 'utils', disallow: ['views', 'components', 'stores', 'router', 'services'] },
        { from: 'types', disallow: ['views', 'components', 'stores', 'router', 'services'] },
        { from: 'composables', allow: ['utils', 'types', 'composables'], disallow: ['views'] },
        // lowcode isolation: only lowcode internal, no app imports; app can import lowcode public index
        { from: 'lowcode', allow: ['lowcode'] },
        { from: 'examples', allow: ['components', 'utils', 'types', 'composables', 'services'] },
        // appshell can be imported but should not import back into app
        { from: 'appshell', disallow: ['views', 'components', 'stores', 'router', 'services', 'utils'] }
      ]
    }]
  }
}


