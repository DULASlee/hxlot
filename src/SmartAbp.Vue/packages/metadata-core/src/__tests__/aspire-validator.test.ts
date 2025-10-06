/**
 * @smartabp/metadata-core
 * Aspire验证器单元测试
 * 
 * 测试覆盖：
 * - 基础验证（10个用例）
 * - 微服务验证（10个用例）
 * - 基础设施验证（8个用例）
 * - 可观测性验证（7个用例）
 * - 边界条件测试（5个用例）
 * 
 * 总计：40个测试用例
 */

import { describe, it, expect } from 'vitest'
import {
  AspireSolutionMetadataSchema,
  validateAspireSolutionMetadata,
  safeValidateAspireSolutionMetadata,
  getAspireSolutionMetadataErrors,
  validateAspireSolutionMetadataAsync
} from '../validators/aspire-validator'
import type { AspireSolutionMetadata } from '../types'

// ========================================
// 测试数据工厂
// ========================================

function createValidAspireSolution(overrides?: Partial<AspireSolutionMetadata>): AspireSolutionMetadata {
  return {
    solutionName: 'SmartAbp',
    rootNamespace: 'SmartAbp',
    description: 'SmartAbp微服务解决方案',
    microservices: [
      {
        name: 'ApiService',
        displayName: 'API服务',
        port: 5000,
        type: 'WebApi',
        description: 'RESTful API服务',
        dependencies: []
      }
    ],
    includeApiGateway: true,
    infrastructure: {
      database: {
        type: 'PostgreSQL',
        connectionString: 'Host=localhost;Database=smartabp'
      },
      cache: {
        type: 'Redis',
        connectionString: 'localhost:6379'
      }
    },
    observability: {
      enableLogging: true,
      enableMetrics: true,
      enableTracing: true,
      loggingProvider: 'Serilog',
      metricsProvider: 'Prometheus',
      tracingProvider: 'OpenTelemetry'
    },
    ...overrides
  }
}

// ========================================
// 基础验证测试（10个用例）
// ========================================

describe('AspireValidator - 基础验证', () => {
  it('1.1 应该接受完整有效的Aspire方案', () => {
    const solution = createValidAspireSolution()
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.solutionName).toBe('SmartAbp')
      expect(result.data.microservices).toHaveLength(1)
    }
  })

  it('1.2 应该拒绝缺少solutionName', () => {
    const solution = createValidAspireSolution()
    delete (solution as any).solutionName
    
    const errors = getAspireSolutionMetadataErrors(solution)
    expect(errors).toContain('解决方案名称不能为空')
  })

  it('1.3 应该拒绝solutionName不是PascalCase', () => {
    const solution = createValidAspireSolution({ solutionName: 'smartAbp' })
    
    const errors = getAspireSolutionMetadataErrors(solution)
    expect(errors).toContain('解决方案名称必须是PascalCase格式（首字母大写）')
  })

  it('1.4 应该拒绝缺少rootNamespace', () => {
    const solution = createValidAspireSolution()
    delete (solution as any).rootNamespace
    
    const errors = getAspireSolutionMetadataErrors(solution)
    expect(errors).toContain('根命名空间不能为空')
  })

  it('1.5 应该拒绝rootNamespace不是PascalCase', () => {
    const solution = createValidAspireSolution({ rootNamespace: 'smartAbp' })
    
    const errors = getAspireSolutionMetadataErrors(solution)
    expect(errors).toContain('根命名空间必须是PascalCase格式（首字母大写）')
  })

  it('1.6 应该接受可选的description', () => {
    const solution = createValidAspireSolution({ description: '企业级微服务方案' })
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBe('企业级微服务方案')
    }
  })

  it('1.7 应该接受可选的schemaVersion', () => {
    const solution = createValidAspireSolution({ schemaVersion: '1.0.0' })
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    
    expect(result.success).toBe(true)
  })

  it('1.8 应该正确设置includeApiGateway标志', () => {
    const solution = createValidAspireSolution({ includeApiGateway: false })
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.includeApiGateway).toBe(false)
    }
  })

  it('1.9 应该接受空的microservices数组', () => {
    const solution = createValidAspireSolution({ microservices: [] })
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    
    expect(result.success).toBe(true)
  })

  it('1.10 应该接受可选的security配置', () => {
    const solution = createValidAspireSolution({
      security: {
        enableAuthentication: true,
        enableAuthorization: true,
        authProvider: 'IdentityServer'
      }
    })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })
})

