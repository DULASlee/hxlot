/**
 * Performance Optimization Configuration
 * Advanced UI Component Library - Phase 3 Week 4
 * Component lazy loading, dynamic imports, and runtime performance optimizations
 */

import { defineAsyncComponent, Component } from 'vue'

// Performance monitoring configuration
export const performanceConfig = {
  // Core Web Vitals thresholds
  vitals: {
    LCP: 2.5, // Largest Contentful Paint (seconds)
    FID: 100, // First Input Delay (milliseconds) 
    CLS: 0.1, // Cumulative Layout Shift
    FCP: 1.5, // First Contentful Paint (seconds)
    TTFB: 800 // Time to First Byte (milliseconds)
  },

  // Component loading strategies
  loading: {
    strategy: 'progressive', // 'eager' | 'lazy' | 'progressive'
    chunkSize: 'medium', // 'small' | 'medium' | 'large'
    prefetchRoutes: true,
    preloadCritical: true
  },

  // Bundle splitting configuration
  bundles: {
    maxChunkSize: 500000, // 500KB
    minChunkSize: 20000,  // 20KB
    vendors: ['vue', 'element-plus', 'echarts'],
    commons: ['utils', 'constants', 'helpers']
  },

  // Caching strategies
  cache: {
    assets: 'immutable',
    api: 'stale-while-revalidate',
    components: 'cache-first'
  }
}

// Advanced component loader with performance monitoring
export class AdvancedComponentLoader {
  private loadingComponents = new Map<string, Promise<Component>>()
  private loadedComponents = new Map<string, Component>()
  private performanceMetrics = new Map<string, number>()

  // Create lazy loaded component with performance tracking
  createLazyComponent(
    componentName: string,
    importFunction: () => Promise<any>,
    options: {
      loadingComponent?: Component
      errorComponent?: Component
      delay?: number
      timeout?: number
      retries?: number
    } = {}
  ) {
    return defineAsyncComponent({
      loader: () => this.loadComponentWithMetrics(componentName, importFunction),
      loadingComponent: options.loadingComponent || this.createLoadingComponent(componentName),
      errorComponent: options.errorComponent || this.createErrorComponent(componentName),
      delay: options.delay || 200,
      timeout: options.timeout || 10000,
      onError: (error, retry, fail, attempts) => {
        const maxRetries = options.retries || 3
        if (attempts <= maxRetries) {
          console.warn(`Retrying component load: ${componentName} (${attempts}/${maxRetries})`)
          retry()
        } else {
          console.error(`Failed to load component: ${componentName}`, error)
          fail()
        }
      }
    })
  }

  private async loadComponentWithMetrics(
    componentName: string,
    importFunction: () => Promise<any>
  ): Promise<Component> {
    // Check cache first
    if (this.loadedComponents.has(componentName)) {
      return this.loadedComponents.get(componentName)!
    }

    // Check if already loading
    if (this.loadingComponents.has(componentName)) {
      return this.loadingComponents.get(componentName)!
    }

    // Start performance measurement
    const startTime = performance.now()
    performance.mark(`component-load-start-${componentName}`)

    const loadingPromise = importFunction()
      .then((module) => {
        // End performance measurement
        const endTime = performance.now()
        const loadTime = endTime - startTime
        
        performance.mark(`component-load-end-${componentName}`)
        performance.measure(
          `component-load-${componentName}`,
          `component-load-start-${componentName}`,
          `component-load-end-${componentName}`
        )

        // Store metrics
        this.performanceMetrics.set(componentName, loadTime)
        
        // Log performance if slow
        if (loadTime > 1000) {
          console.warn(`Slow component load detected: ${componentName} took ${loadTime.toFixed(2)}ms`)
        }

        const component = module.default || module
        this.loadedComponents.set(componentName, component)
        this.loadingComponents.delete(componentName)
        
        return component
      })
      .catch((error) => {
        this.loadingComponents.delete(componentName)
        throw error
      })

    this.loadingComponents.set(componentName, loadingPromise)
    return loadingPromise
  }

  private createLoadingComponent(componentName: string) {
    return {
      name: `Loading-${componentName}`,
      template: `
        <div class="component-loading" :data-component="${componentName}">
          <div class="loading-spinner"></div>
          <div class="loading-text">正在加载 ${componentName}...</div>
        </div>
      `,
      style: `
        .component-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          color: #666;
        }
        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #409eff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .loading-text {
          margin-top: 16px;
          font-size: 14px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `
    }
  }

