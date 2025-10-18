// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 Aspire微服务编排生成器
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// @module @smartabp/lowcode-core/generators/AspireGenerator
//
// 📋 功能：
//   - 生成.NET Aspire AppHost项目
//   - 生成ServiceDefaults配置
//   - 集成OpenTelemetry遥测
//   - 生成健康检查端点
//   - 生成Aspire Dashboard配置
//   - 服务发现与注册
//   - 分布式追踪配置
//
// 🎯 目标：
//   - 完整的微服务编排能力
//   - 可观测性（Observability）100%
//   - 服务依赖关系可视化
//   - 一键启动所有微服务
//
// 🏆 质量标准：
//   - 代码质量 ≥95分
//   - TypeScript类型安全 100%
//   - 业界最佳实践
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type {
  UnifiedEntityDefinition,
  UnifiedModuleMetadata,
} from '@smartabp/lowcode-shared'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Aspire服务定义
 */
export interface AspireServiceDefinition {
  /** 服务名称 */
  name: string
  /** 服务类型 */
  type: 'api' | 'worker' | 'blazor' | 'database' | 'cache' | 'messagebus'
  /** 项目路径 */
  projectPath: string
  /** 依赖的服务 */
  dependencies: string[]
  /** 环境变量 */
  environmentVariables?: Record<string, string>
  /** 端口配置 */
  ports?: {
    http?: number
    https?: number
    grpc?: number
  }
  /** 健康检查配置 */
  healthCheck?: {
    path: string
    interval: number
    timeout: number
    retries: number
  }
  /** 是否启用分布式追踪 */
  enableTracing?: boolean
  /** 是否启用指标收集 */
  enableMetrics?: boolean
  /** 资源限制 */
  resources?: {
    cpuLimit?: string
    memoryLimit?: string
  }
}

/**
 * Aspire配置
 */
export interface AspireConfiguration {
  /** 解决方案名称 */
  solutionName: string
  /** AppHost项目名称 */
  appHostProjectName: string
  /** 服务列表 */
  services: AspireServiceDefinition[]
  /** OpenTelemetry配置 */
  telemetry: {
    /** OTLP导出端点 */
    otlpEndpoint: string
    /** 是否启用控制台导出 */
    enableConsoleExporter: boolean
    /** 采样率 (0-1) */
    samplingRate: number
    /** 资源属性 */
    resourceAttributes: Record<string, string>
  }
  /** Dashboard配置 */
  dashboard: {
    /** 是否启用 */
    enabled: boolean
    /** 端口 */
    port: number
    /** 是否需要认证 */
    requireAuth: boolean
  }
  /** 服务发现配置 */
  serviceDiscovery: {
    /** 服务发现类型 */
    type: 'consul' | 'dns' | 'static'
    /** 配置 */
    config: Record<string, unknown>
  }
}

/**
 * 生成结果
 */
