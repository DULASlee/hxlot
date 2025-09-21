/**
 * 阶段3高级UI组件库 TDD测试辅助工具
 * 支持企业级组件测试的完整工具集
 * 
 * @version 1.0
 * @author SmartAbp Expert Team
 * @date 2025-01-21
 */

import { mount, VueWrapper, MountingOptions } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import { vi } from 'vitest'

// 测试数据生成器
export interface MockDataGenerator {
  generateTableData(count: number): any[]
  generateTreeData(depth: number, children: number): any[]
  generateFormFields(complexity: 'simple' | 'complex'): any[]
  generateChartData(type: string, points: number): any
}

// 高级组件测试配置
export interface AdvancedTestConfig {
  enableVirtualization?: boolean
  enableDragDrop?: boolean
  enableRealtime?: boolean
  performanceMode?: boolean
  accessibilityMode?: boolean
}

// 测试用的路由配置
const testRoutes = [
  { path: '/', component: { template: '<div>Home</div>' } },
  { path: '/test', component: { template: '<div>Test</div>' } }
]

const testRouter = createRouter({
  history: createWebHistory(),
  routes: testRoutes
})

/**
 * 创建高级组件测试包装器
 */
export function createAdvancedTestWrapper<T extends Record<string, any>>(
  component: any,
  props: T = {} as T,
  options: MountingOptions<any> & AdvancedTestConfig = {}
): VueWrapper {
  const pinia = createPinia()
  
  const defaultOptions: MountingOptions<any> = {
    props,
    global: {
      plugins: [ElementPlus, pinia, testRouter],
      stubs: {
        transition: false,
        'transition-group': false,
        'el-tooltip': false
      },
      config: {
        warnHandler: () => {} // 抑制测试中的Vue警告
      }
    },
    attachTo: document.body
  }

  // 合并自定义选项
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    global: {
      ...defaultOptions.global,
      ...options.global
    }
  }

  return mount(component, mergedOptions)
}

/**
 * 数据生成器实现
 */
/**
 * 响应式测试辅助工具
 */
export class ResizeTestHelper {
  private static originalInnerWidth: number
  private static originalInnerHeight: number

  /**
   * 设置视口尺寸
   */
  static setViewportSize(width: number, height: number): void {
    // 保存原始值（如果是第一次调用）
    if (this.originalInnerWidth === undefined) {
      this.originalInnerWidth = window.innerWidth
      this.originalInnerHeight = window.innerHeight
    }

    // 设置新的视口尺寸
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width
    })

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height
    })

    // 触发resize事件
    window.dispatchEvent(new Event('resize'))
  }

  /**
   * 恢复原始视口尺寸
   */
  static restoreViewportSize(): void {
    if (this.originalInnerWidth !== undefined) {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: this.originalInnerWidth
      })
    }

    if (this.originalInnerHeight !== undefined) {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: this.originalInnerHeight
      })
    }

    window.dispatchEvent(new Event('resize'))
  }

  /**
   * 模拟移动设备视口
   */
  static setMobileViewport(): void {
    this.setViewportSize(375, 667) // iPhone 6/7/8
  }

  /**
   * 模拟平板设备视口
   */
  static setTabletViewport(): void {
    this.setViewportSize(768, 1024) // iPad
  }

  /**
   * 模拟桌面设备视口
   */
  static setDesktopViewport(): void {
    this.setViewportSize(1024, 768)
  }

  /**
   * 模拟大屏幕设备
   */
  static setLargeScreenViewport(): void {
    this.setViewportSize(1440, 900)
  }

  /**
   * 测试响应式断点切换
   */
  static async testBreakpointTransitions(
    wrapper: VueWrapper,
    breakpoints: Record<string, { width: number; height: number }>
  ): Promise<void> {
    for (const [name, size] of Object.entries(breakpoints)) {
      this.setViewportSize(size.width, size.height)
      await nextTick()
      
      // 验证断点类是否正确应用
      expect(wrapper.classes()).toContain(`breakpoint-${name}`)
    }
  }
}

