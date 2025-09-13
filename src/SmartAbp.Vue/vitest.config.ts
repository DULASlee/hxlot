import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import { resolve } from "path"

export default defineConfig({
  plugins: [vue(), vueJsx()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        statements: 20,
        branches: 60,
        functions: 60,
        lines: 20,
      },
      exclude: ["node_modules/**", "dist/**", "src/test/**", "**/*.d.ts"],
    },
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
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
