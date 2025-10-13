/**
 * 测试环境全局配置
 * 阶段3高级UI组件库TDD开发
 */

import { config } from "@vue/test-utils"
import { vi } from "vitest"

// 全局模拟
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// 模拟 ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 模拟 IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 模拟 requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  // Use setTimeout to simulate async behavior
  const id = setTimeout(() => {
    cb(Date.now())
  }, 16)
  return id as any
})
global.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id as any)
})

// 模拟 performance.memory (用于内存测试)
if (!(performance as any).memory) {
  Object.defineProperty(performance, "memory", {
    get: () => ({
      usedJSHeapSize: Math.floor(Math.random() * 50000000), // 50MB
      totalJSHeapSize: Math.floor(Math.random() * 100000000), // 100MB
      jsHeapSizeLimit: 2147483648, // 2GB
    }),
  })
}

// Vue Test Utils 全局配置
config.global.stubs = {
  transition: false,
  "transition-group": false,
}

// 全局错误处理
const originalConsoleError = console.error
console.error = (...args) => {
  // 忽略一些已知的无害警告
  const message = args[0]
  if (
    typeof message === "string" &&
    (message.includes("Vue warn") || message.includes("Element Plus"))
  ) {
    return
  }
  originalConsoleError(...args)
}

// 测试环境变量
process.env.NODE_ENV = "test"

// ---------------------------------------------------------------------------
// 追加：全局组件桩 & 第三方库 mock（Element Plus / vue-i18n）
// ---------------------------------------------------------------------------

// URL 下载相关 polyfill（用于 Blob 下载测试）
if (!(global as any).URL) {
  ;(global as any).URL = {} as any
}
if (typeof (global as any).URL.createObjectURL !== 'function') {
  ;(global as any).URL.createObjectURL = vi.fn(() => 'blob://mock-url')
}
if (typeof (global as any).URL.revokeObjectURL !== 'function') {
  ;(global as any).URL.revokeObjectURL = vi.fn()
}

// Element Plus 组件全局桩，避免渲染缺失告警
config.global.stubs = {
  ...config.global.stubs,
  'el-form': true,
  'el-form-item': true,
  'el-input': true,
  'el-select': true,
  'el-option': true,
  'el-button': true,
  'el-button-group': true,
  'el-row': true,
  'el-col': true,
  'el-progress': true,
  'el-alert': true,
  'el-tooltip': true,
  'el-divider': true,
  'el-select-v2': true,
}

// Mock ElMessage：既支持函数调用，也支持 .success/.error 等方法
const elMessageFn = vi.fn((options: any) => ({ close: vi.fn() })) as any
elMessageFn.success = vi.fn()
elMessageFn.error = vi.fn()
elMessageFn.warning = vi.fn()
elMessageFn.info = vi.fn()

vi.mock('element-plus', async () => {
  const actual = await vi.importActual<any>('element-plus')
  return {
    ...actual,
    ElMessage: elMessageFn,
  }
})

// Mock vue-i18n：t(key, params) → 返回可读占位文本
vi.mock('vue-i18n', async () => {
  return {
    useI18n: () => ({
      t: (key: string, params?: Record<string, unknown>) => {
        if (params && Object.keys(params).length > 0) {
          return `${key} ${JSON.stringify(params)}`
        }
        return key
      },
    }),
  }
})
