import { getGlobalLogger, type ILogger } from "@smartabp/lowcode-shared"
import { defineStore } from "pinia"
import { ref } from "vue"

// 🔥 v10.0修复：通过桥接层导入API，避免循环依赖
type EntityModelingApiBridge = {
  createEntity: (...args: any[]) => Promise<any>
  deleteEntity: (...args: any[]) => Promise<any>
  updateEntity: (...args: any[]) => Promise<any>
  getAllEntities: (...args: any[]) => Promise<any[]>
  getAllRelations: (...args: any[]) => Promise<any[]>
}

// API桥接实例（运行时注入）
let apiBridge: EntityModelingApiBridge | null = null

export function injectEntityModelingApi(bridge: EntityModelingApiBridge) {
  apiBridge = bridge
}

// API包装函数（向后兼容）
const createEntityApi = (...args: any[]) => apiBridge?.createEntity(...args) || Promise.reject(new Error('API未注入'))
const deleteEntityApi = (...args: any[]) => apiBridge?.deleteEntity(...args) || Promise.reject(new Error('API未注入'))
const updateEntityApi = (...args: any[]) => apiBridge?.updateEntity(...args) || Promise.reject(new Error('API未注入'))
const getAllEntities = (...args: any[]) => apiBridge?.getAllEntities(...args) || Promise.reject(new Error('API未注入'))
const getAllRelations = (...args: any[]) => apiBridge?.getAllRelations(...args) || Promise.reject(new Error('API未注入'))

const logger: ILogger = getGlobalLogger()

// ============================================================================
// 类型别名和兼容层（向后兼容 + 保持Store接口不变）
// ============================================================================

/**
 * 实体字段类型（保持原有接口）
 */
export interface EntityField {
  name: string
  displayName: string
  type: string
  length?: number
  isRequired: boolean
  isPrimaryKey: boolean
  defaultValue?: string
  description?: string
}

/**
 * 验证规则类型（保持原有接口）
 * Phase 3扩展：添加required、email、url类型以支持FormSchemaAdapter
 */
export interface ValidationRule {
  fieldName: string
  ruleType: "length" | "range" | "regex" | "unique" | "custom" | "required" | "email" | "url"
  ruleValue: string
  errorMessage: string
}

/**
 * 实体定义类型（保持原有接口）
 */
export interface EntityDefinition {
  id: string
  name: string
  tableName: string
  displayName: string
  description: string
  category: "core" | "relation" | "config" | "log"
  module: string
  fields: EntityField[]
  validationRules: ValidationRule[]
  enableSoftDelete: boolean
  enableAudit: boolean
  enableMultiTenant: boolean
  isCompleted: boolean
}

/**
 * 实体关系类型（保持原有接口）
 */
export interface EntityRelation {
  id: string
  fromEntity: string
  toEntity: string
  type: "one-to-one" | "one-to-many" | "many-to-many"
  foreignKey: string
  navigationProperty?: string
}

// MDI窗口配置
export interface MDIWindowConfig {
  id: string
  title: string
  icon?: string
  bounds: { x: number; y: number; width: number; height: number }
  maximized: boolean
  minimized: boolean
  resizable: boolean
  draggable: boolean
  modal: boolean
  state: "normal" | "maximized" | "minimized" | "closed"
  component: string
  props: Record<string, any>
  permissions: any[]
  createdAt: string
}

// 标签页配置
export interface TabConfig {
  id: string
  title: string
  icon?: string
  closable: boolean
  active: boolean
  component: string
  props: Record<string, any>
  permissions: any[]
  pinned?: boolean
  loading?: boolean
  hasChanges?: boolean
  path?: string
}

// UI组件元数据
export interface UIComponentMetadata {
  id: string
  type: string
  name: string
  displayName: string
  description: string
  parentId?: string
  children: string[]
  props: Record<string, any>
  style: Record<string, any>
  layout: {
    x: number
    y: number
    width: number
    height: number
    resizable: boolean
    draggable: boolean
  }
  dataBinding?: any
  events: any[]
  permissions: any[]
  visible: boolean
  disabled: boolean
  readonly: boolean
  required: boolean
  createdAt: string
  updatedAt: string
}