  private createErrorComponent(componentName: string) {
    return {
      name: `Error-${componentName}`,
      template: `
        <div class="component-error" :data-component="${componentName}">
          <div class="error-icon">⚠️</div>
          <div class="error-text">
            <div class="error-title">组件加载失败</div>
            <div class="error-details">${componentName} 组件无法加载，请刷新页面重试</div>
          </div>
          <button class="retry-button" @click="$emit('retry')">重试</button>
        </div>
      `,
      emits: ['retry'],
      style: `
        .component-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          padding: 20px;
          border: 1px solid #f5f5f5;
          border-radius: 4px;
          background-color: #fafafa;
        }
        .error-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .error-text {
          text-align: center;
          margin-bottom: 20px;
        }
        .error-title {
          font-size: 16px;
          font-weight: bold;
          color: #e74c3c;
          margin-bottom: 8px;
        }
        .error-details {
          font-size: 14px;
          color: #666;
        }
        .retry-button {
          padding: 8px 16px;
          background-color: #409eff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .retry-button:hover {
          background-color: #66b3ff;
        }
      `
    }
  }

  // Get performance metrics
  getMetrics() {
    return Object.fromEntries(this.performanceMetrics)
  }

  // Clear cache
  clearCache() {
    this.loadedComponents.clear()
    this.loadingComponents.clear()
    this.performanceMetrics.clear()
  }
}

// Pre-configured lazy components for Advanced UI Library
export const componentLoader = new AdvancedComponentLoader()

// Advanced component definitions with lazy loading
export const AdvancedComponents = {
  // Core components - preload critical
  AdvancedTable: componentLoader.createLazyComponent(
    'AdvancedTable',
    () => import('@/packages/lowcode-designer/src/components/AdvancedTable/AdvancedTable.vue'),
    { delay: 0 } // Immediate for critical component
  ),

  AdvancedForm: componentLoader.createLazyComponent(
    'AdvancedForm', 
    () => import('@/packages/lowcode-designer/src/components/AdvancedForm/AdvancedForm.vue'),
    { delay: 0 }
  ),

  // Visualization components - lazy load
  AdvancedChart: componentLoader.createLazyComponent(
    'AdvancedChart',
    () => import('@/packages/lowcode-designer/src/components/AdvancedChart/AdvancedChart.vue'),
    { delay: 100 }
  ),

  // Layout components - progressive load
  AdvancedLayout: componentLoader.createLazyComponent(
    'AdvancedLayout',
    () => import('@/packages/lowcode-designer/src/components/AdvancedLayout/AdvancedLayout.vue'),
    { delay: 200 }
  ),

  AdvancedNavigation: componentLoader.createLazyComponent(
    'AdvancedNavigation',
    () => import('@/packages/lowcode-designer/src/components/AdvancedNavigation/AdvancedNavigation.vue'),
    { delay: 200 }
  ),

  AdvancedPanel: componentLoader.createLazyComponent(
    'AdvancedPanel',
    () => import('@/packages/lowcode-designer/src/components/AdvancedPanel/AdvancedPanel.vue'),
    { delay: 200 }
  ),

  // Heavy components - lazy load with longer delay
  AdvancedTree: componentLoader.createLazyComponent(
    'AdvancedTree',
    () => import('@/packages/lowcode-designer/src/components/AdvancedTree/AdvancedTree.vue'),
    { delay: 300, timeout: 15000 }
  ),

  AdvancedUpload: componentLoader.createLazyComponent(
    'AdvancedUpload',
    () => import('@/packages/lowcode-designer/src/components/AdvancedUpload/AdvancedUpload.vue'),
    { delay: 300, timeout: 15000 }
  )
}

