/**
 * 装配件工具函数库
 */

import type { 
  AssemblyConfig, 
  AssemblyValidationResult,
  DependencyNode,
  DependencyGraph
} from './assembly-types'

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 验证装配件配置
 */
export function validateAssemblyConfig(config: AssemblyConfig): AssemblyValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 基本验证
  if (!config.name || typeof config.name !== 'string') {
    errors.push('装配件名称必须为非空字符串')
  }

  if (!config.version || typeof config.version !== 'string') {
    errors.push('装配件版本必须为非空字符串')
  }

  if (!config.entry || typeof config.entry !== 'string') {
    errors.push('装配件入口文件必须为非空字符串')
  }

  if (!config.type || typeof config.type !== 'string') {
    errors.push('装配件类型必须为非空字符串')
  }

  // 名称格式验证
  if (config.name && !/^[a-z0-9-]+$/.test(config.name)) {
    errors.push('装配件名称只能包含小写字母、数字和连字符')
  }

  // 版本格式验证
  if (config.version && !/^\d+\.\d+\.\d+$/.test(config.version)) {
    warnings.push('建议使用语义化版本格式 (x.y.z)')
  }

  // 入口文件验证
  if (config.entry) {
    if (!config.entry.startsWith('/') && !config.entry.startsWith('http')) {
      warnings.push('入口文件路径建议使用绝对路径或完整URL')
    }
  }

  // 依赖项验证
  if (config.dependencies && !Array.isArray(config.dependencies)) {
    errors.push('依赖项必须为数组')
  } else if (config.dependencies) {
    for (const dep of config.dependencies) {
      if (typeof dep !== 'string') {
        errors.push(`依赖项 "${dep}" 必须为字符串`)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    timestamp: new Date()
  }
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target }

  for (const key in source) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key] as any)
    } else {
      result[key] = source[key] as any
    }
  }

  return result
}

/**
 * 创建默认配置
 */
export function createDefaultConfig(): Partial<AssemblyConfig> {
  return {
    enabled: true,
    dependencies: [],
    metadata: {},
    config: {}
  }
}

/**
 * 构建依赖关系图
 */
export function buildDependencyGraph(configs: AssemblyConfig[]): DependencyGraph {
  const nodes = new Map<string, DependencyNode>()
  const edges: [string, string][] = []

  // 创建节点
  for (const config of configs) {
    nodes.set(config.name, {
      name: config.name,
      version: config.version,
      dependencies: [...config.dependencies],
      dependents: []
    })
  }

  // 创建边并更新依赖关系
  for (const config of configs) {
    for (const depName of config.dependencies) {
      if (nodes.has(depName)) {
        edges.push([config.name, depName])
        // 更新被依赖项的依赖者列表
        const depNode = nodes.get(depName)!
        if (!depNode.dependents.includes(config.name)) {
          depNode.dependents.push(config.name)
        }
      }
    }
  }

  // 拓扑排序
  const topologicalOrder = topologicalSort(nodes, edges)

  // 检查循环依赖
  const hasCycles = checkForCycles(nodes, edges)

  return {
    nodes,
    edges,
    roots: Array.from(nodes.values()).filter(node => node.dependents.length === 0),
    topologicalOrder,
    hasCycles
  }
}

/**
 * 拓扑排序
 */
function topologicalSort(
  nodes: Map<string, DependencyNode>,
  edges: [string, string][]
): string[] {
  const inDegree = new Map<string, number>()
  const result: string[] = []

  // 初始化入度
  for (const [nodeName] of nodes) {
    inDegree.set(nodeName, 0)
  }

  // 计算入度
  for (const [, to] of edges) {
    inDegree.set(to, (inDegree.get(to) || 0) + 1)
  }

  // 找到入度为0的节点
  const queue: string[] = []
  for (const [nodeName, degree] of inDegree) {
    if (degree === 0) {
      queue.push(nodeName)
    }
  }

  // 执行拓扑排序
  while (queue.length > 0) {
    const current = queue.shift()!
    result.push(current)

    const currentNode = nodes.get(current)!
    for (const dep of currentNode.dependencies) {
      inDegree.set(dep, (inDegree.get(dep) || 0) - 1)
      if (inDegree.get(dep) === 0) {
        queue.push(dep)
      }
    }
  }

  // 如果结果数量不等于节点数量，说明有环
  if (result.length !== nodes.size) {
    // 有环的情况下，返回所有节点（顺序可能不正确）
    return Array.from(nodes.keys())
  }

  return result
}

