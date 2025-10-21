import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import { resolve } from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [vue(), vueJsx()],
  test: {
    // ⚠️  禁用全局变量，避免与Playwright的expect冲突
    globals: false,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "src/**/*.{js,ts,vue}",
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
      exclude: ["node_modules/**", "dist/**", "src/test/**", "**/*.d.ts"],
    },
    include: [
      "src/**/*.{test,spec}.{js,ts,jsx,tsx}",
      "packages/**/*.{test,spec}.{js,ts,jsx,tsx}",
      "tests/**/*.{test,spec}.{js,ts,jsx,tsx}",
    ],
    exclude: ["node_modules", "dist"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@components": resolve(__dirname, "src/components"),
      "@stores": resolve(__dirname, "src/stores"),
      "@utils": resolve(__dirname, "src/utils"),
      "@assets": resolve(__dirname, "src/assets"),
      // 📦 支持子路径导入（如 @smartabp/lowcode-shared/theme）
      "@smartabp/lowcode-shared": resolve(__dirname, "packages/lowcode-shared/src"),
      "@smartabp/lowcode-core": resolve(__dirname, "packages/lowcode-core/src"),
      "@smartabp/lowcode-api": resolve(__dirname, "packages/lowcode-api/src"),
      "@smartabp/lowcode-tools": resolve(__dirname, "packages/lowcode-tools/src"),
      "@smartabp/lowcode-designer": resolve(__dirname, "packages/lowcode-designer/src"),
    },
  },
})