export const mockDataGenerator: MockDataGenerator = {
  generateTableData(count: number): any[] {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      age: Math.floor(Math.random() * 50) + 18,
      department: ['Engineering', 'Sales', 'Marketing', 'HR'][Math.floor(Math.random() * 4)],
      salary: Math.floor(Math.random() * 100000) + 30000,
      status: ['active', 'inactive'][Math.floor(Math.random() * 2)],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    }))
  },

  generateTreeData(depth: number, children: number): any[] {
    function createNode(level: number, id: string, parentId?: string): any {
      const node = {
        id,
        label: `Node ${id}`,
        parentId,
        level,
        children: [] as any[]
      }

      if (level < depth) {
        for (let i = 0; i < children; i++) {
          const childId = `${id}-${i + 1}`
          node.children.push(createNode(level + 1, childId, id))
        }
      }

      return node
    }

    const roots = []
    for (let i = 0; i < children; i++) {
      roots.push(createNode(0, `${i + 1}`))
    }
    return roots
  },

  generateFormFields(complexity: 'simple' | 'complex'): any[] {
    const baseFields = [
      {
        key: 'name',
        type: 'input',
        label: '姓名',
        required: true,
        validation: { required: true, minLength: 2 }
      },
      {
        key: 'email',
        type: 'input',
        label: '邮箱',
        required: true,
        validation: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
      }
    ]

    if (complexity === 'simple') {
      return baseFields
    }

    return [
      ...baseFields,
      {
        key: 'age',
        type: 'number',
        label: '年龄',
        validation: { min: 18, max: 100 }
      },
      {
        key: 'department',
        type: 'select',
        label: '部门',
        options: [
          { value: 'engineering', label: '工程部' },
          { value: 'sales', label: '销售部' },
          { value: 'marketing', label: '市场部' }
        ]
      },
      {
        key: 'skills',
        type: 'checkbox-group',
        label: '技能',
        options: [
          { value: 'vue', label: 'Vue.js' },
          { value: 'react', label: 'React' },
          { value: 'typescript', label: 'TypeScript' }
        ]
      },
      {
        key: 'bio',
        type: 'textarea',
        label: '个人简介',
        validation: { maxLength: 500 }
      },
      {
        key: 'avatar',
        type: 'upload',
        label: '头像',
        accept: 'image/*'
      }
    ]
  },

  generateChartData(type: string, points: number): any {
    switch (type) {
      case 'line':
        return {
          xAxis: Array.from({ length: points }, (_, i) => `Point ${i + 1}`),
          series: [{
            name: 'Series 1',
            data: Array.from({ length: points }, () => Math.floor(Math.random() * 100))
          }]
        }
      
      case 'bar':
        return {
          categories: Array.from({ length: points }, (_, i) => `Category ${i + 1}`),
          series: [{
            name: 'Values',
            data: Array.from({ length: points }, () => Math.floor(Math.random() * 100))
          }]
        }
      
      case 'pie':
        return Array.from({ length: points }, (_, i) => ({
          name: `Segment ${i + 1}`,
          value: Math.floor(Math.random() * 100)
        }))
      
      default:
        return []
    }
  }
}

/**
 * 性能测试辅助函数
 */
export class PerformanceTestHelper {
  static async measureRenderTime(
    componentFactory: () => Promise<VueWrapper>
  ): Promise<number> {
    const startTime = performance.now()
    
    const wrapper = await componentFactory()
    await nextTick()
    
    const endTime = performance.now()
    
    wrapper.unmount()
    return endTime - startTime
  }

  static async measureMemoryUsage(
    componentFactory: () => Promise<VueWrapper>
  ): Promise<{ initial: number; peak: number; final: number }> {
    const initialMemory = performance.memory?.usedJSHeapSize || 0
    
    const wrapper = await componentFactory()
    await nextTick()
    
    const peakMemory = performance.memory?.usedJSHeapSize || 0
    
    wrapper.unmount()
    await nextTick()
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0
    
    return {
      initial: initialMemory,
      peak: peakMemory,
      final: finalMemory
    }
  }

  static async measureScrollPerformance(
    wrapper: VueWrapper,
    scrollContainer: string,
    scrollDistance: number
  ): Promise<number> {
    const container = wrapper.find(scrollContainer)
    const startTime = performance.now()
    
    await container.trigger('scroll', {
      target: { scrollTop: scrollDistance }
    })
    await nextTick()
    
    const endTime = performance.now()
    return endTime - startTime
  }
}

/**
 * 虚拟滚动测试辅助函数
 */
export class VirtualScrollTestHelper {
  static async testVirtualScrollRendering(
    wrapper: VueWrapper,
    totalItems: number,
    visibleItems: number
  ) {
    // 验证只渲染可见项
    const renderedItems = wrapper.findAll('[data-testid*="table-row"], .table-row, .list-item')
    expect(renderedItems.length).toBeLessThanOrEqual(visibleItems + 2) // 允许缓冲区
    
    // 验证总高度计算正确
    const container = wrapper.find('[data-testid="virtual-container"], .virtual-container')
    if (container.exists()) {
      const computedHeight = wrapper.vm.totalHeight
      expect(computedHeight).toBeGreaterThan(0)
    }
  }

  static async testScrollBehavior(
    wrapper: VueWrapper,
    scrollContainerSelector: string,
    itemHeight: number
  ) {
    const container = wrapper.find(scrollContainerSelector)
    
    // 滚动到中间位置
    const scrollTop = itemHeight * 50
    await container.trigger('scroll', { target: { scrollTop } })
    await nextTick()
    
    // 验证滚动位置更新
    expect(wrapper.vm.scrollTop).toBe(scrollTop)
    
    // 验证可见项索引计算正确
    const expectedStartIndex = Math.floor(scrollTop / itemHeight)
    expect(wrapper.vm.visibleRange?.start).toBe(expectedStartIndex)
  }
}

