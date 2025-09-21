/**
 * Performance Test Setup and Utilities
 * Advanced UI Component Library - Phase 3 Week 4
 */

import { beforeEach, afterEach, expect } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { performanceThresholds } from './performance.config'

// Global performance monitoring setup
let performanceObserver: PerformanceObserver | null = null
let memoryBaseline: number = 0
let renderStartTime: number = 0

// Setup performance monitoring before each test
beforeEach(() => {
  // Record memory baseline
  if (performance.memory) {
    memoryBaseline = performance.memory.usedJSHeapSize
  }

  // Clear previous performance entries
  if (performance.clearMarks) performance.clearMarks()
  if (performance.clearMeasures) performance.clearMeasures()

  // Setup performance observer
  if (typeof PerformanceObserver !== 'undefined') {
    performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (entry.entryType === 'measure' && entry.name.startsWith('test-')) {
          console.log(`Performance: ${entry.name} took ${entry.duration.toFixed(2)}ms`)
        }
      })
    })
    performanceObserver.observe({ entryTypes: ['measure'] })
  }

  // Mark test start
  if (performance.mark) {
    performance.mark('test-start')
  }
})

// Cleanup after each test
afterEach(() => {
  // Stop performance observer
  if (performanceObserver) {
    performanceObserver.disconnect()
    performanceObserver = null
  }

  // Mark test end and measure
  if (performance.mark && performance.measure) {
    performance.mark('test-end')
    performance.measure('test-duration', 'test-start', 'test-end')
  }
})

// Performance testing utilities
export class PerformanceTestUtils {
  
  /**
   * Measure component render time
   */
  static async measureRenderTime(
    component: any, 
    props: any = {}, 
    options: any = {}
  ): Promise<{ duration: number; wrapper: VueWrapper<any> }> {
    const startTime = performance.now()
    
    if (performance.mark) {
      performance.mark('render-start')
    }
    
    const wrapper = mount(component, {
      props,
      ...options
    })
    
    // Wait for Vue to complete rendering
    await nextTick()
    await wrapper.vm.$nextTick()
    
    if (performance.mark) {
      performance.mark('render-end')
      performance.measure('render-duration', 'render-start', 'render-end')
    }
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    return { duration, wrapper }
  }

  /**
   * Measure component mount and unmount performance
   */
  static async measureMountUnmountTime(
    component: any,
    props: any = {},
    iterations: number = 10
  ): Promise<{ mountTime: number; unmountTime: number; avgMountTime: number; avgUnmountTime: number }> {
    const mountTimes: number[] = []
    const unmountTimes: number[] = []

    for (let i = 0; i < iterations; i++) {
      // Measure mount time
      const mountStart = performance.now()
      const wrapper = mount(component, { props })
      await nextTick()
      const mountEnd = performance.now()
      mountTimes.push(mountEnd - mountStart)

      // Measure unmount time
      const unmountStart = performance.now()
      wrapper.unmount()
      const unmountEnd = performance.now()
      unmountTimes.push(unmountEnd - unmountStart)
    }

    return {
      mountTime: Math.max(...mountTimes),
      unmountTime: Math.max(...unmountTimes),
      avgMountTime: mountTimes.reduce((sum, time) => sum + time, 0) / mountTimes.length,
      avgUnmountTime: unmountTimes.reduce((sum, time) => sum + time, 0) / unmountTimes.length
    }
  }

  /**
   * Measure memory usage during component lifecycle
   */
  static async measureMemoryUsage(
    component: any,
    props: any = {},
    iterations: number = 5
  ): Promise<{ baseline: number; peak: number; final: number; leaked: number }> {
    if (!performance.memory) {
      return { baseline: 0, peak: 0, final: 0, leaked: 0 }
    }

    const baseline = performance.memory.usedJSHeapSize
    let peak = baseline
    const wrappers: VueWrapper<any>[] = []

    // Create multiple instances to stress test memory
    for (let i = 0; i < iterations; i++) {
      const wrapper = mount(component, { props })
      await nextTick()
      wrappers.push(wrapper)
      
      const current = performance.memory.usedJSHeapSize
      if (current > peak) peak = current
    }

    // Force garbage collection if available
    if ((global as any).gc) {
      (global as any).gc()
    }

    // Unmount all instances
    wrappers.forEach(wrapper => wrapper.unmount())
    
    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if ((global as any).gc) {
      (global as any).gc()
    }

    const final = performance.memory.usedJSHeapSize
    const leaked = final - baseline

    return { baseline, peak, final, leaked }
  }

