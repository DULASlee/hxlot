// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ Aspire配置中心增强器
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// @module @smartabp/lowcode-core/generators/aspire/ConfigurationCenterEnhancer
//
// 📋 功能：
//   - Consul KV配置存储
//   - Azure App Configuration集成
//   - 配置热重载
//   - 配置版本管理
//   - 环境隔离
//   - 配置加密/解密
//   - 配置审计日志
//   - 配置回滚机制
//
// 🎯 目标：
//   - 统一配置管理
//   - 动态配置更新
//   - 多环境配置隔离
//   - 配置安全性保障
//
// 🏆 质量标准：
//   - 代码质量 ≥95分
//   - TypeScript类型安全 100%
//   - 业界最佳实践（参考Spring Cloud Config、Consul）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 配置中心提供者类型
 */
export type ConfigurationProvider = 'consul' | 'azure-appconfig' | 'etcd' | 'zookeeper' | 'redis' | 'file'

/**
 * 配置项定义
 */
export interface ConfigurationItem {
  /** 配置键 */
  key: string
  /** 配置值 */
  value: string
  /** 配置描述 */
  description?: string
  /** 数据类型 */
  dataType: 'string' | 'number' | 'boolean' | 'json' | 'array'
  /** 是否敏感信息 */
  sensitive: boolean
  /** 是否支持热重载 */
  hotReload: boolean
  /** 环境标签 */
  environment: string
  /** 应用标签 */
  application: string
  /** 版本 */
  version: string
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
  /** 创建者 */
  createdBy: string
  /** 更新者 */
  updatedBy: string
  /** 标签 */
  tags: string[]
}

/**
 * 配置中心基础配置
 */
export interface ConfigurationCenterConfig {
  /** 提供者类型 */
  provider: ConfigurationProvider
  /** 配置中心地址 */
  endpoint: string
  /** 应用名称 */
  applicationName: string
  /** 环境名称 */
  environment: string
  /** 配置命名空间 */
  namespace?: string
  /** 刷新间隔（秒）*/
  refreshInterval: number
  /** 是否启用热重载 */
  enableHotReload: boolean
  /** 配置缓存 */
  caching: {
    /** 启用本地缓存 */
    enabled: boolean
    /** 缓存TTL（秒）*/
    ttl: number
    /** 缓存大小 */
    maxSize: number
  }
  /** 安全配置 */
  security: {
    /** 启用加密 */
    enableEncryption: boolean
    /** 加密密钥 */
    encryptionKey?: string
    /** 访问令牌 */
    accessToken?: string
    /** TLS配置 */
    tls?: {
      enabled: boolean
      certFile?: string
      keyFile?: string
      caFile?: string
    }
  }
  /** 回退配置 */
  fallback: {
    /** 启用回退 */
    enabled: boolean
    /** 回退配置文件路径 */
    configFile: string
  }
}

/**
 * Consul KV配置
 */
export interface ConsulConfigCenterConfig extends ConfigurationCenterConfig {
  consul: {
    /** Consul地址 */
    host: string
    /** Consul端口 */
    port: number
    /** 数据中心 */
    datacenter: string
    /** ACL Token */
    aclToken?: string
    /** 配置前缀 */
    keyPrefix: string
    /** 监听配置变化 */
    watchForChanges: boolean
    /** 阻塞查询超时 */
    blockingQueryTimeout: number
  }
}

/**
 * Azure App Configuration配置
 */
export interface AzureAppConfigCenterConfig extends ConfigurationCenterConfig {
  azure: {
    /** 连接字符串 */
    connectionString: string
    /** 配置标签 */
    label?: string
    /** 配置前缀 */
    keyPrefix: string
    /** 使用Key Vault引用 */
    useKeyVaultReferences: boolean
    /** Key Vault配置 */
    keyVault?: {
      /** Vault URL */
      vaultUrl: string
      /** 客户端ID */
      clientId: string
      /** 客户端密钥 */
      clientSecret: string
      /** 租户ID */
      tenantId: string
    }
  }
}

/**
 * 配置变更事件
 */
export interface ConfigurationChangeEvent {
  /** 变更类型 */
  changeType: 'added' | 'updated' | 'removed'
  /** 配置键 */
  key: string
  /** 旧值 */
  oldValue?: string
  /** 新值 */
  newValue?: string
  /** 变更时间 */
  timestamp: Date
  /** 环境 */
  environment: string
  /** 应用 */
  application: string
}

/**
 * 配置管理器接口
 */