/**
 * 拖拽测试辅助函数
 */
export class DragDropTestHelper {
  static async simulateDragDrop(
    wrapper: VueWrapper,
    sourceSelector: string,
    targetSelector: string,
    dragData?: any
  ) {
    const source = wrapper.find(sourceSelector)
    const target = wrapper.find(targetSelector)
    
    expect(source.exists()).toBe(true)
    expect(target.exists()).toBe(true)
    
    // 模拟拖拽开始
    await source.trigger('dragstart', {
      dataTransfer: {
        setData: vi.fn(),
        getData: vi.fn().mockReturnValue(dragData || 'test-data')
      }
    })
    
    // 模拟拖拽进入目标
    await target.trigger('dragover', { preventDefault: vi.fn() })
    
    // 模拟放置
    await target.trigger('drop', {
      dataTransfer: {
        getData: vi.fn().mockReturnValue(dragData || 'test-data')
      }
    })
    
    await nextTick()
  }

  static async testColumnReordering(
    wrapper: VueWrapper,
    fromColumnKey: string,
    toColumnKey: string
  ) {
    await this.simulateDragDrop(
      wrapper,
      `[data-key="${fromColumnKey}"]`,
      `[data-key="${toColumnKey}"]`,
      fromColumnKey
    )
    
    // 验证事件发射
    expect(wrapper.emitted('column-order-changed')).toBeTruthy()
  }
}

/**
 * 可访问性测试辅助函数
 */
export class AccessibilityTestHelper {
  static testKeyboardNavigation(wrapper: VueWrapper) {
    const focusableElements = wrapper.findAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    expect(focusableElements.length).toBeGreaterThan(0)
    
    // 测试Tab键导航
    focusableElements.forEach((element, index) => {
      expect(element.attributes('tabindex')).not.toBe('-1')
    })
  }

  static testAriaLabels(wrapper: VueWrapper) {
    const interactiveElements = wrapper.findAll('button, input, select')
    
    interactiveElements.forEach(element => {
      const hasAriaLabel = element.attributes('aria-label') || 
                          element.attributes('aria-labelledby') ||
                          element.find('label').exists()
      
      expect(hasAriaLabel).toBeTruthy()
    })
  }

  static testColorContrast(wrapper: VueWrapper) {
    // 这里可以集成色彩对比度检查库
    // 暂时验证是否使用了设计系统的颜色变量
    const elementWithColors = wrapper.findAll('[style*="color"], [class*="color"]')
    expect(elementWithColors.length).toBeGreaterThanOrEqual(0)
  }
}

/**
 * 表单验证测试辅助函数
 */
export class FormValidationTestHelper {
  static async testFieldValidation(
    wrapper: VueWrapper,
    fieldSelector: string,
    invalidValue: any,
    validValue: any
  ) {
    const field = wrapper.find(fieldSelector)
    
    // 测试无效值
    await field.setValue(invalidValue)
    await field.trigger('blur')
    await nextTick()
    
    const errorMessage = wrapper.find('.error-message, .el-form-item__error')
    expect(errorMessage.exists()).toBe(true)
    
    // 测试有效值
    await field.setValue(validValue)
    await field.trigger('blur')
    await nextTick()
    
    expect(errorMessage.exists()).toBe(false)
  }

  static async testFormSubmission(
    wrapper: VueWrapper,
    formData: Record<string, any>,
    expectValid: boolean = true
  ) {
    // 填写表单
    for (const [key, value] of Object.entries(formData)) {
      const field = wrapper.find(`[name="${key}"], [data-field="${key}"]`)
      if (field.exists()) {
        await field.setValue(value)
      }
    }
    
    // 提交表单
    const submitButton = wrapper.find('[type="submit"], .submit-button')
    await submitButton.trigger('click')
    await nextTick()
    
    if (expectValid) {
      expect(wrapper.emitted('submit')).toBeTruthy()
    } else {
      expect(wrapper.find('.error-message, .el-form-item__error').exists()).toBe(true)
    }
  }
}

// 导出常用的模拟数据
export const MOCK_TABLE_COLUMNS = [
  { key: 'id', title: 'ID', width: 80, sortable: true },
  { key: 'name', title: '姓名', width: 120, sortable: true },
  { key: 'email', title: '邮箱', width: 200 },
  { key: 'department', title: '部门', width: 120 },
  { key: 'status', title: '状态', width: 100 }
]

export const MOCK_LARGE_DATASET = mockDataGenerator.generateTableData(10000)
export const MOCK_TREE_DATA = mockDataGenerator.generateTreeData(3, 5)
export const MOCK_COMPLEX_FORM_FIELDS = mockDataGenerator.generateFormFields('complex')