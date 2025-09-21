import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import { resolve } from "path"

export default defineConfig({
  plugins: [vue(), vueJsx()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        // 阶段3高级UI组件库覆盖率监控
        "packages/lowcode-designer/src/components/**",
        // TDD权限引擎覆盖率监控
        "packages/lowcode-core/src/plugins/**",
        "packages/lowcode-core/src/permissions/**",
        // 原有低代码组件覆盖率
        "packages/lowcode-designer/src/utils/uiConfigMapper.ts",
        // Zod模式验证覆盖率
        "packages/lowcode-designer/src/utils/zod-schemas.ts"
      ],
      thresholds: {
        statements: 85, // 平衡阶段2和阶段3的要求
        branches: 80,
        functions: 85,
        lines: 85,
      },
      exclude: ["node_modules/**", "dist/**", "src/test/**", "**/*.d.ts"],
    },
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}", "packages/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: ["node_modules", "dist"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@components": resolve(__dirname, "src/components"),
      "@stores": resolve(__dirname, "src/stores"),
      "@utils": resolve(__dirname, "src/utils"),
      "@assets": resolve(__dirname, "src/assets"),
      "@smartabp/lowcode-core": resolve(__dirname, "packages/lowcode-core/src"),
      "@smartabp/lowcode-designer": resolve(__dirname, "packages/lowcode-designer/src"),
      "@smartabp/lowcode-codegen": resolve(__dirname, "packages/lowcode-codegen/src"),
      "@smartabp/lowcode-api": resolve(__dirname, "packages/lowcode-api/src"),
      "@smartabp/lowcode-ui-vue": resolve(__dirname, "packages/lowcode-ui-vue/src"),
    },
  },
})