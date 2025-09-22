/* eslint-disable */
/* 临时禁用 ESLint，规避 tsconfigRootDir 路径推断问题 */
import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:11369",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    videosFolder: "cypress/videos",
    screenshotsFolder: "cypress/screenshots",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false, // Disable video recording for faster tests
    screenshotOnRunFailure: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    env: {
      // Advanced UI Component testing environment variables
      COMPONENT_TEST_MODE: true,
      PERFORMANCE_THRESHOLD_MS: 1000,
      ACCESSIBILITY_ENABLED: true,
    },
    setupNodeEvents(on, config) {
      // Advanced UI Component testing node events
      on("task", {
        // Performance measurement task
        measurePerformance: ({ name, duration }) => {
          console.log(`Performance [${name}]: ${duration}ms`)
          return null
        },

        // Accessibility audit task
        accessibilityAudit: ({ violations }) => {
          console.log(`Accessibility violations:`, violations)
          return null
        },
      })

      // Memory leak detection
      on("before:browser:launch", (browser, launchOptions) => {
        if (browser.name === "chrome") {
          launchOptions.args.push("--memory-pressure-off")
          launchOptions.args.push("--max_old_space_size=4096")
        }
        return launchOptions
      })

      return config
    },
  },

  component: {
    devServer: {
      framework: "vue",
      bundler: "vite",
    },
    specPattern: "src/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/component.ts",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,

    // Advanced component testing configuration
    env: {
      COMPONENT_TESTING: true,
      TDD_MODE: true,
      EXPERT_MODE: true,
    },

    setupNodeEvents(on, config) {
      // Component-specific testing setup
      on("task", {
        // Component performance profiling
        profileComponent: ({ componentName, metrics }) => {
          console.log(`Component Performance [${componentName}]:`, metrics)
          return null
        },
      })

      return config
    },
  },

  // Global configuration for Phase 3 Advanced UI Components
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 10000,
  pageLoadTimeout: 30000,

  // Experimental features for advanced testing
  experimentalStudio: true,
  experimentalWebKitSupport: true,
})
