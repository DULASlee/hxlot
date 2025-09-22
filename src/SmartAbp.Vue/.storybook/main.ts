import { createRequire } from "node:module";
import { dirname, join } from "node:path";
/**
 * Storybook Main Configuration
 * Advanced UI Component Library - Phase 3 Week 4
 * Interactive documentation and component playground
 */

import type { StorybookConfig } from "@storybook/vue3-vite"
import { mergeConfig } from "vite"

const require = createRequire(import.meta.url);

const config: StorybookConfig = {
  // Story file patterns
  stories: [
    "../packages/lowcode-designer/src/components/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../packages/lowcode-designer/src/components/**/*.story.@(js|jsx|ts|tsx)",
    "../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../docs/**/*.stories.mdx",
  ],

  // Storybook addons
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-design-tokens"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("storybook-addon-vue-mdx"),
    getAbsolutePath("storybook-addon-pseudo-states")
  ],

  framework: {
    name: getAbsolutePath("@storybook/vue3-vite"),
    options: {
      docgen: "vue-component-meta", // Enhanced prop extraction
    },
  },

  // TypeScript configuration
  typescript: {
    check: false,
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },

  // Documentation configuration
  docs: {
    defaultName: "Documentation"
  },

  // Vite configuration customization
  async viteFinal(config) {
    return mergeConfig(config, {
      // Resolve aliases
      resolve: {
        alias: {
          "@": new URL("../src", import.meta.url).pathname,
          "@components": new URL("../packages/lowcode-designer/src/components", import.meta.url)
            .pathname,
          "@utils": new URL("../src/utils", import.meta.url).pathname,
          "@styles": new URL("../src/styles", import.meta.url).pathname,
        },
      },

      // Define environment variables
      define: {
        __STORYBOOK__: true,
        global: "globalThis",
      },

      // CSS processing
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: `
              @import "@/styles/variables.scss";
              @import "@/styles/mixins.scss";
            `,
          },
        },
      },

      // Optimization for Storybook
      optimizeDeps: {
        include: [
          "@storybook/addon-essentials",
          "storybook/actions",
          "storybook/internal/controls",
          "element-plus",
          "echarts",
        ],
      },

      // Build configuration
      build: {
        rollupOptions: {
          external: [],
          output: {
            globals: {},
          },
        },
      },
    })
  },

  // Core configuration
  core: {
    disableTelemetry: true,
  },

  // Features configuration
  features: {
    previewMdx2: true,
    argTypeTargetsV7: true,
    warnOnLegacyHierarchySeparator: false,
  },

  // Static directories
  staticDirs: ["../public", "../src/assets"],

  // Environment variables
  env: (config) => ({
    ...config,
    STORYBOOK_MODE: "true",
    NODE_ENV: "development",
  }),

  // Experimental features
  experimental: {
    rsbBuild: false,
  },
}

export default config

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
