const path = require('path')

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2020,
    sourceType: "module",
    project: [path.resolve(__dirname, './tsconfig.json')],
    tsconfigRootDir: path.resolve(__dirname)
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended"
  ],
  rules: {
    "no-console": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
}
