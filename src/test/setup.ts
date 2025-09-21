// AUTO-GENERATED FILE – DO NOT EDIT.
// Vitest测试环境设置

import { beforeAll, afterAll, vi } from 'vitest'

// 设置全局测试环境
beforeAll(() => {
  // 模拟全局API
  global.performance = global.performance || {
    now: vi.fn(() => Date.now())
  }

  // 设置测试超时
  vi.setConfig({ testTimeout: 10000 })
})

afterAll(() => {
  // 清理全局资源
  vi.restoreAllMocks()
})