  /**
   * Benchmark component with large datasets
   */
  static async benchmarkWithDataset(
    component: any,
    generateData: (size: number) => any,
    sizes: number[] = [100, 500, 1000, 5000]
  ): Promise<Array<{ size: number; renderTime: number; memoryUsage: number }>> {
    const results = []

    for (const size of sizes) {
      const data = generateData(size)
      const { duration } = await this.measureRenderTime(component, { data })
      const { peak, baseline } = await this.measureMemoryUsage(component, { data })
      
      results.push({
        size,
        renderTime: duration,
        memoryUsage: peak - baseline
      })
    }

    return results
  }

  /**
   * Stress test component with rapid operations
   */
  static async stressTest(
    component: any,
    operations: Array<() => Promise<void>>,
    iterations: number = 100
  ): Promise<{ avgOperationTime: number; maxOperationTime: number; errors: number }> {
    const wrapper = mount(component)
    await nextTick()

    const operationTimes: number[] = []
    let errors = 0

    for (let i = 0; i < iterations; i++) {
      for (const operation of operations) {
        try {
          const start = performance.now()
          await operation()
          const end = performance.now()
          operationTimes.push(end - start)
        } catch (error) {
          errors++
          console.warn('Stress test operation failed:', error)
        }
      }
    }

    wrapper.unmount()

    return {
      avgOperationTime: operationTimes.reduce((sum, time) => sum + time, 0) / operationTimes.length,
      maxOperationTime: Math.max(...operationTimes),
      errors
    }
  }

  /**
   * Validate performance meets thresholds
   */
  static validatePerformance(
    results: { renderTime?: number; memoryUsage?: number; bundleSize?: number },
    componentType: 'simple' | 'complex' | 'large' = 'simple'
  ) {
    if (results.renderTime !== undefined) {
      expect(
        results.renderTime,
        `Component render time ${results.renderTime.toFixed(2)}ms exceeds threshold ${performanceThresholds.render[componentType]}ms`
      ).toBeLessThan(performanceThresholds.render[componentType])
    }

    if (results.memoryUsage !== undefined) {
      const memoryThreshold = performanceThresholds.memory.component * 1024 * 1024 // Convert MB to bytes
      expect(
        results.memoryUsage,
        `Component memory usage ${(results.memoryUsage / 1024 / 1024).toFixed(2)}MB exceeds threshold ${performanceThresholds.memory.component}MB`
      ).toBeLessThan(memoryThreshold)
    }

    if (results.bundleSize !== undefined) {
      const bundleThreshold = performanceThresholds.bundle.component * 1024 // Convert KB to bytes
      expect(
        results.bundleSize,
        `Component bundle size ${(results.bundleSize / 1024).toFixed(2)}KB exceeds threshold ${performanceThresholds.bundle.component}KB`
      ).toBeLessThan(bundleThreshold)
    }
  }

  /**
   * Profile component performance over time
   */
  static async profilePerformance(
    component: any,
    props: any = {},
    duration: number = 5000, // 5 seconds
    sampleInterval: number = 100 // 100ms
  ): Promise<Array<{ timestamp: number; memory: number; renderTime: number }>> {
    const profile: Array<{ timestamp: number; memory: number; renderTime: number }> = []
    const startTime = Date.now()
    
    const wrapper = mount(component, { props })
    await nextTick()

    const interval = setInterval(async () => {
      const timestamp = Date.now() - startTime
      
      // Measure current memory
      const memory = performance.memory ? performance.memory.usedJSHeapSize : 0
      
      // Measure render time by triggering re-render
      const renderStart = performance.now()
      wrapper.vm.$forceUpdate()
      await nextTick()
      const renderTime = performance.now() - renderStart
      
      profile.push({ timestamp, memory, renderTime })
      
      if (timestamp >= duration) {
        clearInterval(interval)
      }
    }, sampleInterval)

    return new Promise((resolve) => {
      setTimeout(() => {
        clearInterval(interval)
        wrapper.unmount()
        resolve(profile)
      }, duration + 100)
    })
  }
}

