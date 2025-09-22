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
global.requestAnimationFrame = vi.fn().mockImplementation((cb) => setTimeout(cb, 16))
global.cancelAnimationFrame = vi.fn().mockImplementation((id) => clearTimeout(id))

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