/**
 * 检查循环依赖
 */
function checkForCycles(
  nodes: Map<string, DependencyNode>,
  _edges: [string, string][]
): boolean {
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function dfs(nodeName: string): boolean {
    if (recursionStack.has(nodeName)) {
      return true // 发现环
    }

    if (visited.has(nodeName)) {
      return false
    }

    visited.add(nodeName)
    recursionStack.add(nodeName)

    const node = nodes.get(nodeName)!
    for (const dep of node.dependencies) {
      if (dfs(dep)) {
        return true
      }
    }

    recursionStack.delete(nodeName)
    return false
  }

  for (const [nodeName] of nodes) {
    if (dfs(nodeName)) {
      return true
    }
  }

  return false
}

/**
 * 序列化配置
 */
export function serializeConfig(config: AssemblyConfig): string {
  return JSON.stringify(config, null, 2)
}

/**
 * 反序列化配置
 */
export function deserializeConfig(json: string): AssemblyConfig {
  const data = JSON.parse(json)
  
  // 验证基本结构
  if (!data.name || !data.version || !data.entry || !data.type) {
    throw new Error('无效的装配件配置格式')
  }

  return {
    name: data.name,
    version: data.version,
    description: data.description || '',
    entry: data.entry,
    type: data.type,
    enabled: data.enabled !== false,
    dependencies: data.dependencies || [],
    metadata: data.metadata || {},
    config: data.config || {},
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
  }
}

/**
 * 比较版本号
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0
    const num2 = parts2[i] || 0

    if (num1 > num2) return 1
    if (num1 < num2) return -1
  }

  return 0
}

/**
 * 检查版本兼容性
 */
export function isCompatibleVersion(required: string, actual: string): boolean {
  const [reqMajor] = required.split('.').map(Number)
  const [actMajor] = actual.split('.').map(Number)

  return reqMajor === actMajor
}

/**
 * 生成配置哈希
 */
export function generateConfigHash(config: AssemblyConfig): string {
  const str = `${config.name}-${config.version}-${config.entry}-${config.type}`
  let hash = 0

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36)
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null

  return (...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout)
    }

    timeout = window.setTimeout(() => {
      func(...args)
      timeout = null
    }, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T
  }

  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  return obj
}

/**
 * 等待函数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (attempt < maxRetries) {
        await sleep(delay * attempt)
      }
    }
  }

  throw lastError!
}

/**
 * 生成随机颜色
 */
export function generateRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 验证URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * 检查文件类型
 */
export function isJavaScriptFile(filename: string): boolean {
  const ext = getFileExtension(filename)
  return ['js', 'mjs', 'cjs'].includes(ext)
}

export function isTypeScriptFile(filename: string): boolean {
  const ext = getFileExtension(filename)
  return ['ts', 'tsx'].includes(ext)
}

export function isJSONFile(filename: string): boolean {
  const ext = getFileExtension(filename)
  return ext === 'json'
}

export default {
  generateId,
  validateAssemblyConfig,
  deepMerge,
  createDefaultConfig,
  buildDependencyGraph,
  serializeConfig,
  deserializeConfig,
  compareVersions,
  isCompatibleVersion,
  generateConfigHash,
  debounce,
  throttle,
  deepClone,
  sleep,
  retry,
  generateRandomColor,
  formatFileSize,
  isValidUrl,
  getFileExtension,
  isJavaScriptFile,
  isTypeScriptFile,
  isJSONFile
}