// ========================================
// 微服务验证测试（10个用例）
// ========================================

describe('AspireValidator - 微服务验证', () => {
  it('2.1 应该接受WebApi类型微服务', () => {
    const solution = createValidAspireSolution({
      microservices: [
        {
          name: 'UserService',
          port: 5001,
          type: 'WebApi',
          dependencies: []
        }
      ]
    })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })

  it('2.2 应该接受gRPC类型微服务', () => {
    const solution = createValidAspireSolution({
      microservices: [
        {
          name: 'OrderService',
          port: 5002,
          type: 'gRPC',
          dependencies: []
        }
      ]
    })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })

  it('2.3 应该接受Worker类型微服务', () => {
    const solution = createValidAspireSolution({
      microservices: [
        {
          name: 'BackgroundWorker',
          port: 5003,
          type: 'Worker',
          dependencies: []
        }
      ]
    })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })

  it('2.4 应该接受Gateway类型微服务', () => {
    const solution = createValidAspireSolution({
      microservices: [
        {
          name: 'ApiGateway',
          port: 8080,
          type: 'Gateway',
          dependencies: ['UserService', 'OrderService']
        }
      ]
    })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })

  it('2.5 应该拒绝微服务name不是PascalCase', () => {
    const solution = createValidAspireSolution({
      microservices: [
        {
          name: 'userService',
          port: 5001,
          type: 'WebApi',
          dependencies: []
        }
      ]
    })
    
    const errors = getAspireSolutionMetadataErrors(solution)
    expect(errors.some(e => e.includes('PascalCase'))).toBe(true)
  })

  it('2.6 应该拒绝无效的端口号', () => {
    const solution = createValidAspireSolution({
      microservices: [
        {
          name: 'InvalidService',
          port: 0,
          type: 'WebApi',
          dependencies: []
        }
      ]
    })
    
    const errors = getAspireSolutionMetadataErrors(solution)
    expect(errors.some(e => e.includes('端口号必须在1-65535'))).toBe(true)
  })

  it('2.7 应该拒绝重复的微服务名称', () => {
    const solution = createValidAspireSolution({
      microservices: [
        { name: 'UserService', port: 5001, type: 'WebApi', dependencies: [] },
        { name: 'UserService', port: 5002, type: 'gRPC', dependencies: [] }
      ]
    })
    
    const errors = getAspireSolutionMetadataErrors(solution)
    expect(errors).toContain('微服务名称不能重复: UserService')
  })

  it('2.8 应该拒绝重复的端口号', () => {
    const solution = createValidAspireSolution({
      microservices: [
        { name: 'UserService', port: 5000, type: 'WebApi', dependencies: [] },
        { name: 'OrderService', port: 5000, type: 'WebApi', dependencies: [] }
      ]
    })
    
    const errors = getAspireSolutionMetadataErrors(solution)
    expect(errors).toContain('微服务端口号不能重复: 5000')
  })

  it('2.9 应该接受微服务的endpoints配置', () => {
    const solution = createValidAspireSolution({
      microservices: [
        {
          name: 'UserService',
          port: 5001,
          type: 'WebApi',
          dependencies: [],
          endpoints: [
            { path: '/api/users', method: 'GET', description: '获取用户列表' },
            { path: '/api/users/{id}', method: 'GET', description: '获取用户详情' },
            { path: '/api/users', method: 'POST', description: '创建用户' }
          ]
        }
      ]
    })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })

  it('2.10 应该验证endpoints的HTTP方法', () => {
    const methods: Array<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'> = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    
    methods.forEach(method => {
      const solution = createValidAspireSolution({
        microservices: [
          {
            name: 'TestService',
            port: 5001,
            type: 'WebApi',
            dependencies: [],
            endpoints: [
              { path: '/api/test', method, description: '测试' }
            ]
          }
        ]
      })
      
      const result = AspireSolutionMetadataSchema.safeParse(solution)
      expect(result.success).toBe(true)
    })
  })
})

