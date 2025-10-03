/**
 * lowcode-core 测试环境配置
 */

import { vi } from 'vitest'

// 全局模拟
global.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(), // deprecated
  removeListener: vi.fn(), // deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))

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

// 测试环境变量
process.env.NODE_ENV = 'test'
