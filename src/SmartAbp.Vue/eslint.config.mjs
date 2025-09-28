/* globals process */
import js from "@eslint/js"
import pluginVue from "eslint-plugin-vue"
import tsPlugin from "@typescript-eslint/eslint-plugin"
import vueParser from "vue-eslint-parser"
import tsParser from "@typescript-eslint/parser"
import globals from "globals"

export default [
  {
    ignores: ["node_modules/**", "dist/**", "eslint.config.mjs", "**/*.vue.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
  },
  ...pluginVue.configs["flat/recommended"],
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx,vue}"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2020,
        sourceType: "module",
        tsconfigRootDir: process.cwd(),
        extraFileExtensions: [".vue"],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      vue: pluginVue,
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "no-unused-vars": "off",
      "no-console": "off",
      "no-empty": ["error", { allowEmptyCatch: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // Typed rule disabled to avoid parserOptions.project requirement in monorepo
      "@typescript-eslint/no-floating-promises": "off",
      "vue/html-self-closing": ["error", { html: { void: "always" } }],
      "vue/multi-word-component-names": "off",
      // 禁用已弃用的过滤器规则，以避免对 Vue 3 代码的误报
      "vue/no-deprecated-filter": "off",
    },
  },
  {
    files: ["cypress/**/*.{cy.ts,ts}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        cy: "readonly",
        describe: "readonly",
        it: "readonly",
        beforeEach: "readonly",
        expect: "readonly",
      },
    },
  },
  {
    // Ignore known generated/legacy artifacts
    ignores: [
      "src/appshell/lifecycle.generated.ts",
      "src/components/icons/**",
      "src/views/CodeGenerator/Dashboard.vue",
    ],
  },
  {
    // 完全禁用对 .d.ts 文件的未使用变量检查
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
]