// Performance monitoring utilities
export const PerformanceMonitor = {
  // Initialize Core Web Vitals monitoring
  initVitals() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Import web-vitals dynamically
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(this.onVitalMetric.bind(this))
        getFID(this.onVitalMetric.bind(this))
        getFCP(this.onVitalMetric.bind(this))
        getLCP(this.onVitalMetric.bind(this))
        getTTFB(this.onVitalMetric.bind(this))
      }).catch(console.error)
    }
  },

  // Handle vital metric reporting
  onVitalMetric(metric: any) {
    const threshold = performanceConfig.vitals[metric.name as keyof typeof performanceConfig.vitals]
    const isGood = metric.value <= threshold
    
    console.log(
      `%c${metric.name}: ${metric.value.toFixed(2)}${metric.name === 'CLS' ? '' : 'ms'} ${isGood ? '✅' : '❌'}`,
      `color: ${isGood ? 'green' : 'red'}; font-weight: bold;`
    )

    // Send to analytics if available
    if (window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        custom_parameter_1: metric.id,
        non_interaction: true
      })
    }
  },

  // Monitor component render performance
  measureComponentRender(componentName: string, renderFn: () => void) {
    const startTime = performance.now()
    performance.mark(`render-start-${componentName}`)
    
    renderFn()
    
    requestAnimationFrame(() => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      performance.mark(`render-end-${componentName}`)
      performance.measure(
        `render-${componentName}`,
        `render-start-${componentName}`,
        `render-end-${componentName}`
      )

      if (renderTime > 16) { // More than one frame
        console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`)
      }
    })
  },

  // Get all performance entries
  getPerformanceEntries() {
    if (typeof window === 'undefined' || !window.performance) {
      return {}
    }

    const entries = performance.getEntriesByType('measure')
    const componentEntries = entries.filter(entry => 
      entry.name.startsWith('component-load-') || entry.name.startsWith('render-')
    )

    return componentEntries.reduce((acc, entry) => {
      acc[entry.name] = entry.duration
      return acc
    }, {} as Record<string, number>)
  },

  // Clear performance entries
  clearEntries() {
    if (typeof window !== 'undefined' && window.performance) {
      performance.clearMeasures()
      performance.clearMarks()
    }
  }
}

// Resource optimization utilities
export const ResourceOptimizer = {
  // Preload critical resources
  preloadCriticalResources() {
    const criticalResources = [
      '/fonts/element-icons.woff2',
      '/css/element-plus.css',
      '/js/vue.js'
    ]

    criticalResources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource
      link.as = this.getResourceType(resource)
      document.head.appendChild(link)
    })
  },

  // Prefetch non-critical resources
  prefetchResources() {
    const prefetchResources = [
      () => import('@/packages/lowcode-designer/src/components/AdvancedChart/AdvancedChart.vue'),
      () => import('@/packages/lowcode-designer/src/components/AdvancedTree/AdvancedTree.vue'),
      () => import('@/packages/lowcode-designer/src/components/AdvancedUpload/AdvancedUpload.vue')
    ]

    // Prefetch when browser is idle
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        prefetchResources.forEach(importFn => {
          importFn().catch(() => {}) // Silent fail for prefetch
        })
      })
    }
  },

  getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'woff':
      case 'woff2':
      case 'ttf':
        return 'font'
      case 'css':
        return 'style'
      case 'js':
        return 'script'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
        return 'image'
      default:
        return 'fetch'
    }
  }
}

// Bundle optimization utilities
export const BundleOptimizer = {
  // Analyze bundle composition
  analyzeBundles() {
    if (process.env.NODE_ENV === 'development') {
      console.log('Bundle analysis available in production build only')
      return
    }

    // This would be populated by webpack-bundle-analyzer
    const bundleInfo = window.__WEBPACK_BUNDLE_INFO__ || {}
    console.table(bundleInfo)
  },

  // Check for duplicate dependencies
  checkDuplicates() {
    if (typeof window === 'undefined') return

    const modules = window.__webpack_require__?.cache || {}
    const moduleNames = Object.keys(modules)
    const duplicates = new Map<string, string[]>()

    moduleNames.forEach(name => {
      const baseName = name.replace(/\?.*$/, '').replace(/\/index\.(js|ts|vue)$/, '')
      if (!duplicates.has(baseName)) {
        duplicates.set(baseName, [])
      }
      duplicates.get(baseName)!.push(name)
    })

    const actualDuplicates = Array.from(duplicates.entries())
      .filter(([_, instances]) => instances.length > 1)

    if (actualDuplicates.length > 0) {
      console.warn('Duplicate modules detected:', actualDuplicates)
    }
  }
}

// Export performance configuration as default
export default {
  performanceConfig,
  AdvancedComponentLoader,
  componentLoader,
  AdvancedComponents,
  PerformanceMonitor,
  ResourceOptimizer,
  BundleOptimizer
}