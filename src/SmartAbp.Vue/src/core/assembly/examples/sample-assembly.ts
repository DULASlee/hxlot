/**
 * 示例装配件实现
 * 演示如何创建和使用装配件
 */

import type { 
  AssemblyConfig, 
  // ✅ 修复: AssemblyInstance已声明但未使用,注释掉
  // AssemblyInstance,
  AssemblyHealth
} from '../assembly-types'

/**
 * 示例装配件类
 */
export class SampleAssembly {
  private name: string
  private version: string
  private isInitialized: boolean = false
  private data: any = {}

  constructor(name: string, version: string = '1.0.0') {
    this.name = name
    this.version = version
  }

  /**
   * 初始化装配件
   */
  async initialize(config: any = {}): Promise<void> {
    if (this.isInitialized) {
      return
    }

    console.log(`初始化装配件: ${this.name} v${this.version}`)
    
    // 模拟初始化过程
    await new Promise(resolve => setTimeout(resolve, 100))
    
    this.data = {
      initializedAt: new Date(),
      config,
      status: 'ready'
    }

    this.isInitialized = true
    console.log(`装配件 ${this.name} 初始化完成`)
  }

  /**
   * 执行装配件功能
   */
  async execute(params: any = {}): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('装配件未初始化')
    }

    console.log(`执行装配件: ${this.name}`, params)

    // 模拟执行过程
    await new Promise(resolve => setTimeout(resolve, 50))

    const result = {
      success: true,
      timestamp: new Date(),
      assembly: this.name,
      version: this.version,
      params,
      data: this.data
    }

    return result
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<AssemblyHealth> {
    if (!this.isInitialized) {
      return {
        status: 'unhealthy',
        message: '装配件未初始化',
        timestamp: new Date()
      }
    }

    // 模拟健康检查
    const isHealthy = Math.random() > 0.1 // 90% 概率健康

    if (isHealthy) {
      return {
        status: 'healthy',
        message: '装配件运行正常',
        timestamp: new Date(),
        details: {
          uptime: Date.now() - this.data.initializedAt.getTime(),
          memory: '正常',
          performance: '良好'
        }
      }
    } else {
      return {
        status: 'unhealthy',
        message: '装配件检测到问题',
        timestamp: new Date(),
        details: {
          issue: '模拟故障',
          severity: 'low'
        }
      }
    }
  }

  /**
   * 获取装配件信息
   */
  getInfo() {
    return {
      name: this.name,
      version: this.version,
      initialized: this.isInitialized,
      data: this.data
    }
  }

  /**
   * 清理资源
   */
  async dispose(): Promise<void> {
    if (!this.isInitialized) {
      return
    }

    console.log(`清理装配件: ${this.name}`)
    
    // 模拟清理过程
    await new Promise(resolve => setTimeout(resolve, 50))
    
    this.data = {}
    this.isInitialized = false
    
    console.log(`装配件 ${this.name} 清理完成`)
  }
}

/**
 * 创建示例装配件配置
 */
export function createSampleAssemblyConfig(name: string = 'sample-assembly'): AssemblyConfig {
  return {
    name,
    version: '1.0.0',
    type: 'module',
    entry: `./assemblies/${name}.js`,
    enabled: true,
    dependencies: [],
    metadata: {
      description: '示例装配件',
      author: 'SmartAbp Team',
      category: 'demo',
      tags: ['sample', 'demo'],
      unsafeEval: false
    },
    config: {
      timeout: 5000,
      retryCount: 3,
      allowFileAccess: false,
      maxMemory: 1024
    },
    // ✅ 修复: 添加缺少的AssemblyConfig必需字段
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * 创建数据处理器装配件
 */
export class DataProcessorAssembly {
  private processors: Map<string, Function> = new Map()

  constructor() {
    // 注册默认处理器
    this.registerProcessor('uppercase', (data: string) => data.toUpperCase())
    this.registerProcessor('lowercase', (data: string) => data.toLowerCase())
    this.registerProcessor('reverse', (data: string) => data.split('').reverse().join(''))
    this.registerProcessor('trim', (data: string) => data.trim())
  }

  registerProcessor(name: string, processor: Function): void {
    this.processors.set(name, processor)
  }

  async process(data: any, processorName: string): Promise<any> {
    const processor = this.processors.get(processorName)
    if (!processor) {
      throw new Error(`处理器未找到: ${processorName}`)
    }

    return processor(data)
  }

  async batchProcess(data: any[], processorName: string): Promise<any[]> {
    const results = []
    for (const item of data) {
      results.push(await this.process(item, processorName))
    }
    return results
  }

  getAvailableProcessors(): string[] {
    return Array.from(this.processors.keys())
  }
}

/**
 * 创建API客户端装配件
 */
export class ApiClientAssembly {
  private baseUrl: string
  private headers: Record<string, string> = {}

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setHeader(key: string, value: string): void {
    this.headers[key] = value
  }

  async get(endpoint: string, params?: any): Promise<any> {
    const url = new URL(endpoint, this.baseUrl)
    if (params) {
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key])
      })
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.headers
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async post(endpoint: string, data?: any): Promise<any> {
    const url = new URL(endpoint, this.baseUrl)

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers
      },
      body: data ? JSON.stringify(data) : undefined
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async healthCheck(): Promise<AssemblyHealth> {
    try {
      // ✅ 修复: fetch不支持timeout参数,移除
      const response = await fetch(new URL('/health', this.baseUrl), {
        method: 'GET'
      })

      if (response.ok) {
        return {
          status: 'healthy',
          message: 'API服务正常',
          timestamp: new Date()
        }
      } else {
        return {
          status: 'unhealthy',
          message: `API服务异常: ${response.status}`,
          timestamp: new Date()
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'API服务不可达',
        timestamp: new Date(),
        error: error as Error
      }
    }
  }
}

/**
 * 装配件工厂函数
 */
export function createAssembly(type: string, options: any = {}): any {
  switch (type) {
    case 'sample':
      return new SampleAssembly(options.name || 'sample-assembly', options.version)
    case 'data-processor':
      return new DataProcessorAssembly()
    case 'api-client':
      if (!options.baseUrl) {
        throw new Error('API客户端需要baseUrl参数')
      }
      return new ApiClientAssembly(options.baseUrl)
    default:
      throw new Error(`未知的装配件类型: ${type}`)
  }
}

/**
 * 装配件注册表
 */
export class AssemblyRegistry {
  private assemblies: Map<string, any> = new Map()

  register(name: string, assembly: any): void {
    if (this.assemblies.has(name)) {
      console.warn(`装配件 ${name} 已存在，将被覆盖`)
    }
    this.assemblies.set(name, assembly)
  }

  get(name: string): any {
    const assembly = this.assemblies.get(name)
    if (!assembly) {
      throw new Error(`装配件未找到: ${name}`)
    }
    return assembly
  }

  unregister(name: string): boolean {
    return this.assemblies.delete(name)
  }

  list(): string[] {
    return Array.from(this.assemblies.keys())
  }

  clear(): void {
    this.assemblies.clear()
  }
}

// 默认导出
export default {
  SampleAssembly,
  DataProcessorAssembly,
  ApiClientAssembly,
  createAssembly,
  AssemblyRegistry,
  createSampleAssemblyConfig
}