// ========================================
// 基础设施验证测试（8个用例）
// ========================================

describe('AspireValidator - 基础设施验证', () => {
  it('3.1 应该接受PostgreSQL数据库配置', () => {
    const solution = createValidAspireSolution({
      infrastructure: {
        database: {
          type: 'PostgreSQL',
          connectionString: 'Host=localhost;Port=5432;Database=smartabp'
        }
      }
    })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })

  it('3.2 应该接受所有支持的数据库类型', () => {
    const dbTypes: Array<'PostgreSQL' | 'MySQL' | 'SqlServer' | 'MongoDB'> = ['PostgreSQL', 'MySQL', 'SqlServer', 'MongoDB']
    
    dbTypes.forEach(type => {
      const solution = createValidAspireSolution({
        infrastructure: {
          database: { type, connectionString: 'test-connection' }
        }
      })
      
      const result = AspireSolutionMetadataSchema.safeParse(solution)
      expect(result.success).toBe(true)
    })
  })

  it('3.3 应该接受Redis缓存配置', () => {
    const solution = createValidAspireSolution({
      infrastructure: {
        cache: {
          type: 'Redis',
          connectionString: 'localhost:6379'
        }
      }
    })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })

  it('3.4 应该接受MemoryCache配置', () => {
    const solution = createValidAspireSolution({
      infrastructure: {
        cache: {
          type: 'MemoryCache'
        }
      }
    })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })

  it('3.5 应该接受消息队列配置', () => {
    const solution = createValidAspireSolution({
      infrastructure: {
        messageQueue: {
          type: 'RabbitMQ',
          connectionString: 'amqp://localhost:5672'
        }
      }
    })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })

  it('3.6 应该接受所有支持的消息队列类型', () => {
    const mqTypes: Array<'RabbitMQ' | 'Kafka' | 'AzureServiceBus'> = ['RabbitMQ', 'Kafka', 'AzureServiceBus']
    
    mqTypes.forEach(type => {
      const solution = createValidAspireSolution({
        infrastructure: {
          messageQueue: { type, connectionString: 'test-connection' }
        }
      })
      
      const result = AspireSolutionMetadataSchema.safeParse(solution)
      expect(result.success).toBe(true)
    })
  })

  it('3.7 应该接受完整的基础设施配置', () => {
    const solution = createValidAspireSolution({
      infrastructure: {
        database: { type: 'PostgreSQL', connectionString: 'pg-conn' },
        cache: { type: 'Redis', connectionString: 'redis-conn' },
        messageQueue: { type: 'RabbitMQ', connectionString: 'rabbitmq-conn' }
      }
    })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })

  it('3.8 应该接受空的基础设施配置', () => {
    const solution = createValidAspireSolution({ infrastructure: {} })
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    
    expect(result.success).toBe(true)
  })
})

// ========================================
// 可观测性验证测试（7个用例）
// ========================================

describe('AspireValidator - 可观测性验证', () => {
  it('4.1 应该接受完整的可观测性配置', () => {
    const solution = createValidAspireSolution()
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.observability.enableLogging).toBe(true)
      expect(result.data.observability.enableMetrics).toBe(true)
      expect(result.data.observability.enableTracing).toBe(true)
    }
  })

  it('4.2 应该接受Serilog日志提供者', () => {
    const solution = createValidAspireSolution({
      observability: {
        enableLogging: true,
        enableMetrics: false,
        enableTracing: false,
        loggingProvider: 'Serilog'
      }
    })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })

  it('4.3 应该接受NLog日志提供者', () => {
    const solution = createValidAspireSolution({
      observability: {
        enableLogging: true,
        enableMetrics: false,
        enableTracing: false,
        loggingProvider: 'NLog'
      }
    })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })

  it('4.4 应该接受Prometheus指标提供者', () => {
    const solution = createValidAspireSolution({
      observability: {
        enableLogging: false,
        enableMetrics: true,
        enableTracing: false,
        metricsProvider: 'Prometheus'
      }
    })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })

  it('4.5 应该接受AppInsights监控', () => {
    const solution = createValidAspireSolution({
      observability: {
        enableLogging: true,
        enableMetrics: true,
        enableTracing: true,
        loggingProvider: 'Serilog',
        metricsProvider: 'AppInsights',
        tracingProvider: 'AppInsights'
      }
    })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })

  it('4.6 应该接受OpenTelemetry追踪', () => {
    const solution = createValidAspireSolution({
      observability: {
        enableLogging: false,
        enableMetrics: false,
        enableTracing: true,
        tracingProvider: 'OpenTelemetry'
      }
    })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })

  it('4.7 应该接受禁用所有可观测性', () => {
    const solution = createValidAspireSolution({
      observability: {
        enableLogging: false,
        enableMetrics: false,
        enableTracing: false
      }
    })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })
})

