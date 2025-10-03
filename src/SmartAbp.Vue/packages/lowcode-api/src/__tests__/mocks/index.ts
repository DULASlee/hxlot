/**
 * Mock数据和Mock Server统一导出
 * 
 * 使用方式：
 * 1. 测试环境：直接导入mock数据
 * 2. 开发环境：通过mockServer拦截API调用
 */

export * from './api-responses'
export * from './mock-server'
export { mockServer as default } from './mock-server'

