/**
 * Storybook Main Configuration
 * Advanced UI Component Library - Phase 3 Week 4
 * Interactive documentation and component playground
 */

import type { StorybookConfig } from '@storybook/vue3-vite'
import { mergeConfig } from 'vite'

const config: StorybookConfig = {
  // Story file patterns
  stories: [
    '../packages/lowcode-designer/src/components/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../packages/lowcode-designer/src/components/**/*.story.@(js|jsx|ts|tsx)',
    '../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../docs/**/*.stories.mdx'
  ],

  // Storybook addons
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-controls',
    '@storybook/addon-actions',
    '@storybook/addon-viewport',
    '@storybook/addon-backgrounds',
    '@storybook/addon-toolbars',
    '@storybook/addon-measure',
    '@storybook/addon-outline',
    '@storybook/addon-docs',
    '@storybook/addon-storysource',
    '@storybook/addon-a11y', // Accessibility testing
    '@storybook/addon-design-tokens',
    '@chromatic-com/storybook', // Visual testing
    'storybook-addon-vue-mdx',
    'storybook-addon-pseudo-states'
  ],

  framework: {
    name: '@storybook/vue3-vite',
    options: {
      docgen: 'vue-component-meta' // Enhanced prop extraction
    }
  },

  // TypeScript configuration
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true)
    }
  },

  // Documentation configuration
  docs: {
    autodocs: 'tag',
    defaultName: 'Documentation'
  },

  // Vite configuration customization
  async viteFinal(config) {
    return mergeConfig(config, {
      // Resolve aliases
      resolve: {
        alias: {
          '@': new URL('../src', import.meta.url).pathname,
          '@components': new URL('../packages/lowcode-designer/src/components', import.meta.url).pathname,
          '@utils': new URL('../src/utils', import.meta.url).pathname,
          '@styles': new URL('../src/styles', import.meta.url).pathname
        }
      },

      // Define environment variables
      define: {
        __STORYBOOK__: true,
        global: 'globalThis'
      },

      // CSS processing
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: `
              @import "@/styles/variables.scss";
              @import "@/styles/mixins.scss";
            `
          }
        }
      },

      // Optimization for Storybook
      optimizeDeps: {
        include: [
          '@storybook/addon-essentials',
          '@storybook/addon-actions',
          '@storybook/addon-controls',
          'element-plus',
          'echarts'
        ]
      },

      // Build configuration
      build: {
        rollupOptions: {
          external: [],
          output: {
            globals: {}
          }
        }
      }
    })
  },

  // Core configuration
  core: {
    disableTelemetry: true
  },

  // Features configuration
  features: {
    previewMdx2: true,
    argTypeTargetsV7: true,
    warnOnLegacyHierarchySeparator: false
  },

  // Static directories
  staticDirs: [
    '../public',
    '../src/assets'
  ],

  // Environment variables
  env: (config) => ({
    ...config,
    STORYBOOK_MODE: 'true',
    NODE_ENV: 'development'
  }),

  // Experimental features
  experimental: {
    rsbBuild: false
  }
}

export default config