// ========================================
// 边界条件测试（5个用例）
// ========================================

describe('AspireValidator - 边界条件', () => {
  it('5.1 应该接受最小有效方案', () => {
    const solution: AspireSolutionMetadata = {
      solutionName: 'MinSolution',
      rootNamespace: 'MinSolution',
      microservices: [],
      includeApiGateway: false,
      infrastructure: {},
      observability: {
        enableLogging: false,
        enableMetrics: false,
        enableTracing: false
      }
    }
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })

  it('5.2 应该接受大量微服务（100个）', () => {
    const microservices = Array.from({ length: 100 }, (_, i) => ({
      name: `Service${i}`,
      port: 5000 + i,
      type: 'WebApi' as const,
      dependencies: []
    }))
    
    const solution = createValidAspireSolution({ microservices })
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    
    expect(result.success).toBe(true)
  })

  it('5.3 应该接受复杂的微服务依赖关系', () => {
    const solution = createValidAspireSolution({
      microservices: [
        { name: 'ServiceA', port: 5001, type: 'WebApi', dependencies: [] },
        { name: 'ServiceB', port: 5002, type: 'WebApi', dependencies: ['ServiceA'] },
        { name: 'ServiceC', port: 5003, type: 'WebApi', dependencies: ['ServiceA', 'ServiceB'] },
        { name: 'Gateway', port: 8080, type: 'Gateway', dependencies: ['ServiceA', 'ServiceB', 'ServiceC'] }
      ]
    })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })

  it('5.4 应该接受极长的字符串值', () => {
    const longDescription = 'A'.repeat(5000)
    const solution = createValidAspireSolution({ description: longDescription })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })

  it('5.5 应该接受所有可选配置组合', () => {
    const solution = createValidAspireSolution({
      description: '测试方案',
      infrastructure: {
        database: { type: 'PostgreSQL', connectionString: 'pg' },
        cache: { type: 'Redis', connectionString: 'redis' },
        messageQueue: { type: 'RabbitMQ', connectionString: 'mq' }
      },
      security: {
        enableAuthentication: true,
        enableAuthorization: true,
        authProvider: 'JWT'
      }
    })
    
    const result = AspireSolutionMetadataSchema.safeParse(solution)
    expect(result.success).toBe(true)
  })
})

// ========================================
// 验证API测试
// ========================================

describe('AspireValidator - 验证API', () => {
  it('API.1 validateAspireSolutionMetadata应该抛出异常', () => {
    const solution = createValidAspireSolution({ solutionName: 'invalid' })
    
    expect(() => validateAspireSolutionMetadata(solution)).toThrow()
  })

  it('API.2 safeValidateAspireSolutionMetadata应该返回SafeParseReturnType', () => {
    const solution = createValidAspireSolution()
    const result = safeValidateAspireSolutionMetadata(solution)
    
    expect(result.success).toBe(true)
  })

  it('API.3 getAspireSolutionMetadataErrors应该返回错误数组', () => {
    const solution = createValidAspireSolution({ solutionName: 'invalid' })
    const errors = getAspireSolutionMetadataErrors(solution)
    
    expect(Array.isArray(errors)).toBe(true)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('API.4 validateAspireSolutionMetadataAsync应该支持异步验证', async () => {
    const solution = createValidAspireSolution()
    const result = await validateAspireSolutionMetadataAsync(solution)
    
    expect(result).toBe(true)
  })

  it('API.5 validateAspireSolutionMetadataAsync应该拒绝无效数据', async () => {
    const solution = createValidAspireSolution({ solutionName: 'invalid' })
    
    await expect(validateAspireSolutionMetadataAsync(solution)).rejects.toThrow()
  })
})