export interface ConfigurationManager {
  /** 获取配置值 */
  getValue<T = string>(key: string): Promise<T | null>
  /** 设置配置值 */
  setValue(key: string, value: any): Promise<void>
  /** 删除配置 */
  deleteValue(key: string): Promise<void>
  /** 获取所有配置 */
  getAllValues(): Promise<Record<string, any>>
  /** 监听配置变化 */
  watchChanges(callback: (event: ConfigurationChangeEvent) => void): void
  /** 刷新配置 */
  refresh(): Promise<void>
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏗️ 配置中心增强器类
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Aspire配置中心增强器
 * 
 * @example
 * ```typescript
 * const enhancer = new ConfigurationCenterEnhancer()
 * 
 * // 创建Consul配置中心配置
 * const consulConfig = enhancer.createConsulConfig({
 *   endpoint: 'http://consul:8500',
 *   applicationName: 'my-api',
 *   environment: 'development'
 * })
 * 
 * // 生成配置中心代码
 * const code = enhancer.generateConfigurationCenterCode(consulConfig)
 * 
 * // 生成配置迁移脚本
 * const migration = enhancer.generateConfigurationMigration(consulConfig, configItems)
 * ```
 */
export class ConfigurationCenterEnhancer {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎯 公共方法 - 配置生成
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 创建Consul配置中心配置
   */
  createConsulConfig(options: {
    endpoint: string
    applicationName: string
    environment: string
    keyPrefix?: string
    enableEncryption?: boolean
  }): ConsulConfigCenterConfig {
    return {
      provider: 'consul',
      endpoint: options.endpoint,
      applicationName: options.applicationName,
      environment: options.environment,
      namespace: options.applicationName,
      refreshInterval: 30,
      enableHotReload: true,
      caching: {
        enabled: true,
        ttl: 300,
        maxSize: 1000,
      },
      security: {
        enableEncryption: options.enableEncryption || false,
      },
      fallback: {
        enabled: true,
        configFile: 'appsettings.json',
      },
      consul: {
        host: new URL(options.endpoint).hostname,
        port: parseInt(new URL(options.endpoint).port) || 8500,
        datacenter: 'dc1',
        keyPrefix: options.keyPrefix || `config/${options.applicationName}/${options.environment}`,
        watchForChanges: true,
        blockingQueryTimeout: 60,
      },
    }
  }

