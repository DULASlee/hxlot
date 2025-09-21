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
        // TDD高级权限引擎覆盖率监控（专家模式）
        "packages/lowcode-core/src/advanced-permissions/**",
        // TDD权限引擎覆盖率监控
        "packages/lowcode-core/src/plugins/**",
        "packages/lowcode-core/src/permissions/**",
        // 高级UI组件库覆盖率监控
        "packages/lowcode-designer/src/components/**",
        // 原有低代码组件覆盖率
        "packages/lowcode-designer/src/utils/uiConfigMapper.ts",
        // Zod模式验证覆盖率
        "packages/lowcode-designer/src/utils/zod-schemas.ts"
      ],
      thresholds: {
        statements: 95, // 🔥 专家模式TDD铁律：≥95%覆盖率
        branches: 90,   // 🔥 专家模式分支覆盖率：≥90%
        functions: 95,  // 🔥 专家模式函数覆盖率：≥95%
        lines: 95,      // 🔥 专家模式行覆盖率：≥95%
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