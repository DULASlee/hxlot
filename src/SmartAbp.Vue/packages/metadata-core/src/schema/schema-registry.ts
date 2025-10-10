/**
 * @smartabp/metadata-core/schema
 * Schema注册表
 * 
 * 功能：
 * - 注册和查找Schema
 * - Schema验证
 * - Schema缓存管理
 * - Schema依赖追踪
 */

import type { AspireSolutionMetadata, EntityMetadata, ModuleMetadata } from '../types/index.js'
import { validateAspireSolutionMetadata } from '../validators/aspire-validator'
import { validateEntityMetadata } from '../validators/entity-validator'
import { validateModuleMetadata } from '../validators/module-validator'
import { getCurrentSchemaVersion } from './version-manager'

// ========================================
// 注册表类型定义
// ========================================

/**
 * Schema元数据
 */
export interface SchemaMetadata {
  id: string
  type: 'entity' | 'module' | 'aspire'
  version: string
  name: string
  registeredAt: Date
  lastModified: Date
  dependencies: string[]
}

/**
 * 注册选项
 */
export interface RegisterOptions {
  validate?: boolean
  overwrite?: boolean
  trackDependencies?: boolean
}

/**
 * 查找选项
 */
export interface LookupOptions {
  version?: string
  includeMetadata?: boolean
}

// ========================================
// Schema注册表类
// ========================================

/**
 * Schema注册表（单例）
 */
export class SchemaRegistry {
  private static instance: SchemaRegistry

  private entitySchemas = new Map<string, EntityMetadata>()
  private moduleSchemas = new Map<string, ModuleMetadata>()
  private aspireSchemas = new Map<string, AspireSolutionMetadata>()
  private metadata = new Map<string, SchemaMetadata>()

  private constructor() { }

  /**
   * 获取注册表实例
   */
  static getInstance(): SchemaRegistry {
    if (!SchemaRegistry.instance) {
      SchemaRegistry.instance = new SchemaRegistry()
    }
    return SchemaRegistry.instance
  }

  // ========================================
  // 实体Schema注册
  // ========================================

  /**
   * 注册实体Schema
   */
  registerEntity(
    schema: EntityMetadata,
    options: RegisterOptions = {}
  ): void {
    const { validate = true, overwrite = false } = options

    // 验证Schema
    if (validate) {
      validateEntityMetadata(schema)
    }

    const id = this.generateEntityId(schema)

    // 检查是否已存在
    if (this.entitySchemas.has(id) && !overwrite) {
      throw new Error(`Entity schema already registered: ${id}`)
    }

    // 注册Schema
    this.entitySchemas.set(id, schema)

    // 记录元数据
    this.metadata.set(id, {
      id,
      type: 'entity',
      version: getCurrentSchemaVersion(schema),
      name: schema.name,
      registeredAt: new Date(),
      lastModified: new Date(),
      dependencies: []
    })
  }

  /**
   * 查找实体Schema
   */
  lookupEntity(
    name: string,
    module: string,
    options: LookupOptions = {}
  ): EntityMetadata | undefined {
    const id = `entity:${module}.${name}`
    const schema = this.entitySchemas.get(id)

    if (!schema) return undefined

    // 版本过滤
    if (options.version) {
      const schemaVersion = getCurrentSchemaVersion(schema)
      if (schemaVersion !== options.version) {
        return undefined
      }
    }

    return schema
  }

  /**
   * 获取所有实体Schema
   */
  getAllEntities(): EntityMetadata[] {
    return Array.from(this.entitySchemas.values())
  }

  // ========================================
  // 模块Schema注册
  // ========================================

  /**
   * 注册模块Schema
   */
  registerModule(
    schema: ModuleMetadata,
    options: RegisterOptions = {}
  ): void {
    const { validate = true, overwrite = false, trackDependencies = true } = options

    // 验证Schema
    if (validate) {
      validateModuleMetadata(schema)
    }

    const id = this.generateModuleId(schema)

    // 检查是否已存在
    if (this.moduleSchemas.has(id) && !overwrite) {
      throw new Error(`Module schema already registered: ${id}`)
    }

    // 注册Schema
    this.moduleSchemas.set(id, schema)

    // 记录元数据
    this.metadata.set(id, {
      id,
      type: 'module',
      version: schema.version,
      name: schema.name,
      registeredAt: new Date(),
      lastModified: new Date(),
      dependencies: trackDependencies ? schema.dependsOn : []
    })
  }

  /**
   * 查找模块Schema
   */
  lookupModule(
    name: string,
    options: LookupOptions = {}
  ): ModuleMetadata | undefined {
    const id = `module:${name}`
    const schema = this.moduleSchemas.get(id)

    if (!schema) return undefined

    // 版本过滤
    if (options.version) {
      if (schema.version !== options.version) {
        return undefined
      }
    }

    return schema
  }