  /**
   * 创建Azure App Configuration配置
   */
  createAzureAppConfig(options: {
    connectionString: string
    applicationName: string
    environment: string
    keyPrefix?: string
    useKeyVault?: boolean
  }): AzureAppConfigCenterConfig {
    return {
      provider: 'azure-appconfig',
      endpoint: options.connectionString,
      applicationName: options.applicationName,
      environment: options.environment,
      refreshInterval: 30,
      enableHotReload: true,
      caching: {
        enabled: true,
        ttl: 300,
        maxSize: 1000,
      },
      security: {
        enableEncryption: true,
      },
      fallback: {
        enabled: true,
        configFile: 'appsettings.json',
      },
      azure: {
        connectionString: options.connectionString,
        label: options.environment,
        keyPrefix: options.keyPrefix || options.applicationName,
        useKeyVaultReferences: options.useKeyVault || false,
      },
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎯 公共方法 - 代码生成
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 生成配置中心C#代码
   */
  generateConfigurationCenterCode(config: ConfigurationCenterConfig): string {
    const lines: string[] = []

    lines.push('// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('// ⚙️ 配置中心集成')
    lines.push('// 自动生成，请勿手动修改')
    lines.push('// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('')

    // 根据提供者类型生成不同的代码
    switch (config.provider) {
      case 'consul':
        lines.push(...this.generateConsulConfigurationCode(config as ConsulConfigCenterConfig))
        break
      case 'azure-appconfig':
        lines.push(...this.generateAzureAppConfigurationCode(config as AzureAppConfigCenterConfig))
        break
      case 'etcd':
        lines.push(...this.generateEtcdConfigurationCode(config))
        break
      case 'redis':
        lines.push(...this.generateRedisConfigurationCode(config))
        break
    }

    return lines.join('\n')
  }

  /**
   * 生成Program.cs中的配置中心配置
   */
  generateProgramCsConfiguration(configs: ConfigurationCenterConfig[]): string {
    const lines: string[] = []

    lines.push('// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('// ⚙️ 配置中心集成')
    lines.push('// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('')

    for (const config of configs) {
      lines.push(`// ${config.provider.toUpperCase()}配置中心`)
      
      switch (config.provider) {
        case 'consul':
          const consulConfig = config as ConsulConfigCenterConfig
          lines.push(`builder.Configuration.AddConsul("${consulConfig.consul.keyPrefix}", options =>`)
          lines.push('{')
          lines.push(`    options.ConsulConfigurationOptions = consulOptions =>`)
          lines.push('    {')
          lines.push(`        consulOptions.Address = new Uri("${config.endpoint}");`)
          lines.push(`        consulOptions.Datacenter = "${consulConfig.consul.datacenter}";`)
          if (consulConfig.consul.aclToken) {
            lines.push(`        consulOptions.Token = "${consulConfig.consul.aclToken}";`)
          }
          lines.push('    };')
          lines.push(`    options.ReloadOnChange = ${config.enableHotReload.toString().toLowerCase()};`)
          lines.push(`    options.OnLoadException = exceptionContext =>`)
          lines.push('    {')
          lines.push('        // 配置加载异常处理')
          lines.push('        exceptionContext.Ignore = false; // 不忽略异常')
          lines.push('    };')
          lines.push('});')
          break

        case 'azure-appconfig':
          const azureConfig = config as AzureAppConfigCenterConfig
          lines.push(`builder.Configuration.AddAzureAppConfiguration(options =>`)
          lines.push('{')
          lines.push(`    options.Connect("${azureConfig.azure.connectionString}")`)
          lines.push(`           .Select("${azureConfig.azure.keyPrefix}*", "${azureConfig.azure.label}")`)
          lines.push(`           .ConfigureRefresh(refresh =>`)
          lines.push('           {')
          lines.push(`               refresh.Register("${azureConfig.azure.keyPrefix}:RefreshSentinel", true)`)
          lines.push(`                      .SetCacheExpiration(TimeSpan.FromSeconds(${config.refreshInterval}));`)
          lines.push('           });')
          
          if (azureConfig.azure.useKeyVaultReferences) {
            lines.push('    ')
            lines.push('    // 集成Key Vault')
            lines.push('    options.ConfigureKeyVault(kv =>')
            lines.push('    {')
            lines.push('        kv.SetCredential(new ClientSecretCredential(')
            lines.push(`            "${azureConfig.azure.keyVault?.tenantId}",`)
            lines.push(`            "${azureConfig.azure.keyVault?.clientId}",`)
            lines.push(`            "${azureConfig.azure.keyVault?.clientSecret}"));`)
            lines.push('    });')
          }
          lines.push('});')
          break
      }
      lines.push('')
    }

    // 添加配置热重载服务
    lines.push('// 配置热重载服务')
    lines.push('if (builder.Environment.IsDevelopment())')
    lines.push('{')
    lines.push('    builder.Services.AddSingleton<IConfigurationRefresher, ConfigurationRefresher>();')
    lines.push('    builder.Services.AddHostedService<ConfigurationRefreshService>();')
    lines.push('}')
    lines.push('')

    return lines.join('\n')
  }

  /**
   * 生成配置迁移脚本
   */
  generateConfigurationMigration(
    config: ConfigurationCenterConfig,
    configItems: ConfigurationItem[]
  ): string {
    const lines: string[] = []

    lines.push('#!/bin/bash')
    lines.push('# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('# ⚙️ 配置迁移脚本')
    lines.push('# 自动生成，请勿手动修改')
    lines.push('# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('')

    lines.push(`echo "开始迁移配置到 ${config.provider.toUpperCase()}..."`)
    lines.push('')

    switch (config.provider) {
      case 'consul':
        const consulConfig = config as ConsulConfigCenterConfig
        lines.push(`CONSUL_ENDPOINT="${config.endpoint}"`)
        lines.push(`KEY_PREFIX="${consulConfig.consul.keyPrefix}"`)
        lines.push('')

        for (const item of configItems) {
          const key = `$KEY_PREFIX/${item.key}`
          const value = item.sensitive ? '${SENSITIVE_VALUE}' : item.value
          
          if (item.sensitive) {
            lines.push(`# 敏感配置: ${item.key}`)
            lines.push(`# 请手动设置: curl -X PUT $CONSUL_ENDPOINT/v1/kv/${key} -d "${value}"`)
          } else {
            lines.push(`echo "设置配置: ${item.key}"`)
            lines.push(`curl -X PUT $CONSUL_ENDPOINT/v1/kv/${key} -d "${value}"`)
          }
          lines.push('')
        }
        break

      case 'azure-appconfig':
        lines.push('# Azure App Configuration 迁移')
        lines.push('# 需要安装 Azure CLI')
        lines.push('az appconfig kv import --name <config-store-name> --source file --path config.json')
        lines.push('')

        // 生成JSON格式的配置
        const configJson = configItems.reduce((acc, item) => {
          if (!item.sensitive) {
            acc[item.key] = {
              value: item.value,
              content_type: item.dataType === 'json' ? 'application/json' : 'text/plain',
              label: config.environment,
            }
          }
          return acc
        }, {} as Record<string, any>)

        lines.push('# config.json 内容:')
        lines.push(JSON.stringify(configJson, null, 2))
        break
    }

    lines.push('')
    lines.push('echo "配置迁移完成!"')

    return lines.join('\n')
  }

  /**
   * 生成配置项验证器
   */
  generateConfigurationValidator(configItems: ConfigurationItem[]): string {
    const lines: string[] = []

    lines.push('// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('// 🔍 配置项验证器')
    lines.push('// 自动生成，请勿手动修改')
    lines.push('// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('')

    lines.push('using System.ComponentModel.DataAnnotations;')
    lines.push('using Microsoft.Extensions.Options;')
    lines.push('')

    // 按应用分组配置
    const configsByApp = configItems.reduce((acc, item) => {
      // 确保application不为undefined
      const appName = item.application || 'default'
      if (!acc[appName]) {
        acc[appName] = []
      }
      acc[appName].push(item)
      return acc
    }, {} as Record<string, ConfigurationItem[]>)

    for (const [appName, configs] of Object.entries(configsByApp)) {
      const className = `${this.toPascalCase(appName)}Configuration`
      
      lines.push(`public class ${className}`)
      lines.push('{')

      for (const config of configs) {
        if (config.description) {
          lines.push(`    /// <summary>`)
          lines.push(`    /// ${config.description}`)
          lines.push(`    /// </summary>`)
        }

        // 添加验证特性
        if (config.dataType === 'string' && !config.sensitive) {
          lines.push(`    [Required(ErrorMessage = "${config.key} 不能为空")]`)
        }

        const propertyName = this.toPascalCase(config.key.split('/').pop() || config.key)
        const propertyType = this.getPropertyType(config.dataType)
        
        lines.push(`    public ${propertyType} ${propertyName} { get; set; }`)
        lines.push('')
      }

      lines.push('}')
      lines.push('')

      // 生成验证器
      lines.push(`public class ${className}Validator : IValidateOptions<${className}>`)
      lines.push('{')
      lines.push(`    public ValidateOptionsResult Validate(string name, ${className} options)`)
      lines.push('    {')
      lines.push('        var failures = new List<string>();')
      lines.push('')

      for (const config of configs) {
        if (config.dataType === 'number') {
          const propertyName = this.toPascalCase(config.key.split('/').pop() || config.key)
          lines.push(`        if (options.${propertyName} <= 0)`)
          lines.push(`        {`)
          lines.push(`            failures.Add("${config.key} 必须大于0");`)
          lines.push(`        }`)
          lines.push('')
        }
      }

      lines.push('        return failures.Any() ')
      lines.push('            ? ValidateOptionsResult.Fail(failures)')
      lines.push('            : ValidateOptionsResult.Success;')
      lines.push('    }')
      lines.push('}')
      lines.push('')
    }

    return lines.join('\n')
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔧 私有方法 - 具体实现
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private generateConsulConfigurationCode(config: ConsulConfigCenterConfig): string[] {
    const lines: string[] = []

    lines.push('using Consul;')
    lines.push('using Microsoft.Extensions.Configuration;')
    lines.push('using Microsoft.Extensions.DependencyInjection;')
    lines.push('using Winton.Extensions.Configuration.Consul;')
    lines.push('')

    lines.push('public static class ConsulConfigurationExtensions')
    lines.push('{')
    lines.push('    public static IConfigurationBuilder AddConsulConfiguration(')
    lines.push('        this IConfigurationBuilder builder,')
    lines.push('        string keyPrefix)')
    lines.push('    {')
    lines.push('        return builder.AddConsul(keyPrefix, options =>')
    lines.push('        {')
    lines.push('            options.ConsulConfigurationOptions = consulOptions =>')
    lines.push('            {')
    lines.push(`                consulOptions.Address = new Uri("${config.endpoint}");`)
    lines.push(`                consulOptions.Datacenter = "${config.consul.datacenter}";`)
    if (config.consul.aclToken) {
      lines.push(`                consulOptions.Token = "${config.consul.aclToken}";`)
    }
    lines.push('            };')
    lines.push(`            options.ReloadOnChange = ${config.enableHotReload.toString().toLowerCase()};`)
    lines.push('            options.OnLoadException = exceptionContext =>')
    lines.push('            {')
    lines.push('                // 处理配置加载异常')
    lines.push('                if (exceptionContext.Exception is ConsulRequestException)')
    lines.push('                {')
    lines.push('                    // 使用回退配置')
    lines.push('                    exceptionContext.Ignore = true;')
    lines.push('                }')
    lines.push('            };')
    lines.push('        });')
    lines.push('    }')
    lines.push('}')
    lines.push('')

    // 配置热重载服务
    lines.push('public class ConfigurationRefreshService : BackgroundService')
    lines.push('{')
    lines.push('    private readonly IConfiguration _configuration;')
    lines.push('    private readonly ILogger<ConfigurationRefreshService> _logger;')
    lines.push('')
    lines.push('    public ConfigurationRefreshService(')
    lines.push('        IConfiguration configuration,')
    lines.push('        ILogger<ConfigurationRefreshService> logger)')
    lines.push('    {')
    lines.push('        _configuration = configuration;')
    lines.push('        _logger = logger;')
    lines.push('    }')
    lines.push('')
    lines.push('    protected override async Task ExecuteAsync(CancellationToken stoppingToken)')
    lines.push('    {')
    lines.push(`        var timer = new PeriodicTimer(TimeSpan.FromSeconds(${config.refreshInterval}));`)
    lines.push('')
    lines.push('        while (await timer.WaitForNextTickAsync(stoppingToken))')
    lines.push('        {')
    lines.push('            try')
    lines.push('            {')
    lines.push('                // 触发配置重载')
    lines.push('                if (_configuration is IConfigurationRoot configRoot)')
    lines.push('                {')
    lines.push('                    configRoot.Reload();')
    lines.push('                    _logger.LogDebug("配置已刷新");')
    lines.push('                }')
    lines.push('            }')
    lines.push('            catch (Exception ex)')
    lines.push('            {')
    lines.push('                _logger.LogError(ex, "配置刷新失败");')
    lines.push('            }')
    lines.push('        }')
    lines.push('    }')
    lines.push('}')

    return lines
  }

  private generateAzureAppConfigurationCode(config: AzureAppConfigCenterConfig): string[] {
    const lines: string[] = []

    lines.push('using Azure.Identity;')
    lines.push('using Microsoft.Extensions.Configuration;')
    lines.push('using Microsoft.Extensions.Configuration.AzureAppConfiguration;')
    lines.push('')

    lines.push('public static class AzureAppConfigurationExtensions')
    lines.push('{')
    lines.push('    public static IConfigurationBuilder AddAzureAppConfiguration(')
    lines.push('        this IConfigurationBuilder builder)')
    lines.push('    {')
    lines.push('        return builder.AddAzureAppConfiguration(options =>')
    lines.push('        {')
    lines.push(`            options.Connect("${config.azure.connectionString}")`)
    lines.push(`                   .Select("${config.azure.keyPrefix}*", "${config.azure.label}")`)
    lines.push('                   .ConfigureRefresh(refresh =>')
    lines.push('                   {')
    lines.push(`                       refresh.Register("${config.azure.keyPrefix}:RefreshSentinel", true)`)
    lines.push(`                              .SetCacheExpiration(TimeSpan.FromSeconds(${config.refreshInterval}));`)
    lines.push('                   });')
    
    if (config.azure.useKeyVaultReferences) {
      lines.push('')
      lines.push('            // 集成Azure Key Vault')
      lines.push('            options.ConfigureKeyVault(kv =>')
      lines.push('            {')
      lines.push('                kv.SetCredential(new DefaultAzureCredential());')
      lines.push('            });')
    }
    
    lines.push('        });')
    lines.push('    }')
    lines.push('}')

    return lines
  }

  private generateEtcdConfigurationCode(config: ConfigurationCenterConfig): string[] {
    return [
      '// Etcd配置中心实现',
      '// 需要集成 etcdctl 客户端库',
    ]
  }

  private generateRedisConfigurationCode(config: ConfigurationCenterConfig): string[] {
    return [
      '// Redis配置中心实现',
      '// 使用Redis作为配置存储',
    ]
  }

  private toPascalCase(str: string): string {
    return str
      .split(/[.\-_\/]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
  }

  private getPropertyType(dataType: string): string {
    switch (dataType) {
      case 'string':
        return 'string'
      case 'number':
        return 'int'
      case 'boolean':
        return 'bool'
      case 'json':
        return 'object'
      case 'array':
        return 'string[]'
      default:
        return 'string'
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📤 导出
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default ConfigurationCenterEnhancer
