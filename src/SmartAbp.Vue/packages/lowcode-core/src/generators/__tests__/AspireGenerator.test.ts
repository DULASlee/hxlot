// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧪 AspireGenerator单元测试
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { describe, it, expect } from 'vitest'
import { AspireGenerator } from './AspireGenerator'
import type {
  AspireConfiguration,
  AspireServiceDefinition,
} from './AspireGenerator'
import type { UnifiedModuleMetadata, UnifiedEntityDefinition } from '@smartabp/lowcode-shared'

describe('AspireGenerator', () => {
  const generator = new AspireGenerator()

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎯 测试：生成Aspire配置
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('generateAspireConfiguration', () => {
    it('应该从模块元数据生成基础Aspire配置', () => {
      const moduleMetadata: UnifiedModuleMetadata = {
        id: 'test-module',
        name: 'TestMES',
        displayName: '测试MES系统',
        description: '芯片制造MES系统',
        version: '1.0.0',
        entities: [],
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        updatedBy: 'admin',
        updatedAt: new Date().toISOString(),
        isPublished: false,
        isCompleted: false,
        tags: [],
        schemaVersion: '1.0.0',
      }

      const entities: UnifiedEntityDefinition[] = []

      const config = generator.generateAspireConfiguration(moduleMetadata, entities)

      expect(config.solutionName).toBe('TestMES')
      expect(config.appHostProjectName).toBe('TestMES.AppHost')
      expect(config.services).toHaveLength(3) // API + Database + Cache
      expect(config.telemetry).toBeDefined()
      expect(config.dashboard).toBeDefined()
    })

    it('应该为包含后台作业的模块生成Worker服务', () => {
      const moduleMetadata: UnifiedModuleMetadata = {
        id: 'test-module',
        name: 'TestMES',
        displayName: '测试MES系统',
        description: '芯片制造MES系统',
        version: '1.0.0',
        entities: [],
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        updatedBy: 'admin',
        updatedAt: new Date().toISOString(),
        isPublished: false,
        isCompleted: false,
        tags: [],
        schemaVersion: '1.0.0',
      }

      const entities: UnifiedEntityDefinition[] = [
        {
          id: 'background-job',
          name: 'DataSyncJob',
          displayName: '数据同步作业',
          tableName: 'data_sync_jobs',
          description: '定期同步设备数据',
          moduleId: 'test-module',
          primaryKey: {
            name: 'Id',
            type: 'string',
            isAutoIncrement: false,
            isNullable: false,
          },
          fields: [],
          relationships: [],
          indexes: [],
          constraints: [],
          permissionConfig: {
            groupName: 'MES',
            permissions: [],
          },
          menuConfig: [],
          uiConfig: {
            listPage: {
              enabled: true,
              pageSize: 20,
            },
            formPage: {
              enabled: true,
              columns: 1,
            },
            detailPage: {
              enabled: true,
            },
          },
          codeGeneration: {
            generateFrontend: {
              enabled: true,
            },
            generateBackend: {
              enabled: true,
              generateDto: true,
              generateAppService: true,
              generateController: true,
              generateRepository: true,
              generateDomainService: false,
              generateUnitTest: false,
            },
          },
          createdBy: 'admin',
          createdAt: new Date().toISOString(),
          updatedBy: 'admin',
          updatedAt: new Date().toISOString(),
          isCompleted: true,
          tags: [],
          schemaVersion: '1.0.0',
          version: 1,
        },
      ]

      const config = generator.generateAspireConfiguration(moduleMetadata, entities)

      // 应该包含: API + Database + Cache + Worker + MessageBus
      expect(config.services).toHaveLength(5)

      const workerService = config.services.find(s => s.type === 'worker')
      expect(workerService).toBeDefined()
      expect(workerService?.name).toBe('TestMES.Worker')

      const messageBusService = config.services.find(s => s.type === 'messagebus')
      expect(messageBusService).toBeDefined()
    })
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎯 测试：生成服务配置
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('generateServiceConfiguration', () => {
    it('应该为API服务生成正确的配置', () => {
      const service: AspireServiceDefinition = {
        name: 'TestMES.Api',
        type: 'api',
        projectPath: 'src/TestMES.Api/TestMES.Api.csproj',
        dependencies: ['database', 'cache'],
        ports: {
          http: 5000,
          https: 5001,
        },
        environmentVariables: {
          ASPNETCORE_ENVIRONMENT: 'Development',
        },
        enableTracing: true,
        enableMetrics: true,
      }

      const config = generator.generateServiceConfiguration(service)

      expect(config).toContain('AddProject<Projects.TestMES.Api>')
      expect(config).toContain('WithHttpEndpoint(port: 5000)')
      expect(config).toContain('WithHttpsEndpoint(port: 5001)')
      expect(config).toContain('WithReference(database)')
      expect(config).toContain('WithReference(cache)')
      expect(config).toContain('ASPNETCORE_ENVIRONMENT')
    })

    it('应该为数据库服务生成正确的配置', () => {
      const service: AspireServiceDefinition = {
        name: 'database',
        type: 'database',
        projectPath: '',
        dependencies: [],
        ports: {
          http: 5432,
        },
      }

      const config = generator.generateServiceConfiguration(service)

      expect(config).toContain('AddPostgres("database")')
      expect(config).toContain('WithDataVolume()')
      expect(config).toContain('WithPgAdmin()')
    })

    it('应该为缓存服务生成正确的配置', () => {
      const service: AspireServiceDefinition = {
        name: 'cache',
        type: 'cache',
        projectPath: '',
        dependencies: [],
        ports: {
          http: 6379,
        },
      }

      const config = generator.generateServiceConfiguration(service)

      expect(config).toContain('AddRedis("cache")')
      expect(config).toContain('WithDataVolume()')
      expect(config).toContain('WithRedisCommander()')
    })
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎯 测试：生成完整项目
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('generateAspireProject', () => {
    it('应该生成完整的Aspire项目文件', () => {
      const config: AspireConfiguration = {
        solutionName: 'TestMES',
        appHostProjectName: 'TestMES.AppHost',
        services: [
          {
            name: 'TestMES.Api',
            type: 'api',
            projectPath: 'src/TestMES.Api/TestMES.Api.csproj',
            dependencies: ['database'],
            ports: { http: 5000 },
          },
          {
            name: 'database',
            type: 'database',
            projectPath: '',
            dependencies: [],
            ports: { http: 5432 },
          },
        ],
        telemetry: {
          otlpEndpoint: 'http://localhost:4317',
          enableConsoleExporter: true,
          samplingRate: 1.0,
          resourceAttributes: {
            'service.name': 'test-mes',
          },
        },
        dashboard: {
          enabled: true,
          port: 18888,
          requireAuth: false,
        },
        serviceDiscovery: {
          type: 'dns',
          config: {},
        },
      }

      const result = generator.generateAspireProject(config)

      // 验证关键文件都已生成
      expect(result.appHostProject).toBeDefined()
      expect(result.programCs).toBeDefined()
      expect(result.serviceDefaultsProject).toBeDefined()
      expect(result.serviceDefaultsExtensions).toBeDefined()
      expect(result.appSettings).toBeDefined()
      expect(result.launchSettings).toBeDefined()
      expect(result.readme).toBeDefined()

      // 验证文件内容
      expect(result.appHostProject.content).toContain('<Project Sdk="Microsoft.NET.Sdk">')
      expect(result.appHostProject.content).toContain('Aspire.Hosting')
      expect(result.programCs.content).toContain('DistributedApplication.CreateBuilder')
      expect(result.programCs.content).toContain('AddProject<Projects.TestMES.Api>')
      expect(result.programCs.content).toContain('AddPostgres("database")')
    })

    it('应该生成包含OpenTelemetry配置的ServiceDefaults', () => {
      const config: AspireConfiguration = {
        solutionName: 'TestMES',
        appHostProjectName: 'TestMES.AppHost',
        services: [],
        telemetry: {
          otlpEndpoint: 'http://localhost:4317',
          enableConsoleExporter: true,
          samplingRate: 1.0,
          resourceAttributes: {},
        },
        dashboard: {
          enabled: true,
          port: 18888,
          requireAuth: false,
        },
        serviceDiscovery: {
          type: 'dns',
          config: {},
        },
      }

      const result = generator.generateAspireProject(config)

      expect(result.serviceDefaultsExtensions.content).toContain('OpenTelemetry')
      expect(result.serviceDefaultsExtensions.content).toContain('AddAspNetCoreInstrumentation')
      expect(result.serviceDefaultsExtensions.content).toContain('AddHttpClientInstrumentation')
      expect(result.serviceDefaultsExtensions.content).toContain('MapHealthChecks')
    })

    it('应该生成正确的launchSettings.json', () => {
      const config: AspireConfiguration = {
        solutionName: 'TestMES',
        appHostProjectName: 'TestMES.AppHost',
        services: [],
        telemetry: {
          otlpEndpoint: 'http://localhost:4317',
          enableConsoleExporter: true,
          samplingRate: 1.0,
          resourceAttributes: {},
        },
        dashboard: {
          enabled: true,
          port: 18888,
          requireAuth: false,
        },
        serviceDiscovery: {
          type: 'dns',
          config: {},
        },
      }

      const result = generator.generateAspireProject(config)

      const launchSettings = JSON.parse(result.launchSettings.content)

      expect(launchSettings.profiles['TestMES.AppHost']).toBeDefined()
      expect(launchSettings.profiles['TestMES.AppHost'].applicationUrl).toBe(
        'http://localhost:18888'
      )
      expect(launchSettings.profiles['TestMES.AppHost'].environmentVariables).toHaveProperty(
        'DOTNET_ENVIRONMENT'
      )
    })
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎯 测试：拓扑排序
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('拓扑排序', () => {
    it('应该按依赖顺序排列服务', () => {
      const services: AspireServiceDefinition[] = [
        {
          name: 'api',
          type: 'api',
          projectPath: '',
          dependencies: ['database', 'cache'],
        },
        {
          name: 'database',
          type: 'database',
          projectPath: '',
          dependencies: [],
        },
        {
          name: 'cache',
          type: 'cache',
          projectPath: '',
          dependencies: [],
        },
      ]

      const moduleMetadata: UnifiedModuleMetadata = {
        id: 'test',
        name: 'Test',
        displayName: '测试',
        description: '测试',
        version: '1.0.0',
        entities: [],
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        updatedBy: 'admin',
        updatedAt: new Date().toISOString(),
        isPublished: false,
        isCompleted: false,
        tags: [],
        schemaVersion: '1.0.0',
      }

      const config: AspireConfiguration = {
        solutionName: 'Test',
        appHostProjectName: 'Test.AppHost',
        services,
        telemetry: {
          otlpEndpoint: '',
          enableConsoleExporter: true,
          samplingRate: 1,
          resourceAttributes: {},
        },
        dashboard: {
          enabled: true,
          port: 18888,
          requireAuth: false,
        },
        serviceDiscovery: {
          type: 'dns',
          config: {},
        },
      }

      const result = generator.generateAspireProject(config)

      // Program.cs中，database和cache应该在api之前
      const programCs = result.programCs.content
      const databaseIndex = programCs.indexOf('AddPostgres("database")')
      const cacheIndex = programCs.indexOf('AddRedis("cache")')
      const apiIndex = programCs.indexOf('AddProject<Projects.api>')

      expect(databaseIndex).toBeLessThan(apiIndex)
      expect(cacheIndex).toBeLessThan(apiIndex)
    })
  })
})

