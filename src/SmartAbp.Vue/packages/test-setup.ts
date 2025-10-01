/**
 * Vitest测试环境配置
 */

import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// 配置Vue Test Utils
config.global.mocks = {
  $t: (key: string) => key, // i18n mock
}

// Mock全局对象
global.CSS = {
  supports: vi.fn(() => false),
} as any

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock sessionStorage
global.sessionStorage = localStorageMock as any

// Mock console.error to suppress expected errors in tests
const originalError = console.error
console.error = (...args: any[]) => {
  // 过滤掉特定的错误信息
  const message = args[0]
  if (
    typeof message === 'string' &&
    (message.includes('[Vue warn]') ||
     message.includes('Not implemented: HTMLFormElement.prototype.submit'))
  ) {
    return
  }
  originalError.call(console, ...args)
}
