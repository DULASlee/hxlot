import { fileURLToPath } from 'node:url'
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'src/SmartAbp.Vue/packages/*',
  {
    test: {
      globals: true,
      environment: 'jsdom',
      deps: {
        optimizer: {
          web: {
            include: ['vitest-canvas-mock'],
          },
        },
      },
      environmentOptions: {
        jsdom: {
          resources: 'usable',
        },
      },
      setupFiles: ['./src/SmartAbp.Vue/tests/setup.ts'],
      include: ['./src/SmartAbp.Vue/tests/unit/**/*.test.ts'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src/SmartAbp.Vue/src', import.meta.url)),
      },
    },
  },
])