// 建模器状态管理
export const useEntityModelingStore = defineStore("entityModeling", () => {
  // 状态数据
  const entities = ref<EntityDefinition[]>([])
  const relations = ref<EntityRelation[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 实体操作
  // 🔥 v9.0修复：使用真实API替代localStorage伪实现
  const addEntity = async (entity: Omit<EntityDefinition, "id"> & { id?: string }): Promise<EntityDefinition> => {
    try {
      isLoading.value = true
      error.value = null

      // 🔥 调用后端真实API创建实体
      const response = await createEntityApi({
        name: entity.name,
        tableName: entity.tableName,
        displayName: entity.displayName,
        description: entity.description || '',
        entityType: entity.category || 'core',
        baseType: 'Entity',
        namespace: entity.module || 'SmartAbp.Domain'
      })

      // 更新本地状态
      const newEntity: EntityDefinition = {
        ...entity,
        id: response.id!,
      }
      entities.value.push(newEntity)

      logger.info(`✅ 实体已创建（后端）: ${newEntity.name}`, { entityId: newEntity.id })

      // 检查实体完成状态
      checkEntityCompletion(newEntity.id!)

      return newEntity
    } catch (err) {
      const errorObj = err as Error
      error.value = `添加实体失败: ${errorObj.message}`
      logger.error("❌ 添加实体失败", { error: errorObj.message })
      throw errorObj
    } finally {
      isLoading.value = false
    }
  }

  // 🔥 v9.0修复：使用真实API
  const updateEntity = async (entityId: string, updates: Partial<EntityDefinition>): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      const index = entities.value.findIndex(e => e.id === entityId)
      if (index === -1) {
        throw new Error(`未找到实体: ${entityId}`)
      }

      const entity = entities.value[index]
      if (!entity) {
        logger.error(`❌ 实体不存在: ${entityId}`)
        return
      }

      // 🔥 调用后端真实API更新实体
      await updateEntityApi(entityId, {
        name: updates.name || entity.name,
        tableName: updates.tableName || entity.tableName,
        displayName: updates.displayName || entity.displayName,
        description: updates.description || entity.description || '',
        entityType: updates.category || entity.category || 'core',
        baseType: 'Entity',
        namespace: updates.module || entity.module || 'SmartAbp.Domain'
      })

      // 更新本地状态
      entities.value[index] = { ...entity, ...updates }
      logger.info(`✅ 实体已更新（后端）: ${entityId}`, { updates })

      // 重新检查完成状态
      checkEntityCompletion(entityId)
    } catch (err) {
      const errorObj = err as Error
      error.value = `更新实体失败: ${errorObj.message}`
      logger.error("❌ 更新实体失败", { entityId, error: errorObj.message })
      throw errorObj
    } finally {
      isLoading.value = false
    }
  }

  // 🔥 v9.0修复：使用真实API
  const removeEntity = async (entityId: string): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      const index = entities.value.findIndex(e => e.id === entityId)
      if (index === -1) {
        throw new Error(`未找到实体: ${entityId}`)
      }

      const entity = entities.value[index]
      if (!entity) {
        logger.error(`❌ 实体不存在: ${entityId}`)
        return
      }

      // 🔥 调用后端真实API删除实体
      await deleteEntityApi(entityId)

      // 更新本地状态
      entities.value.splice(index, 1)

      // 移除相关关系
      relations.value = relations.value.filter(r =>
        r.fromEntity !== entity.name && r.toEntity !== entity.name
      )

      logger.info(`✅ 实体已删除（后端）: ${entity.name}`, { entityId })
    } catch (err) {
      const errorObj = err as Error
      error.value = `删除实体失败: ${errorObj.message}`
      logger.error("❌ 删除实体失败", { entityId, error: errorObj.message })
      throw errorObj
    } finally {
      isLoading.value = false
    }
  }

  // 字段操作
  const addField = (entityId: string, field: EntityField) => {
    try {
      const entity = entities.value.find(e => e.id === entityId)
      if (!entity) {
        throw new Error(`未找到实体: ${entityId}`)
      }

      // 检查字段名是否重复
      if (entity.fields.some(f => f.name === field.name)) {
        throw new Error(`字段名已存在: ${field.name}`)
      }

      entity.fields.push(field)
      logger.info(`字段已添加: ${field.name}`, { entityId, fieldName: field.name })

      // 重新检查完成状态
      checkEntityCompletion(entityId)
    } catch (err) {
      const error = err as Error
      logger.error("添加字段失败", { entityId, fieldName: field.name, error: error.message })
      throw error
    }
  }

  const updateField = (entityId: string, fieldIndex: number, updates: Partial<EntityField>) => {
    try {
      const entity = entities.value.find(e => e.id === entityId)
      if (!entity) {
        throw new Error(`未找到实体: ${entityId}`)
      }

      if (fieldIndex < 0 || fieldIndex >= entity.fields.length) {
        throw new Error(`字段索引超出范围: ${fieldIndex}`)
      }

      const field = entity.fields[fieldIndex]
      if (!field) {
        throw new Error(`字段不存在: ${fieldIndex}`)
      }
      entity.fields[fieldIndex] = { ...field, ...updates }
      logger.info(`字段已更新: ${field.name}`, { entityId, fieldIndex })

      // 重新检查完成状态
      checkEntityCompletion(entityId)
    } catch (err) {
      const error = err as Error
      logger.error("更新字段失败", { entityId, fieldIndex, error: error.message })
      throw error
    }
  }

  const removeField = (entityId: string, fieldIndex: number) => {
    try {
      const entity = entities.value.find(e => e.id === entityId)
      if (!entity || !entity.fields) {
        throw new Error(`未找到实体或字段列表: ${entityId}`)
      }

      if (fieldIndex < 0 || fieldIndex >= entity.fields.length) {
        throw new Error(`字段索引超出范围: ${fieldIndex}`)
      }

      const field = entity.fields[fieldIndex]
      const fieldName = field?.name || 'Unknown'
      entity.fields.splice(fieldIndex, 1)
      logger.info(`字段已删除: ${fieldName}`, { entityId, fieldIndex })

      // 重新检查完成状态
      checkEntityCompletion(entityId)
    } catch (err) {
      const error = err as Error
      logger.error("删除字段失败", { entityId, fieldIndex, error: error.message })
      throw error
    }
  }

  // 验证规则操作
  const addValidationRule = (entityId: string, rule: ValidationRule) => {
    try {
      const entity = entities.value.find(e => e.id === entityId)
      if (!entity) {
        throw new Error(`未找到实体: ${entityId}`)
      }

      entity.validationRules.push(rule)
      logger.info(`验证规则已添加`, { entityId, fieldName: rule.fieldName, ruleType: rule.ruleType })
    } catch (err) {
      const error = err as Error
      logger.error("添加验证规则失败", { entityId, error: error.message })
      throw error
    }
  }

  const updateValidationRule = (entityId: string, ruleIndex: number, updates: Partial<ValidationRule>) => {
    try {
      const entity = entities.value.find(e => e.id === entityId)
      if (!entity) {
        throw new Error(`未找到实体: ${entityId}`)
      }

      if (ruleIndex < 0 || ruleIndex >= entity.validationRules.length) {
        throw new Error(`验证规则索引超出范围: ${ruleIndex}`)
      }

      const rule = entity.validationRules[ruleIndex]
      if (!rule) {
        throw new Error(`验证规则不存在: ${ruleIndex}`)
      }
      entity.validationRules[ruleIndex] = {
        fieldName: updates.fieldName || rule.fieldName,
        ruleType: updates.ruleType || rule.ruleType,
        ruleValue: updates.ruleValue || rule.ruleValue,
        errorMessage: updates.errorMessage || rule.errorMessage,
      }
      logger.info(`验证规则已更新`, { entityId, ruleIndex })
    } catch (err) {
      const error = err as Error
      logger.error("更新验证规则失败", { entityId, ruleIndex, error: error.message })
      throw error
    }
  }

  const removeValidationRule = (entityId: string, ruleIndex: number) => {
    try {
      const entity = entities.value.find(e => e.id === entityId)
      if (!entity) {
        throw new Error(`未找到实体: ${entityId}`)
      }

      if (ruleIndex < 0 || ruleIndex >= entity.validationRules.length) {
        throw new Error(`验证规则索引超出范围: ${ruleIndex}`)
      }

      entity.validationRules.splice(ruleIndex, 1)
      logger.info(`验证规则已删除`, { entityId, ruleIndex })
    } catch (err) {
      const error = err as Error
      logger.error("删除验证规则失败", { entityId, ruleIndex, error: error.message })
      throw error
    }
  }

  // 关系操作
  const addRelation = (relation: Omit<EntityRelation, "id"> & { id?: string }): EntityRelation => {
    try {
      // 检查关系是否已存在
      const exists = relations.value.some(r =>
        r.fromEntity === relation.fromEntity &&
        r.toEntity === relation.toEntity &&
        r.type === relation.type
      )

      if (exists) {
        throw new Error(`关系已存在: ${relation.fromEntity} -> ${relation.toEntity}`)
      }

      const newRelation: EntityRelation = {
        ...relation,
        id: relation.id || `relation-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      }
      relations.value.push(newRelation)
      logger.info(`关系已添加: ${relation.fromEntity} -> ${relation.toEntity}`, {
        relationId: relation.id,
        type: relation.type
      })
      return newRelation
    } catch (err) {
      const error = err as Error
      logger.error("添加关系失败", { relation, error: error.message })
      throw error
    }
  }

  const updateRelation = (relationId: string, updates: Partial<EntityRelation>) => {
    try {
      const index = relations.value.findIndex(r => r.id === relationId)
      if (index === -1) {
        throw new Error(`未找到关系: ${relationId}`)
      }

      const relation = relations.value[index]
      if (!relation) {
        throw new Error(`关系不存在: ${relationId}`)
      }
      relations.value[index] = { ...relation, ...updates }
      logger.info(`关系已更新: ${relationId}`, { updates })
    } catch (err) {
      const error = err as Error
      logger.error("更新关系失败", { relationId, error: error.message })
      throw error
    }
  }

  const removeRelation = (relationIndex: number) => {
    try {
      if (relationIndex < 0 || relationIndex >= relations.value.length) {
        throw new Error(`关系索引超出范围: ${relationIndex}`)
      }

      const relation = relations.value[relationIndex]
      if (!relation) {
        throw new Error(`关系不存在: ${relationIndex}`)
      }
      relations.value.splice(relationIndex, 1)
      logger.info(`关系已删除: ${relation.fromEntity} -> ${relation.toEntity}`, {
        relationId: relation.id
      })
    } catch (err) {
      const error = err as Error
      logger.error("删除关系失败", { relationIndex, error: error.message })
      throw error
    }
  }

  // 实体完成状态检查
  const checkEntityCompletion = (entityId: string) => {
    try {
      const entity = entities.value.find(e => e.id === entityId)
      if (!entity) return

      // 完成条件：
      // 1. 至少有一个主键字段
      // 2. 至少有2个字段（包括主键）
      // 3. 实体名和表名不为空
      const hasPrimaryKey = entity.fields.some(f => f.isPrimaryKey)
      const hasMinFields = entity.fields.length >= 2
      const hasBasicInfo = Boolean(entity.name && entity.tableName)

      const isCompleted = hasPrimaryKey && hasMinFields && hasBasicInfo

      if (entity.isCompleted !== isCompleted) {
        entity.isCompleted = isCompleted
        logger.info(`实体完成状态更新: ${entity.name} = ${isCompleted}`, { entityId })
      }
    } catch (err) {
      const error = err as Error
      logger.error("检查实体完成状态失败", { entityId, error: error.message })
    }
  }

  // 数据持久化
  // 🔥 v9.0修复：localStorage伪实现已废弃
  const saveToLocalStorage = () => {
    logger.warn("⚠️ saveToLocalStorage已废弃，数据由后端API自动持久化")
  }

  // 🔥 v9.0修复：从后端API加载数据
  const loadFromLocalStorage = async (): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      // 🔥 从后端API加载所有实体
      const entitiesData = await getAllEntities()
      entities.value = entitiesData.map((e: any) => ({
        id: e.id,
        name: e.name,
        tableName: e.tableName,
        displayName: e.displayName,
        description: e.description || '',
        category: ((e.entityType || 'core') === 'relation' || (e.entityType || 'core') === 'config' || (e.entityType || 'core') === 'log') ? (e.entityType as 'relation' | 'config' | 'log') : 'core',
        module: e.namespace,
        fields: e.fields || [],
        validationRules: e.validationRules || [],
        enableSoftDelete: false,
        enableAudit: true,
        enableMultiTenant: false,
        isCompleted: false
      }))

      // 🔥 从后端API加载所有关系
      const relationsData = await getAllRelations()
      relations.value = relationsData.map((r: any) => ({
        id: r.id,
        fromEntity: r.fromEntity,
        toEntity: r.toEntity,
        type: ((): 'one-to-one' | 'one-to-many' | 'many-to-many' => {
          const t = String(r.relationType || '').toLowerCase()
          if (t === 'one-to-one') return 'one-to-one'
          if (t === 'many-to-many') return 'many-to-many'
          return 'one-to-many'
        })(),
        foreignKey: r.foreignKey,
        navigationProperty: r.navigationProperty
      }))

      logger.info("✅ 实体建模数据已从后端加载", {
        entitiesCount: entities.value.length,
        relationsCount: relations.value.length
      })
    } catch (err) {
      const errorObj = err as Error
      error.value = `加载数据失败: ${errorObj.message}`
      logger.error("❌ 从后端加载数据失败", { error: errorObj.message })
      // 降级到空数据
      entities.value = []
      relations.value = []
    } finally {
      isLoading.value = false
    }
  }

  const clearAllData = () => {
    try {
      entities.value = []
      relations.value = []
      localStorage.removeItem("smartabp-entity-modeling")
      logger.info("所有实体建模数据已清除")
    } catch (err) {
      const error = err as Error
      logger.error("清除数据失败", { error: error.message })
    }
  }

  // 导出为JSON架构
  const exportSchema = () => {
    try {
      // Schema export functionality - currently not implemented
      // Future: return schema object for export
    } catch (err) {
      const error = err as Error
      logger.error("导出架构失败", { error: error.message })
      throw error
    }
  }

  // 从JSON架构导入
  const importSchema = (schema: any) => {
    try {
      if (!schema.entities || !Array.isArray(schema.entities)) {
        throw new Error("无效的架构格式：缺少entities数组")
      }

      // 验证架构格式
      for (const entity of schema.entities) {
        if (!entity.name || !entity.tableName || !Array.isArray(entity.fields)) {
          throw new Error(`无效的实体格式：${entity.name || "未知实体"}`)
        }
      }

      entities.value = schema.entities
      relations.value = schema.relations || []

      // 重新检查所有实体的完成状态
      entities.value.forEach(entity => checkEntityCompletion(entity.id))

      logger.info("架构导入成功", {
        entitiesCount: entities.value.length,
        relationsCount: relations.value.length
      })
    } catch (err) {
      const error = err as Error
      logger.error("导入架构失败", { error: error.message })
      throw error
    }
  }

  // 🛡️ 核心功能保护: 实体删除和验证方法
  const deleteEntity = removeEntity

  const validateEntity = (entityId: string): boolean => {
    const entity = entities.value.find(e => e.id === entityId)
    if (!entity) {
      logger.warn('实体不存在', { entityId })
      return false
    }

    // 基本验证
    const isValid = !!(
      entity.name &&
      entity.tableName &&
      entity.fields &&
      entity.fields.length > 0
    )

    logger.info('实体验证结果', { entityId, isValid })
    return isValid
  }

  // 数据验证
  const validateSchema = () => {
    const errors: string[] = []

    try {
      // 检查实体
      entities.value.forEach(entity => {
        // 检查基本信息
        if (!entity.name) errors.push(`实体缺少名称: ${entity.id}`)
        if (!entity.tableName) errors.push(`实体缺少表名: ${entity.name}`)

        // 检查主键
        const primaryKeys = entity.fields.filter(f => f.isPrimaryKey)
        if (primaryKeys.length === 0) {
          errors.push(`实体缺少主键: ${entity.name}`)
        } else if (primaryKeys.length > 1) {
          errors.push(`实体有多个主键: ${entity.name}`)
        }

        // 检查字段名重复
        const fieldNames = entity.fields.map(f => f.name)
        const duplicates = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index)
        if (duplicates.length > 0) {
          errors.push(`实体有重复字段名: ${entity.name} - ${duplicates.join(", ")}`)
        }
      })

      // 检查关系
      relations.value.forEach(relation => {
        const fromExists = entities.value.some(e => e.name === relation.fromEntity)
        const toExists = entities.value.some(e => e.name === relation.toEntity)

        if (!fromExists) errors.push(`关系引用不存在的源实体: ${relation.fromEntity}`)
        if (!toExists) errors.push(`关系引用不存在的目标实体: ${relation.toEntity}`)
      })

      if (errors.length > 0) {
        logger.warn("架构验证发现问题", { errors })
      } else {
        logger.info("架构验证通过")
      }

      return errors
    } catch (err) {
      const error = err as Error
      logger.error("架构验证失败", { error: error.message })
      return [`验证过程出错: ${error.message}`]
    }
  }

  // 获取统计信息
  const getStatistics = () => {
    try {
      const stats = {
        totalEntities: entities.value.length,
        completedEntities: entities.value.filter(e => e.isCompleted).length,
        totalFields: entities.value.reduce((sum, e) => sum + e.fields.length, 0),
        totalRelations: relations.value.length,
        totalValidationRules: entities.value.reduce((sum, e) => sum + e.validationRules.length, 0),
        entitiesByCategory: {
          core: entities.value.filter(e => e.category === "core").length,
          relation: entities.value.filter(e => e.category === "relation").length,
          config: entities.value.filter(e => e.category === "config").length,
          log: entities.value.filter(e => e.category === "log").length
        },
        relationsByType: {
          "one-to-one": relations.value.filter(r => r.type === "one-to-one").length,
          "one-to-many": relations.value.filter(r => r.type === "one-to-many").length,
          "many-to-many": relations.value.filter(r => r.type === "many-to-many").length
        }
      }

      logger.debug("统计信息已生成", stats)
      return stats
    } catch (err) {
      const error = err as Error
      logger.error("获取统计信息失败", { error: error.message })
      throw error
    }
  }

  return {
    // 状态
    entities,
    relations,
    isLoading,
    error,

    // 实体操作
    addEntity,
    updateEntity,
    removeEntity,
    deleteEntity, // 🛡️ 别名：确保核心功能保护验证
    validateEntity, // 🛡️ 核心功能保护

    // 字段操作
    addField,
    updateField,
    removeField,

    // 验证规则操作
    addValidationRule,
    updateValidationRule,
    removeValidationRule,

    // 关系操作
    addRelation,
    updateRelation,
    removeRelation,

    // 工具方法
    checkEntityCompletion,
    saveToLocalStorage,
    loadFromLocalStorage,
    clearAllData,
    exportSchema,
    importSchema,
    validateSchema,
    getStatistics,

    // 初始化方法 - 确保用户能立即使用
    initialize: () => {
      loadFromLocalStorage()

      // 如果没有实体，创建示例实体供用户立即测试代码生成
      if (entities.value.length === 0) {
        logger.info('创建示例实体，便于用户测试代码生成功能')

        const userEntity = {
          name: 'User',
          tableName: 'Users',
          displayName: '用户',
          description: '系统用户实体 - 用于测试代码生成',
          category: 'core' as const,
          module: 'Identity',
          fields: [
            { name: 'Id', displayName: '主键', type: 'Guid', isRequired: true, isPrimaryKey: true },
            { name: 'UserName', displayName: '用户名', type: 'string', length: 50, isRequired: true, isPrimaryKey: false },
            { name: 'Email', displayName: '邮箱', type: 'string', length: 100, isRequired: true, isPrimaryKey: false },
            { name: 'IsActive', displayName: '是否启用', type: 'bool', isRequired: true, isPrimaryKey: false }
          ],
          validationRules: [],
          enableSoftDelete: true,
          enableAudit: true,
          enableMultiTenant: false,
          isCompleted: true
        }

        addEntity(userEntity)
        saveToLocalStorage()
      }
    }
  }
})
