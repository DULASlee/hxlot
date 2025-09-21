/**
 * 测试工具库 - 阶段3高级UI组件库TDD开发
 * 提供统一的测试工具函数和配置
 */

import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import { Component } from 'vue'

// 创建测试用的路由实例
const createTestRouter = () => {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/test', component: { template: '<div>Test</div>' } }
    ]
  })
}

// 创建测试用的Pinia实例
const createTestPinia = () => {
  return createPinia()
}

/**
 * 创建测试包装器
 * @param component Vue组件
 * @param props 组件属性
 * @param options 额外选项
 */
export const createTestWrapper = (
  component: Component,
  props: Record<string, any> = {},
  options: Record<string, any> = {}
): VueWrapper<any> => {
  const router = createTestRouter()
  const pinia = createTestPinia()

  return mount(component, {
    props,
    global: {
      plugins: [ElementPlus, router, pinia],
      stubs: {
        'router-link': true,
        'router-view': true,
        ...options.stubs
      },
      mocks: {
        $t: (key: string) => key, // 模拟国际化
        ...options.mocks
      }
    },
    ...options
  })
}

/**
 * 生成模拟数据
 * @param count 数据数量
 * @param generator 数据生成器函数
 */
export const generateMockData = <T>(
  count: number,
  generator: (index: number) => T
): T[] => {
  return Array.from({ length: count }, (_, index) => generator(index))
}

/**
 * 模拟用户数据生成器
 */
export const mockUserGenerator = (index: number) => ({
  id: `user-${index}`,
  name: `User ${index}`,
  email: `user${index}@example.com`,
  age: 20 + (index % 50),
  isEnabled: index % 2 === 0,
  creationTime: new Date(2024, 0, 1 + index).toISOString(),
  sort: index
})

/**
 * 模拟表格列配置
 */
export const mockTableColumns = [
  { key: 'name', title: '姓名', width: 120, sortable: true },
  { key: 'email', title: '邮箱', width: 200 },
  { key: 'age', title: '年龄', width: 80, sortable: true },
  { key: 'isEnabled', title: '状态', width: 100 },
  { key: 'creationTime', title: '创建时间', width: 160, sortable: true }
]

/**
 * 模拟图表数据生成器
 */
export const mockChartDataGenerator = {
  line: (count: number = 10) => generateMockData(count, (i) => ({
    x: i,
    y: Math.floor(Math.random() * 100)
  })),

  bar: (count: number = 5) => generateMockData(count, (i) => ({
    name: `Category ${i}`,
    value: Math.floor(Math.random() * 100)
  })),

  pie: (count: number = 4) => generateMockData(count, (i) => ({
    name: `Segment ${i}`,
    value: Math.floor(Math.random() * 100)
  }))
}

/**
 * 等待Vue组件更新
 */
export const waitForUpdate = async (wrapper: VueWrapper<any>) => {
  await wrapper.vm.$nextTick()
}

/**
 * 模拟异步操作
 */
export const mockAsyncOperation = (delay: number = 100) => {
  return new Promise(resolve => setTimeout(resolve, delay))
}

/**
 * 创建模拟的API响应
 */
export const createMockApiResponse = <T>(data: T, delay: number = 100) => {
  return new Promise<T>(resolve => {
    setTimeout(() => resolve(data), delay)
  })
}

/**
 * 测试用的事件触发器
 */
export const triggerEvent = async (
  wrapper: VueWrapper<any>,
  selector: string,
  event: string,
  payload?: any
) => {
  const element = wrapper.find(selector)
  if (!element.exists()) {
    throw new Error(`Element with selector "${selector}" not found`)
  }

  await element.trigger(event, payload)
  await waitForUpdate(wrapper)
}

/**
 * 检查元素是否可见
 */
export const isElementVisible = (wrapper: VueWrapper<any>, selector: string): boolean => {
  const element = wrapper.find(selector)
  return element.exists() && element.isVisible()
}

/**
 * 获取元素文本内容
 */
export const getElementText = (wrapper: VueWrapper<any>, selector: string): string => {
  const element = wrapper.find(selector)
  return element.exists() ? element.text() : ''
}

/**
 * 模拟拖拽事件
 */
export const mockDragAndDrop = async (
  wrapper: VueWrapper<any>,
  sourceSelector: string,
  targetSelector: string
) => {
  const source = wrapper.find(sourceSelector)
  const target = wrapper.find(targetSelector)

  if (!source.exists() || !target.exists()) {
    throw new Error('Source or target element not found for drag and drop')
  }

  await source.trigger('dragstart')
  await target.trigger('dragover')
  await target.trigger('drop')
  await waitForUpdate(wrapper)
}

/**
 * 性能测试工具
 */
export const measurePerformance = async (operation: () => Promise<void> | void) => {
  const startTime = performance.now()
  await operation()
  const endTime = performance.now()
  return endTime - startTime
}

/**
 * 内存使用测试工具
 */
export const measureMemoryUsage = () => {
  if ((performance as any).memory) {
    const memory = (performance as any).memory
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit
    }
  }
  return null
}
