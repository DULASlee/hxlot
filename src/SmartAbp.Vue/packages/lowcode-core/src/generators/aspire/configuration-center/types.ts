// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 配置中心类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// @module @smartabp/lowcode-core/generators/aspire/configuration-center/types
//
// 📋 功能：
//   - 配置中心核心类型定义
//   - Consul配置类型
//   - Azure App Configuration配置类型
//   - 配置管理器接口
//
// 🏆 质量标准：
//   - 100%类型安全
//   - 完整的JSDoc注释
//   - 遵循TypeScript最佳实践
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

