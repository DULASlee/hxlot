import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import { resolve } from "path"

export default defineConfig({
  plugins: [vue(), vueJsx()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
<<<<<<< HEAD
        // 阶段3高级UI组件库覆盖率监控
        "packages/lowcode-designer/src/components/**",
=======
>>>>>>> 5654f8f (阶段2高性能缓存架构增强：实现分布式权限缓存锁、缓存预热服务和性能优化)
        // TDD权限引擎覆盖率监控
        "packages/lowcode-core/src/plugins/**",
        "packages/lowcode-core/src/permissions/**",
        // 原有低代码组件覆盖率
        "packages/lowcode-designer/src/utils/uiConfigMapper.ts",
      ],
      thresholds: {
<<<<<<< HEAD
        statements: 90, // 阶段3 TDD铁律：≥90%覆盖率
        branches: 85,
        functions: 90,
        lines: 90,
=======
        statements: 80, // TDD铁律：≥80%覆盖率
        branches: 80,
        functions: 80,
        lines: 80,
>>>>>>> 5654f8f (阶段2高性能缓存架构增强：实现分布式权限缓存锁、缓存预热服务和性能优化)
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
