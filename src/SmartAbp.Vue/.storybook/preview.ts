/**
 * Storybook Preview Configuration
 * Advanced UI Component Library - Phase 3 Week 4
 * Global decorators, parameters, and component setup
 */

import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import { app } from '@storybook/vue3'

// Element Plus setup
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Vue ecosystem
import { createPinia } from 'pinia'

// Custom styles
import '../src/styles/main.scss'
import '../src/styles/storybook.scss'

// Setup Vue application
setup((app) => {
  // Install Element Plus
  app.use(ElementPlus)
  
  // Register Element Plus icons
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  
  // Install Pinia for state management
  app.use(createPinia())
  
  // Global properties for Storybook
  app.config.globalProperties.$STORYBOOK = true
})

// Global decorators
const withElementPlus = (story: any) => ({
  components: { story },
  template: `
    <el-config-provider :locale="locale">
      <div id="storybook-root">
        <story />
      </div>
    </el-config-provider>
  `,
  data() {
    return {
      locale: null // Will use default locale
    }
  }
})

const withTheme = (story: any, context: any) => {
  const theme = context.globals.theme || 'light'
  
  return {
    components: { story },
    template: `
      <div class="storybook-wrapper" :class="themeClass">
        <story />
      </div>
    `,
    computed: {
      themeClass() {
        return {
          'theme-light': theme === 'light',
          'theme-dark': theme === 'dark',
          'theme-auto': theme === 'auto'
        }
      }
    },
    mounted() {
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', theme)
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }
}

const withResponsiveViewport = (story: any, context: any) => {
  const viewport = context.globals.viewport || 'desktop'
  
  return {
    components: { story },
    template: `
      <div class="viewport-container" :class="viewportClass">
        <story />
      </div>
    `,
    computed: {
      viewportClass() {
        return `viewport-${viewport}`
      }
    }
  }
}

const withPerformanceMonitoring = (story: any) => {
  return {
    components: { story },
    template: `
      <div>
        <div v-if="showPerformanceInfo" class="performance-info">
          <span>Render Time: {{ renderTime }}ms</span>
          <span>Memory: {{ memoryUsage }}MB</span>
        </div>
        <story @hook:mounted="onMounted" />
      </div>
    `,
    data() {
      return {
        showPerformanceInfo: false,
        renderTime: 0,
        memoryUsage: 0,
        startTime: 0
      }
    },
    created() {
      this.startTime = performance.now()
    },
    mounted() {
      this.renderTime = Math.round(performance.now() - this.startTime)
      this.memoryUsage = performance.memory 
        ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024 * 100) / 100
        : 0
      
      // Show performance info for 3 seconds
      this.showPerformanceInfo = true
      setTimeout(() => {
        this.showPerformanceInfo = false
      }, 3000)
    },
    methods: {
      onMounted() {
        console.log('Component mounted in Storybook')
      }
    }
  }
}

// Main preview configuration
const preview: Preview = {
  // Global decorators
  decorators: [
    withElementPlus,
    withTheme,
    withResponsiveViewport,
    withPerformanceMonitoring
  ],

  // Global parameters
  parameters: {
    // Actions configuration
    actions: { 
      argTypesRegex: '^on[A-Z].*',
      handles: ['mouseover', 'click', 'change', 'input']
    },
    
    // Controls configuration
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      },
      expanded: true,
      sort: 'requiredFirst'
    },
    
    // Documentation configuration
    docs: {
      extractComponentDescription: (component: any, { notes }: any) => {
        if (notes) {
          return typeof notes === 'string' ? notes : notes.markdown || notes.text
        }
        return null
      },
      source: {
        language: 'html',
        format: 'dedent'
      }
    },

    // Viewport configuration
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px'
          }
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px'
          }
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1200px',
            height: '800px'
          }
        },
        large: {
          name: 'Large Desktop',
          styles: {
            width: '1440px',
            height: '900px'
          }
        }
      },
      defaultViewport: 'desktop'
    },

    // Background configuration
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff'
        },
        {
          name: 'dark',
          value: '#1e1e1e'
        },
        {
          name: 'gray',
          value: '#f5f5f5'
        }
      ]
    },

    // Layout configuration
    layout: 'padded',

    // Options configuration
    options: {
      storySort: {
        method: 'alphabetical',
        order: [
          'Introduction',
          'Design System',
          ['Colors', 'Typography', 'Spacing', 'Icons'],
          'Components',
          [
            'Basic',
            ['AdvancedTable', 'AdvancedForm'],
            'Data',
            ['AdvancedChart', 'AdvancedTree', 'AdvancedUpload'],
            'Layout',
            ['AdvancedLayout', 'AdvancedNavigation', 'AdvancedPanel']
          ],
          'Examples',
          'Testing'
        ],
        includeName: true
      }
    }
  },

  // Global args
  args: {
    // Default component props
  },

  // Global arg types
  argTypes: {
    // Common prop types
    size: {
      control: { type: 'select' },
      options: ['small', 'default', 'large']
    },
    type: {
      control: { type: 'select' },
      options: ['primary', 'success', 'warning', 'danger', 'info', 'text']
    },
    disabled: {
      control: { type: 'boolean' }
    },
    loading: {
      control: { type: 'boolean' }
    }
  },

  // Global types
  globals: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', icon: 'sun', title: 'Light theme' },
          { value: 'dark', icon: 'moon', title: 'Dark theme' },
          { value: 'auto', icon: 'circle', title: 'Auto theme' }
        ],
        dynamicTitle: true
      }
    },
    locale: {
      description: 'Internationalization locale',
      defaultValue: 'zh-CN',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          { value: 'zh-CN', title: '中文' },
          { value: 'en-US', title: 'English' },
          { value: 'ja-JP', title: '日本語' }
        ],
        dynamicTitle: true
      }
    },
    performanceMode: {
      description: 'Show performance monitoring',
      defaultValue: false,
      toolbar: {
        title: 'Performance',
        icon: 'timer',
        items: [
          { value: false, title: 'Off' },
          { value: true, title: 'On' }
        ]
      }
    }
  },

  // Initialize function
  initialGlobals: {
    theme: 'light',
    locale: 'zh-CN',
    performanceMode: false
  }
}

export default preview