// Performance assertion helpers
export const performanceMatchers = {
  toRenderFasterThan: (received: number, expected: number) => {
    const pass = received < expected
    return {
      message: () => 
        `expected component to render ${pass ? 'slower' : 'faster'} than ${expected}ms, but took ${received.toFixed(2)}ms`,
      pass
    }
  },

  toUseLessMemoryThan: (received: number, expected: number) => {
    const pass = received < expected
    const receivedMB = received / 1024 / 1024
    const expectedMB = expected / 1024 / 1024
    return {
      message: () =>
        `expected component to use ${pass ? 'more' : 'less'} memory than ${expectedMB.toFixed(2)}MB, but used ${receivedMB.toFixed(2)}MB`,
      pass
    }
  },

  toHaveGoodPerformance: (
    received: { renderTime: number; memoryUsage: number },
    componentType: 'simple' | 'complex' | 'large' = 'simple'
  ) => {
    const renderThreshold = performanceThresholds.render[componentType]
    const memoryThreshold = performanceThresholds.memory.component * 1024 * 1024
    
    const renderPass = received.renderTime < renderThreshold
    const memoryPass = received.memoryUsage < memoryThreshold
    const pass = renderPass && memoryPass
    
    return {
      message: () => {
        const issues = []
        if (!renderPass) {
          issues.push(`render time ${received.renderTime.toFixed(2)}ms > ${renderThreshold}ms`)
        }
        if (!memoryPass) {
          issues.push(`memory usage ${(received.memoryUsage / 1024 / 1024).toFixed(2)}MB > ${performanceThresholds.memory.component}MB`)
        }
        return `expected component to have good performance, but: ${issues.join(', ')}`
      },
      pass
    }
  }
}

// Extend expect with custom matchers
expect.extend(performanceMatchers)

// Benchmark utilities for specific component types
export const ComponentBenchmarks = {
  // Table component benchmarks
  table: {
    smallDataset: () => Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` })),
    mediumDataset: () => Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}`, value: Math.random() })),
    largeDataset: () => Array.from({ length: 10000 }, (_, i) => ({ 
      id: i, 
      name: `Item ${i}`, 
      value: Math.random(),
      category: `Category ${i % 10}`,
      description: `Description for item ${i}`.repeat(3)
    }))
  },

  // Form component benchmarks
  form: {
    simpleForm: () => ({ fields: Array.from({ length: 5 }, (_, i) => ({ name: `field${i}`, type: 'input' })) }),
    complexForm: () => ({ fields: Array.from({ length: 20 }, (_, i) => ({ 
      name: `field${i}`, 
      type: ['input', 'select', 'textarea', 'checkbox'][i % 4],
      validators: [{ type: 'required' }]
    })) }),
    dynamicForm: () => ({ fields: Array.from({ length: 50 }, (_, i) => ({
      name: `field${i}`,
      type: 'input',
      condition: i % 2 === 0 ? { field: 'toggle', value: true } : undefined
    })) })
  },

  // Tree component benchmarks
  tree: {
    flatTree: (size: number) => Array.from({ length: size }, (_, i) => ({ id: i, label: `Node ${i}` })),
    deepTree: (depth: number, childrenPerNode: number = 3) => {
      const createNode = (level: number, index: number): any => ({
        id: `${level}-${index}`,
        label: `Node ${level}-${index}`,
        children: level < depth ? Array.from({ length: childrenPerNode }, (_, i) => createNode(level + 1, i)) : undefined
      })
      return [createNode(0, 0)]
    }
  }
}

// Performance test data generators
export const TestDataGenerators = {
  generateUsers: (count: number) => Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `User ${i}`,
    email: `user${i}@example.com`,
    age: 20 + (i % 50),
    department: ['Engineering', 'Sales', 'Marketing'][i % 3],
    salary: 50000 + (i * 1000)
  })),

  generateProducts: (count: number) => Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Product ${i}`,
    price: (Math.random() * 1000).toFixed(2),
    category: ['Electronics', 'Clothing', 'Books', 'Home'][i % 4],
    inStock: i % 5 !== 0,
    description: `Description for product ${i}. `.repeat(10)
  })),

  generateChartData: (points: number) => ({
    labels: Array.from({ length: points }, (_, i) => `Point ${i}`),
    datasets: [{
      label: 'Performance Data',
      data: Array.from({ length: points }, () => Math.random() * 100)
    }]
  })
}

export default PerformanceTestUtils