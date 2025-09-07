import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, vi, afterEach } from 'vitest'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from '@/router'

// 创建测试应用
const app = createApp({})

// 全局测试配置
beforeEach(() => {
  // 为每个测试创建新的 Pinia 实例
  const pinia = createPinia()
  setActivePinia(pinia)

  // 清理所有模拟
  vi.clearAllMocks()
})

afterEach(() => {
  // 每个测试后清理
  vi.restoreAllMocks()
})

// Vue Test Utils 全局配置
config.global.plugins = [createPinia(), router, ElementPlus]

// 添加全局组件
app.use(ElementPlus)
app.use(createPinia())
app.use(router)

// 模拟 matchMedia（用于主题测试）
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
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

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn((_key: string) => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn((_index: number) => null),
}
vi.stubGlobal('localStorage', localStorageMock)

// 模拟 sessionStorage
const sessionStorageMock = {
  getItem: vi.fn((_key: string) => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn((_index: number) => null),
}
vi.stubGlobal('sessionStorage', sessionStorageMock)

// 模拟URL和浏览器导航API
vi.stubGlobal('URL', {
  createObjectURL: vi.fn(),
  revokeObjectURL: vi.fn(),
})

export { app }
