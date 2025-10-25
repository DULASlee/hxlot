/**
 * 🔥 EntityModeling Store 单元测试
 * 测试覆盖率目标：90%+
 * 功能：实体建模Store的核心业务逻辑测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEntityModelingStore } from '@/stores/entityModeling'
import * as entityModelingApi from '@/api/lowcode/entity-modeling'

// Mock API
vi.mock('@/api/lowcode/entity-modeling', () => ({
  getAllEntities: vi.fn(),
  getEntityById: vi.fn(),
  createEntity: vi.fn(),
  updateEntity: vi.fn(),
  deleteEntity: vi.fn(),
  getAllRelations: vi.fn(),
  createRelation: vi.fn(),
  updateRelation: vi.fn(),
  deleteRelation: vi.fn(),
  validateSchema: vi.fn()
}))

// Mock logger
vi.mock('@smartabp/lowcode-shared', () => ({
  getGlobalLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  })
}))

describe('EntityModelingStore', () => {
  let store: ReturnType<typeof useEntityModelingStore>

  const mockEntities = [
    {
      id: 'entity-1',
      name: 'User',
      tableName: 'Users',
      displayName: '用户',
      description: '系统用户实体',
      category: 'core' as const,
      module: 'Identity',
      fields: [
        {
          name: 'Id',
          displayName: '主键',
          type: 'Guid',
          isRequired: true,
          isPrimaryKey: true,
          order: 0
        },
        {
          name: 'UserName',
          displayName: '用户名',
          type: 'string',
          length: 50,
          isRequired: true,
          isPrimaryKey: false,
          order: 1
        }
      ],
      validationRules: [],
      enableSoftDelete: true,
      enableAudit: true,
      enableMultiTenant: false,
      isCompleted: true
    },
    {
      id: 'entity-2',
      name: 'Role',
      tableName: 'Roles',
      displayName: '角色',
      description: '系统角色实体',
      category: 'core' as const,
      module: 'Identity',
      fields: [
        {
          name: 'Id',
          displayName: '主键',
          type: 'Guid',
          isRequired: true,
          isPrimaryKey: true,
          order: 0
        }
      ],
      validationRules: [],
      enableSoftDelete: false,
      enableAudit: true,
      enableMultiTenant: false,
      isCompleted: false
    }
  ]

  const mockRelations = [
    {
      id: 'relation-1',
      fromEntity: 'User',
      toEntity: 'Role',
      type: 'many-to-many' as const,
      foreignKey: 'UserId',
      navigationProperty: 'Roles'
    }
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useEntityModelingStore()

    // Mock API响应
    vi.mocked(entityModelingApi.getAllEntities).mockResolvedValue(mockEntities)
    vi.mocked(entityModelingApi.getAllRelations).mockResolvedValue(mockRelations)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Store初始化', () => {
    it('应该正确初始化store状态', () => {
      expect(store.entities).toEqual([])
      expect(store.relations).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('应该提供所有必要的方法', () => {
      expect(typeof store.addEntity).toBe('function')
      expect(typeof store.updateEntity).toBe('function')
      expect(typeof store.removeEntity).toBe('function')
      expect(typeof store.addField).toBe('function')
      expect(typeof store.updateField).toBe('function')
      expect(typeof store.removeField).toBe('function')
      expect(typeof store.addRelation).toBe('function')
      expect(typeof store.updateRelation).toBe('function')
      expect(typeof store.removeRelation).toBe('function')
      expect(typeof store.checkEntityCompletion).toBe('function')
      expect(typeof store.loadFromLocalStorage).toBe('function')
      expect(typeof store.saveToLocalStorage).toBe('function')
    })
  })

  describe('实体管理', () => {
    it('应该能够添加实体', async () => {
      const newEntity = {
        id: 'entity-3',
        name: 'Product',
        tableName: 'Products',
        displayName: '产品',
        description: '产品实体',
        category: 'core' as const,
        module: 'Catalog',
        fields: [],
        validationRules: [],
        enableSoftDelete: false,
        enableAudit: true,
        enableMultiTenant: false,
        isCompleted: false
      }

      // Mock API响应
      vi.mocked(entityModelingApi.createEntity).mockResolvedValue(newEntity)

      const result = await store.addEntity(newEntity)

      expect(result).toEqual(newEntity)
      expect(store.entities).toContain(newEntity)
    })

    it('应该能够更新实体', async () => {
      // 先添加一个实体
      const entity = { ...mockEntities[0] }
      store.entities = [entity]

      const updates = {
        displayName: '更新后的用户',
        description: '更新后的描述'
      }

      // Mock API响应
      vi.mocked(entityModelingApi.updateEntity).mockResolvedValue({
        ...entity,
        ...updates
      })

      await store.updateEntity(entity.id, updates)

      expect(entityModelingApi.updateEntity).toHaveBeenCalledWith(
        entity.id,
        expect.objectContaining(updates)
      )
    })

    it('应该能够删除实体', async () => {
      // 先添加实体
      const entity = { ...mockEntities[0] }
      store.entities = [entity]

      // Mock API响应
      vi.mocked(entityModelingApi.deleteEntity).mockResolvedValue(undefined)

      await store.removeEntity(entity.id)

      expect(entityModelingApi.deleteEntity).toHaveBeenCalledWith(entity.id)
      expect(store.entities).not.toContain(entity)
    })
  })

  describe('字段管理', () => {
    it('应该能够添加字段', () => {
      const entity = { ...mockEntities[0] }
      store.entities = [entity]

      const newField = {
        name: 'Email',
        displayName: '邮箱',
        type: 'string',
        length: 100,
        isRequired: true,
        isPrimaryKey: false,
        order: 2
      }

      store.addField(entity.id, newField)

      expect(entity.fields).toContain(newField)
    })

    it('应该能够更新字段', () => {
      const entity = { ...mockEntities[0] }
      store.entities = [entity]

      const fieldIndex = 0
      const updates = {
        displayName: '更新后的主键',
        isRequired: false
      }

      store.updateField(entity.id, fieldIndex, updates)

      expect(entity.fields[fieldIndex].displayName).toBe('更新后的主键')
      expect(entity.fields[fieldIndex].isRequired).toBe(false)
    })

    it('应该能够删除字段', () => {
      const entity = { ...mockEntities[0] }
      store.entities = [entity]

      const fieldIndex = 1

      store.removeField(entity.id, fieldIndex)

      expect(entity.fields).toHaveLength(1)
      expect(entity.fields).not.toContain(
        expect.objectContaining({ name: 'UserName' })
      )
    })

    it('应该防止添加重复字段名', () => {
      const entity = { ...mockEntities[0] }
      store.entities = [entity]

      const duplicateField = {
        name: 'Id', // 重复的字段名
        displayName: '重复ID',
        type: 'string',
        length: 10,
        isRequired: false,
        isPrimaryKey: false,
        order: 2
      }

      expect(() => {
        store.addField(entity.id, duplicateField)
      }).toThrow('字段名已存在')
    })
  })

  describe('关系管理', () => {
    it('应该能够添加关系', () => {
      const newRelation = {
        id: 'relation-2',
        fromEntity: 'User',
        toEntity: 'Organization',
        type: 'many-to-one' as const,
        foreignKey: 'OrganizationId',
        navigationProperty: 'Organization'
      }

      const result = store.addRelation(newRelation)

      expect(result).toEqual(newRelation)
      expect(store.relations).toContain(newRelation)
    })

    it('应该能够更新关系', () => {
      const relation = { ...mockRelations[0] }
      store.relations = [relation]

      const updates = {
        foreignKey: 'UpdatedUserId',
        navigationProperty: 'UpdatedRoles'
      }

      store.updateRelation(relation.id, updates)

      expect(relation.foreignKey).toBe('UpdatedUserId')
      expect(relation.navigationProperty).toBe('UpdatedRoles')
    })

    it('应该能够删除关系', () => {
      const relation = { ...mockRelations[0] }
      store.relations = [relation]

      store.removeRelation(0)

      expect(store.relations).toHaveLength(0)
    })

    it('应该防止添加重复关系', () => {
      store.relations = [mockRelations[0]]

      const duplicateRelation = {
        id: 'relation-duplicate',
        fromEntity: 'User',
        toEntity: 'Role',
        type: 'many-to-many' as const,
        foreignKey: 'UserId',
        navigationProperty: 'Roles'
      }

      expect(() => {
        store.addRelation(duplicateRelation)
      }).toThrow('关系已存在')
    })
  })

  describe('验证规则管理', () => {
    it('应该能够添加验证规则', () => {
      const entity = { ...mockEntities[0] }
      store.entities = [entity]

      const newRule = {
        fieldName: 'UserName',
        ruleType: 'length' as const,
        ruleValue: '50',
        errorMessage: '用户名长度不能超过50个字符'
      }

      store.addValidationRule(entity.id, newRule)

      expect(entity.validationRules).toContain(newRule)
    })

    it('应该能够更新验证规则', () => {
      const entity = { ...mockEntities[0] }
      const rule = {
        fieldName: 'UserName',
        ruleType: 'length' as const,
        ruleValue: '50',
        errorMessage: '用户名长度不能超过50个字符'
      }
      entity.validationRules = [rule]
      store.entities = [entity]

      const updates = {
        ruleValue: '100',
        errorMessage: '更新后的错误信息'
      }

      store.updateValidationRule(entity.id, 0, updates)

      expect(entity.validationRules[0].ruleValue).toBe('100')
      expect(entity.validationRules[0].errorMessage).toBe('更新后的错误信息')
    })

    it('应该能够删除验证规则', () => {
      const entity = { ...mockEntities[0] }
      const rule = {
        fieldName: 'UserName',
        ruleType: 'length' as const,
        ruleValue: '50',
        errorMessage: '用户名长度不能超过50个字符'
      }
      entity.validationRules = [rule]
      store.entities = [entity]

      store.removeValidationRule(entity.id, 0)

      expect(entity.validationRules).toHaveLength(0)
    })
  })

  describe('实体完成状态检查', () => {
    it('应该正确识别完整实体', () => {
      const completeEntity = { ...mockEntities[0] }
      store.entities = [completeEntity]

      store.checkEntityCompletion(completeEntity.id)

      expect(completeEntity.isCompleted).toBe(true)
    })

    it('应该正确识别不完整实体', () => {
      const incompleteEntity = { ...mockEntities[1] }
      store.entities = [incompleteEntity]

      store.checkEntityCompletion(incompleteEntity.id)

      expect(incompleteEntity.isCompleted).toBe(false)
    })

    it('应该在添加字段时重新检查完成状态', () => {
      const entity = { ...mockEntities[1] }
      store.entities = [entity]

      // 添加主键字段使实体完整
      const primaryKeyField = {
        name: 'Id',
        displayName: '主键',
        type: 'Guid',
        isRequired: true,
        isPrimaryKey: true,
        order: 0
      }

      store.addField(entity.id, primaryKeyField)

      expect(entity.isCompleted).toBe(true)
    })
  })

  describe('数据持久化', () => {
    it('应该能够保存到localStorage', () => {
      // Mock localStorage
      const mockLocalStorage = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn()
      }
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage
      })

      store.saveToLocalStorage()

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'smartabp-entity-modeling',
        expect.any(String)
      )
    })

    it('应该能够从localStorage加载数据', async () => {
      // Mock localStorage
      const mockLocalStorage = {
        setItem: vi.fn(),
        getItem: vi.fn(() => JSON.stringify(mockEntities)),
        removeItem: vi.fn()
      }
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage
      })

      await store.loadFromLocalStorage()

      expect(store.entities).toEqual(mockEntities)
    })
  })

  describe('数据验证', () => {
    it('应该正确验证实体', () => {
      const validEntity = { ...mockEntities[0] }
      store.entities = [validEntity]

      const isValid = store.validateEntity(validEntity.id)

      expect(isValid).toBe(true)
    })

    it('应该拒绝无效实体', () => {
      const invalidEntity = {
        id: 'invalid-entity',
        name: '',
        tableName: '',
        displayName: '',
        category: 'core' as const,
        module: '',
        fields: [],
        validationRules: [],
        enableSoftDelete: false,
        enableAudit: false,
        enableMultiTenant: false,
        isCompleted: false
      }
      store.entities = [invalidEntity]

      const isValid = store.validateEntity(invalidEntity.id)

      expect(isValid).toBe(false)
    })

    it('应该正确验证架构', () => {
      store.entities = mockEntities
      store.relations = mockRelations

      const errors = store.validateSchema()

      // 应该没有验证错误
      expect(errors.length).toBe(0)
    })
  })

  describe('统计功能', () => {
    it('应该正确计算统计信息', () => {
      store.entities = mockEntities
      store.relations = mockRelations

      const stats = store.getStatistics()

      expect(stats.totalEntities).toBe(2)
      expect(stats.completedEntities).toBe(1)
      expect(stats.totalFields).toBe(3)
      expect(stats.totalRelations).toBe(1)
    })
  })

  describe('错误处理', () => {
    it('应该正确处理API错误', async () => {
      vi.mocked(entityModelingApi.getAllEntities).mockRejectedValue(
        new Error('网络错误')
      )

      // 不应该抛出错误，而是设置错误状态
      await expect(store.loadFromLocalStorage()).resolves.toBeUndefined()
      expect(store.error).toBeTruthy()
    })

    it('应该正确处理无效操作', () => {
      expect(() => {
        store.updateEntity('non-existent-id', {})
      }).toThrow()

      expect(() => {
        store.addField('non-existent-id', {} as any)
      }).toThrow()

      expect(() => {
        store.removeField('non-existent-id', 0)
      }).toThrow()
    })
  })

  describe('数据一致性', () => {
    it('删除实体时应该同时删除相关关系', async () => {
      store.entities = mockEntities
      store.relations = mockRelations

      // Mock API响应
      vi.mocked(entityModelingApi.deleteEntity).mockResolvedValue(undefined)

      await store.removeEntity('entity-1')

      // 应该删除相关的关系
      expect(store.relations.some(r =>
        r.fromEntity === 'User' || r.toEntity === 'User'
      )).toBe(false)
    })

    it('应该维护字段顺序', () => {
      const entity = { ...mockEntities[0] }
      store.entities = [entity]

      const field1 = {
        name: 'Field1',
        displayName: '字段1',
        type: 'string',
        isRequired: false,
        isPrimaryKey: false,
        order: 2
      }

      const field2 = {
        name: 'Field2',
        displayName: '字段2',
        type: 'string',
        isRequired: false,
        isPrimaryKey: false,
        order: 1
      }

      store.addField(entity.id, field1)
      store.addField(entity.id, field2)

      // 检查字段是否按顺序排列
      expect(entity.fields[1].order).toBe(1)
      expect(entity.fields[2].order).toBe(2)
    })
  })
})