  /**
   * 获取所有模块Schema
   */
  getAllModules(): ModuleMetadata[] {
    return Array.from(this.moduleSchemas.values())
  }

  // ========================================
  // Aspire方案Schema注册
  // ========================================

  /**
   * 注册Aspire方案Schema
   */
  registerAspireSolution(
    schema: AspireSolutionMetadata,
    options: RegisterOptions = {}
  ): void {
    const { validate = true, overwrite = false } = options

    // 验证Schema
    if (validate) {
      validateAspireSolutionMetadata(schema)
    }

    const id = this.generateAspireId(schema)

    // 检查是否已存在
    if (this.aspireSchemas.has(id) && !overwrite) {
      throw new Error(`Aspire solution schema already registered: ${id}`)
    }

    // 注册Schema
    this.aspireSchemas.set(id, schema)

    // 记录元数据
    this.metadata.set(id, {
      id,
      type: 'aspire',
      version: getCurrentSchemaVersion(schema),
      name: schema.solutionName,
      registeredAt: new Date(),
      lastModified: new Date(),
      dependencies: []
    })
  }

  /**
   * 查找Aspire方案Schema
   */
  lookupAspireSolution(
    solutionName: string,
    options: LookupOptions = {}
  ): AspireSolutionMetadata | undefined {
    const id = `aspire:${solutionName}`
    const schema = this.aspireSchemas.get(id)

    if (!schema) return undefined

    // 版本过滤
    if (options.version) {
      const schemaVersion = getCurrentSchemaVersion(schema)
      if (schemaVersion !== options.version) {
        return undefined
      }
    }

    return schema
  }

  /**
   * 获取所有Aspire方案Schema
   */
  getAllAspireSolutions(): AspireSolutionMetadata[] {
    return Array.from(this.aspireSchemas.values())
  }

  // ========================================
  // 通用操作
  // ========================================

  /**
   * 检查Schema是否已注册
   */
  has(id: string): boolean {
    return this.metadata.has(id)
  }

  /**
   * 删除Schema
   */
  unregister(id: string): boolean {
    const meta = this.metadata.get(id)
    if (!meta) return false

    this.metadata.delete(id)

    switch (meta.type) {
      case 'entity':
        return this.entitySchemas.delete(id)
      case 'module':
        return this.moduleSchemas.delete(id)
      case 'aspire':
        return this.aspireSchemas.delete(id)
    }
  }

  /**
   * 清空注册表
   */
  clear(): void {
    this.entitySchemas.clear()
    this.moduleSchemas.clear()
    this.aspireSchemas.clear()
    this.metadata.clear()
  }

  /**
   * 获取注册表统计信息
   */
  getStats() {
    return {
      totalSchemas: this.metadata.size,
      entities: this.entitySchemas.size,
      modules: this.moduleSchemas.size,
      aspireSolutions: this.aspireSchemas.size
    }
  }

  /**
   * 获取Schema元数据
   */
  getMetadata(id: string): SchemaMetadata | undefined {
    return this.metadata.get(id)
  }

  /**
   * 获取所有Schema元数据
   */
  getAllMetadata(): SchemaMetadata[] {
    return Array.from(this.metadata.values())
  }

  // ========================================
  // ID生成
  // ========================================

  private generateEntityId(schema: EntityMetadata): string {
    return `entity:${schema.module}.${schema.name}`
  }

  private generateModuleId(schema: ModuleMetadata): string {
    return `module:${schema.name}`
  }

  private generateAspireId(schema: AspireSolutionMetadata): string {
    return `aspire:${schema.solutionName}`
  }
}

// ========================================
// 便捷API
// ========================================

/**
 * 获取全局注册表实例
 */
export function getRegistry(): SchemaRegistry {
  return SchemaRegistry.getInstance()
}

/**
 * 注册实体
 */
export function registerEntity(schema: EntityMetadata, options?: RegisterOptions): void {
  getRegistry().registerEntity(schema, options)
}

/**
 * 查找实体
 */
export function lookupEntity(name: string, module: string, options?: LookupOptions): EntityMetadata | undefined {
  return getRegistry().lookupEntity(name, module, options)
}

/**
 * 注册模块
 */
export function registerModule(schema: ModuleMetadata, options?: RegisterOptions): void {
  getRegistry().registerModule(schema, options)
}

/**
 * 查找模块
 */
export function lookupModule(name: string, options?: LookupOptions): ModuleMetadata | undefined {
  return getRegistry().lookupModule(name, options)
}

/**
 * 注册Aspire方案
 */
export function registerAspireSolution(schema: AspireSolutionMetadata, options?: RegisterOptions): void {
  getRegistry().registerAspireSolution(schema, options)
}

/**
 * 查找Aspire方案
 */
export function lookupAspireSolution(solutionName: string, options?: LookupOptions): AspireSolutionMetadata | undefined {
  return getRegistry().lookupAspireSolution(solutionName, options)
}