export interface AspireGenerationResult {
  /** AppHost项目文件 */
  appHostProject: {
    path: string
    content: string
  }
  /** Program.cs文件 */
  programCs: {
    path: string
    content: string
  }
  /** ServiceDefaults项目文件 */
  serviceDefaultsProject: {
    path: string
    content: string
  }
  /** ServiceDefaults扩展文件 */
  serviceDefaultsExtensions: {
    path: string
    content: string
  }
  /** appsettings.json文件 */
  appSettings: {
    path: string
    content: string
  }
  /** launchSettings.json文件 */
  launchSettings: {
    path: string
    content: string
  }
  /** 健康检查配置文件 */
  healthCheckConfig?: {
    path: string
    content: string
  }
  /** README文件 */
  readme: {
    path: string
    content: string
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏗️ AspireGenerator类
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Aspire微服务编排生成器
 *
 * @example
 * ```typescript
 * const generator = new AspireGenerator()
 *
 * // 从模块元数据生成Aspire配置
 * const config = generator.generateAspireConfiguration(moduleMetadata, entities)
 *
 * // 生成完整的Aspire项目
 * const result = generator.generateAspireProject(config)
 *
 * // 生成特定服务的配置
 * const serviceConfig = generator.generateServiceConfiguration(serviceDefinition)
 * ```
 */
export class AspireGenerator {
  private readonly defaultTelemetryConfig = {
    otlpEndpoint: 'http://localhost:4317',
    enableConsoleExporter: true,
    samplingRate: 1.0,
    resourceAttributes: {
      'service.name': 'smartabp-mes',
      'deployment.environment': 'development',
    },
  }

  private readonly defaultDashboardConfig = {
    enabled: true,
    port: 18888,
    requireAuth: false,
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎯 公共方法
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 从模块元数据生成Aspire配置
   */
  generateAspireConfiguration(
    moduleMetadata: UnifiedModuleMetadata,
    entities: UnifiedEntityDefinition[]
  ): AspireConfiguration {
    const solutionName = moduleMetadata.name ?? 'SmartAbp'
    const appHostProjectName = `${solutionName}.AppHost`

    // 生成服务列表
    const services: AspireServiceDefinition[] = []

    // 1. API服务
    services.push({
      name: `${solutionName}.Api`,
      type: 'api',
      projectPath: `src/${solutionName}.Api/${solutionName}.Api.csproj`,
      dependencies: ['database', 'cache'],
      environmentVariables: {
        ASPNETCORE_ENVIRONMENT: 'Development',
        ConnectionStrings__Default: '{database.connectionString}',
      },
      ports: {
        http: 5000,
        https: 5001,
      },
      healthCheck: {
        path: '/health',
        interval: 30,
        timeout: 10,
        retries: 3,
      },
      enableTracing: true,
      enableMetrics: true,
      resources: {
        cpuLimit: '1000m',
        memoryLimit: '512Mi',
      },
    })

    // 2. 数据库服务
    services.push({
      name: 'database',
      type: 'database',
      projectPath: '', // PostgreSQL容器
      dependencies: [],
      environmentVariables: {
        POSTGRES_USER: 'postgres',
        POSTGRES_PASSWORD: 'postgres',
        POSTGRES_DB: solutionName.toLowerCase(),
      },
      ports: {
        http: 5432,
      },
    })

    // 3. 缓存服务
    services.push({
      name: 'cache',
      type: 'cache',
      projectPath: '', // Redis容器
      dependencies: [],
      ports: {
        http: 6379,
      },
    })

    // 4. 如果有后台作业，添加Worker服务
    if (entities.some((e: UnifiedEntityDefinition) => (e.name ?? '').includes('Job') || (e.name ?? '').includes('Task'))) {
      services.push({
        name: `${solutionName}.Worker`,
        type: 'worker',
        projectPath: `src/${solutionName}.Worker/${solutionName}.Worker.csproj`,
        dependencies: ['database', 'cache', 'messagebus'],
        environmentVariables: {
          DOTNET_ENVIRONMENT: 'Development',
        },
        enableTracing: true,
        enableMetrics: true,
      })

      // 添加消息总线
      services.push({
        name: 'messagebus',
        type: 'messagebus',
        projectPath: '', // RabbitMQ容器
        dependencies: [],
        ports: {
          http: 5672, // AMQP
          https: 15672, // 管理界面
        },
      })
    }

    return {
      solutionName,
      appHostProjectName,
      services,
      telemetry: this.defaultTelemetryConfig,
      dashboard: this.defaultDashboardConfig,
      serviceDiscovery: {
        type: 'dns',
        config: {
          domainSuffix: '.local',
        },
      },
    }
  }

  /**
   * 生成完整的Aspire项目
   */
  generateAspireProject(config: AspireConfiguration): AspireGenerationResult {
    return {
      appHostProject: this.generateAppHostProject(config),
      programCs: this.generateProgramCs(config),
      serviceDefaultsProject: this.generateServiceDefaultsProject(config),
      serviceDefaultsExtensions: this.generateServiceDefaultsExtensions(config),
      appSettings: this.generateAppSettings(config),
      launchSettings: this.generateLaunchSettings(config),
      healthCheckConfig: this.generateHealthCheckConfig(config),
      readme: this.generateReadme(config),
    }
  }

  /**
   * 生成服务配置
   */
  generateServiceConfiguration(service: AspireServiceDefinition): string {
    const lines: string[] = []

    lines.push(`// ${service.name} 服务配置`)
    lines.push('')

    // 根据服务类型生成不同的配置
    switch (service.type) {
      case 'api':
        lines.push(`var ${this.toCamelCase(service.name)} = builder.AddProject<Projects.${service.name}>("${service.name}")`)
        if (service.ports?.http) {
          lines.push(`  .WithHttpEndpoint(port: ${service.ports.http})`)
        }
        if (service.ports?.https) {
          lines.push(`  .WithHttpsEndpoint(port: ${service.ports.https})`)
        }
        break

      case 'database':
        lines.push(`var ${this.toCamelCase(service.name)} = builder.AddPostgres("${service.name}")`)
        lines.push(`  .WithDataVolume()`)
        lines.push(`  .WithPgAdmin()`)
        break

      case 'cache':
        lines.push(`var ${this.toCamelCase(service.name)} = builder.AddRedis("${service.name}")`)
        lines.push(`  .WithDataVolume()`)
        lines.push(`  .WithRedisCommander()`)
        break

      case 'messagebus':
        lines.push(`var ${this.toCamelCase(service.name)} = builder.AddRabbitMQ("${service.name}")`)
        lines.push(`  .WithDataVolume()`)
        lines.push(`  .WithManagementPlugin()`)
        break

      case 'worker':
        lines.push(`var ${this.toCamelCase(service.name)} = builder.AddProject<Projects.${service.name}>("${service.name}")`)
        break
    }

    // 添加环境变量
    if (service.environmentVariables && Object.keys(service.environmentVariables).length > 0) {
      lines.push(`  .WithEnvironment(env =>`)
      lines.push(`  {`)
      for (const [key, value] of Object.entries(service.environmentVariables)) {
        lines.push(`    env.Add("${key}", "${value}");`)
      }
      lines.push(`  })`)
    }

    // 添加资源引用
    if (service.dependencies.length > 0) {
      for (const dep of service.dependencies) {
        lines.push(`  .WithReference(${this.toCamelCase(dep)})`)
      }
    }

    lines.push(`;`)
    lines.push('')

    return lines.join('\n')
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔧 私有方法 - 项目文件生成
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private generateAppHostProject(config: AspireConfiguration): { path: string; content: string } {
    const content = `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <IsAspireHost>true</IsAspireHost>
    <UserSecretsId>${this.generateGuid()}</UserSecretsId>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Aspire.Hosting" Version="8.0.0" />
    <PackageReference Include="Aspire.Hosting.PostgreSQL" Version="8.0.0" />
    <PackageReference Include="Aspire.Hosting.Redis" Version="8.0.0" />
    <PackageReference Include="Aspire.Hosting.RabbitMQ" Version="8.0.0" />
  </ItemGroup>

  <ItemGroup>
${config.services
  .filter(s => s.type === 'api' || s.type === 'worker')
  .map(s => `    <ProjectReference Include="..\\${s.name}\\${s.name}.csproj" />`)
  .join('\n')}
  </ItemGroup>

</Project>`

    return {
      path: `${config.appHostProjectName}/${config.appHostProjectName}.csproj`,
      content,
    }
  }

  private generateProgramCs(config: AspireConfiguration): { path: string; content: string } {
    const lines: string[] = []

    lines.push(`// ${config.appHostProjectName} - Aspire微服务编排入口`)
    lines.push(`// 自动生成，请勿手动修改`)
    lines.push(``)
    lines.push(`var builder = DistributedApplication.CreateBuilder(args);`)
    lines.push(``)
    lines.push(`// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    lines.push(`// 🔧 基础设施服务`)
    lines.push(`// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    lines.push(``)

    // 按依赖顺序生成服务配置
    const orderedServices = this.topologicalSort(config.services)
    for (const service of orderedServices) {
      lines.push(this.generateServiceConfiguration(service))
    }

    lines.push(`// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    lines.push(`// 🚀 启动应用`)
    lines.push(`// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    lines.push(``)
    lines.push(`await builder.Build().RunAsync();`)

    return {
      path: `${config.appHostProjectName}/Program.cs`,
      content: lines.join('\n'),
    }
  }

  private generateServiceDefaultsProject(
    config: AspireConfiguration
  ): { path: string; content: string } {
    const projectName = `${config.solutionName}.ServiceDefaults`
    const content = `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <IsAspireSharedProject>true</IsAspireSharedProject>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Extensions.Http.Resilience" Version="8.0.0" />
    <PackageReference Include="Microsoft.Extensions.ServiceDiscovery" Version="8.0.0" />
    <PackageReference Include="OpenTelemetry.Exporter.OpenTelemetryProtocol" Version="1.7.0" />
    <PackageReference Include="OpenTelemetry.Extensions.Hosting" Version="1.7.0" />
    <PackageReference Include="OpenTelemetry.Instrumentation.AspNetCore" Version="1.7.0" />
    <PackageReference Include="OpenTelemetry.Instrumentation.Http" Version="1.7.0" />
    <PackageReference Include="OpenTelemetry.Instrumentation.Runtime" Version="1.7.0" />
  </ItemGroup>

</Project>`

    return {
      path: `${projectName}/${projectName}.csproj`,
      content,
    }
  }

  private generateServiceDefaultsExtensions(
    config: AspireConfiguration
  ): { path: string; content: string } {
    const content = `// ${config.solutionName}.ServiceDefaults - 服务默认配置扩展
// 自动生成，请勿手动修改

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;

namespace Microsoft.Extensions.Hosting;

public static class ServiceDefaultsExtensions
{
    /// <summary>
    /// 添加服务默认配置
    /// </summary>
    public static IHostApplicationBuilder AddServiceDefaults(this IHostApplicationBuilder builder)
    {
        // 配置OpenTelemetry
        builder.ConfigureOpenTelemetry();

        // 添加默认健康检查
        builder.AddDefaultHealthChecks();

        // 配置服务发现
        builder.Services.ConfigureHttpClientDefaults(http =>
        {
            http.AddStandardResilienceHandler();
            http.AddServiceDiscovery();
        });

        return builder;
    }

    /// <summary>
    /// 配置OpenTelemetry遥测
    /// </summary>
    public static IHostApplicationBuilder ConfigureOpenTelemetry(this IHostApplicationBuilder builder)
    {
        builder.Logging.AddOpenTelemetry(logging =>
        {
            logging.IncludeFormattedMessage = true;
            logging.IncludeScopes = true;
        });

        builder.Services.AddOpenTelemetry()
            .WithMetrics(metrics =>
            {
                metrics
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddRuntimeInstrumentation();
            })
            .WithTracing(tracing =>
            {
                tracing
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation();
            });

        builder.AddOpenTelemetryExporters();

        return builder;
    }

    /// <summary>
    /// 添加OpenTelemetry导出器
    /// </summary>
    private static IHostApplicationBuilder AddOpenTelemetryExporters(this IHostApplicationBuilder builder)
    {
        var useOtlpExporter = !string.IsNullOrWhiteSpace(builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"]);

        if (useOtlpExporter)
        {
            builder.Services.AddOpenTelemetry().UseOtlpExporter();
        }

        return builder;
    }

    /// <summary>
    /// 添加默认健康检查
    /// </summary>
    public static IHostApplicationBuilder AddDefaultHealthChecks(this IHostApplicationBuilder builder)
    {
        builder.Services.AddHealthChecks()
            .AddCheck("self", () => HealthCheckResult.Healthy(), ["live"]);

        return builder;
    }

    /// <summary>
    /// 映射默认端点（健康检查）
    /// </summary>
    public static WebApplication MapDefaultEndpoints(this WebApplication app)
    {
        app.MapHealthChecks("/health");
        app.MapHealthChecks("/alive", new HealthCheckOptions
        {
            Predicate = r => r.Tags.Contains("live")
        });

        return app;
    }
}`

    return {
      path: `${config.solutionName}.ServiceDefaults/Extensions.cs`,
      content,
    }
  }

  private generateAppSettings(config: AspireConfiguration): { path: string; content: string } {
    const settings = {
      Logging: {
        LogLevel: {
          Default: 'Information',
          'Microsoft.AspNetCore': 'Warning',
          'Microsoft.Hosting.Lifetime': 'Information',
        },
      },
      AllowedHosts: '*',
      OpenTelemetry: {
        Exporter: {
          Otlp: {
            Endpoint: config.telemetry.otlpEndpoint,
          },
        },
        ResourceAttributes: config.telemetry.resourceAttributes,
      },
      Dashboard: {
        Enabled: config.dashboard.enabled,
        Port: config.dashboard.port,
        RequireAuth: config.dashboard.requireAuth,
      },
    }

    return {
      path: `${config.appHostProjectName}/appsettings.json`,
      content: JSON.stringify(settings, null, 2),
    }
  }

  private generateLaunchSettings(config: AspireConfiguration): { path: string; content: string } {
    const settings = {
      $schema: 'http://json.schemastore.org/launchsettings.json',
      profiles: {
        [config.appHostProjectName]: {
          commandName: 'Project',
          dotnetRunMessages: true,
          launchBrowser: true,
          applicationUrl: `http://localhost:${config.dashboard.port}`,
          environmentVariables: {
            ASPNETCORE_ENVIRONMENT: 'Development',
            DOTNET_ENVIRONMENT: 'Development',
            DOTNET_DASHBOARD_OTLP_ENDPOINT_URL: config.telemetry.otlpEndpoint,
          },
        },
      },
    }

    return {
      path: `${config.appHostProjectName}/Properties/launchSettings.json`,
      content: JSON.stringify(settings, null, 2),
    }
  }

  private generateHealthCheckConfig(
    config: AspireConfiguration
  ): { path: string; content: string } | undefined {
    const apiServices = config.services.filter(s => s.type === 'api' && s.healthCheck)
    if (apiServices.length === 0) return undefined

    const checks = apiServices.map(service => ({
      name: service.name,
      path: service.healthCheck!.path,
      interval: service.healthCheck!.interval,
      timeout: service.healthCheck!.timeout,
      retries: service.healthCheck!.retries,
    }))

    return {
      path: `${config.appHostProjectName}/healthchecks.json`,
      content: JSON.stringify({ checks }, null, 2),
    }
  }

  private generateReadme(config: AspireConfiguration): { path: string; content: string } {
    const content = `# ${config.solutionName} - Aspire微服务编排

## 📋 项目说明

本项目使用 **.NET Aspire** 进行微服务编排和管理。

## 🚀 快速开始

### 先决条件

- .NET 8.0 SDK
- Docker Desktop（用于容器化服务）
- Visual Studio 2022 或 JetBrains Rider

### 启动应用

\`\`\`bash
cd ${config.appHostProjectName}
dotnet run
\`\`\`

### 访问Dashboard

浏览器访问: http://localhost:${config.dashboard.port}

## 📦 服务列表

${config.services
  .map(
    s => `### ${s.name}
- **类型**: ${s.type}
- **端口**: ${s.ports?.http || 'N/A'}
${s.healthCheck ? `- **健康检查**: ${s.healthCheck.path}` : ''}
${s.dependencies.length > 0 ? `- **依赖**: ${s.dependencies.join(', ')}` : ''}`
  )
  .join('\n\n')}

## 🔍 可观测性

### OpenTelemetry

- **导出端点**: ${config.telemetry.otlpEndpoint}
- **采样率**: ${config.telemetry.samplingRate * 100}%

### 日志

所有服务的日志都会自动收集到Aspire Dashboard。

### 指标

以下指标会自动收集：
- ASP.NET Core请求指标
- HTTP客户端指标
- 运行时指标

### 分布式追踪

所有HTTP请求都会自动追踪，可在Dashboard中查看完整的调用链。

## 🏗️ 架构

\`\`\`
${this.generateArchitectureDiagram(config)}
\`\`\`

## 📚 更多资源

- [.NET Aspire文档](https://learn.microsoft.com/dotnet/aspire/)
- [OpenTelemetry .NET](https://opentelemetry.io/docs/instrumentation/net/)

---

**自动生成** by SmartAbp低代码平台 v18 (MES/IoT Edition)
`

    return {
      path: `${config.appHostProjectName}/README.md`,
      content,
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛠️ 工具方法
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 拓扑排序（确保依赖顺序）
   */
  private topologicalSort(services: AspireServiceDefinition[]): AspireServiceDefinition[] {
    const sorted: AspireServiceDefinition[] = []
    const visited = new Set<string>()
    const temp = new Set<string>()

    const visit = (service: AspireServiceDefinition) => {
      if (temp.has(service.name)) {
        throw new Error(`检测到循环依赖: ${service.name}`)
      }
      if (visited.has(service.name)) return

      temp.add(service.name)

      for (const depName of service.dependencies) {
        const dep = services.find(s => s.name === depName)
        if (dep) visit(dep)
      }

      temp.delete(service.name)
      visited.add(service.name)
      sorted.push(service)
    }

    for (const service of services) {
      if (!visited.has(service.name)) {
        visit(service)
      }
    }

    return sorted
  }

  /**
   * 转换为驼峰命名
   */
  private toCamelCase(str: string): string {
    return str
      .replace(/[.\-_]/g, ' ')
      .split(' ')
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('')
  }

  /**
   * 生成GUID
   */
  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  /**
   * 生成架构图
   */
  private generateArchitectureDiagram(config: AspireConfiguration): string {
    const lines: string[] = []

    lines.push(`┌─────────────────────────────────────┐`)
    lines.push(`│     Aspire Dashboard (${config.dashboard.port})      │`)
    lines.push(`└─────────────────────────────────────┘`)
    lines.push(`                 │`)
    lines.push(`                 │ OpenTelemetry`)
    lines.push(`                 ▼`)

    for (const service of config.services) {
      lines.push(`┌─────────────────────────────────────┐`)
      lines.push(`│  ${service.name.padEnd(35)} │`)
      lines.push(`│  Type: ${service.type.padEnd(28)} │`)
      if (service.ports?.http) {
        lines.push(`│  Port: ${String(service.ports.http).padEnd(28)} │`)
      }
      lines.push(`└─────────────────────────────────────┘`)

      if (service.dependencies.length > 0) {
        lines.push(`       │`)
        lines.push(`       │ depends on`)
        lines.push(`       ▼`)
        for (const dep of service.dependencies) {
          lines.push(`    [${dep}]`)
        }
      }
    }

    return lines.join('\n')
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📤 导出
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default AspireGenerator

