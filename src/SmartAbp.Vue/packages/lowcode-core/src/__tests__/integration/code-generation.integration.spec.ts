/**
 * 代码生成完整流程集成测试
 * 测试从实体定义到代码生成的完整流程
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCodeGenerationStore } from '../../stores/codeGeneration'
import type { CodeGenerationConfig } from '../../stores/codeGeneration'

describe('代码生成完整流程集成测试', () => {
  let store: ReturnType<typeof useCodeGenerationStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useCodeGenerationStore()
  })

  describe('完整代码生成流程', () => {
    it('应该完成从配置到代码生成的完整流程', async () => {
      // 1. 准备代码生成配置
      const config: CodeGenerationConfig = {
        entityName: 'Product',
        namespace: 'TestApp',
        targetFramework: 'abp',
        outputPath: './generated',
        features: {
          frontend: {
            generateList: true,
            generateForm: true,
            generateDetail: true,
            uiFramework: 'element-plus'
          },
          backend: {
            generateAppService: true,
            generateDto: true,
            generateRepository: true,
            generatePermissions: true
          }
        },
        fields: [
          {
            name: 'Name',
            type: 'string',
            displayName: '产品名称',
            isRequired: true,
            maxLength: 100
          },
          {
            name: 'Price',
            type: 'decimal',
            displayName: '价格',
            isRequired: true
          },
          {
            name: 'Description',
            type: 'string',
            displayName: '描述',
            maxLength: 500
          }
        ]
      }

      // 2. 执行代码生成
      const result = await store.generateCode(config)

      // 3. 验证生成结果
      expect(result.success).toBe(true)
      expect(result.fileCount).toBeGreaterThan(0)
      expect(result.lineCount).toBeGreaterThan(0)
      expect(result.files).toBeDefined()
      expect(result.files.length).toBeGreaterThan(0)

      // 4. 验证生成的文件类型
      const frontendFiles = result.files.filter(f => f.path.includes('frontend'))
      const backendFiles = result.files.filter(f => f.path.includes('backend'))

      expect(frontendFiles.length).toBeGreaterThan(0)
      expect(backendFiles.length).toBeGreaterThan(0)
    })

    it('应该生成完整的前端文件', async () => {
      const config: CodeGenerationConfig = {
        entityName: 'Order',
        namespace: 'TestApp',
        targetFramework: 'abp',
        outputPath: './generated',
        features: {
          frontend: {
            generateList: true,
            generateForm: true,
            generateDetail: true,
            uiFramework: 'element-plus'
          },
          backend: {
            generateAppService: false,
            generateDto: false,
            generateRepository: false,
            generatePermissions: false
          }
        },
        fields: [
          {
            name: 'OrderNo',
            type: 'string',
            displayName: '订单号',
            isRequired: true
          }
        ]
      }

      const result = await store.generateCode(config)

      expect(result.success).toBe(true)
      
      // 验证生成了列表页
      const hasListView = result.files.some(f => f.path.includes('ListView.vue'))
      expect(hasListView).toBe(true)

      // 验证生成了表单页
      const hasFormView = result.files.some(f => f.path.includes('FormView.vue'))
      expect(hasFormView).toBe(true)

      // 验证生成了详情页
      const hasDetailView = result.files.some(f => f.path.includes('DetailView.vue'))
      expect(hasDetailView).toBe(true)
    })

    it('应该生成完整的后端文件', async () => {
      const config: CodeGenerationConfig = {
        entityName: 'Customer',
        namespace: 'TestApp',
        targetFramework: 'abp',
        outputPath: './generated',
        features: {
          frontend: {
            generateList: false,
            generateForm: false,
            generateDetail: false,
            uiFramework: 'element-plus'
          },
          backend: {
            generateAppService: true,
            generateDto: true,
            generateRepository: true,
            generatePermissions: true
          }
        },
        fields: [
          {
            name: 'CustomerName',
            type: 'string',
            displayName: '客户名称',
            isRequired: true
          }
        ]
      }

      const result = await store.generateCode(config)

      expect(result.success).toBe(true)

      // 验证生成了应用服务
      const hasAppService = result.files.some(f => f.path.includes('AppService.cs'))
      expect(hasAppService).toBe(true)

      // 验证生成了DTO
      const hasDto = result.files.some(f => f.path.includes('Dto.cs'))
      expect(hasDto).toBe(true)

      // 验证生成了仓储
      const hasRepository = result.files.some(f => f.path.includes('Repository'))
      expect(hasRepository).toBe(true)
    })
  })

  describe('代码生成历史和统计', () => {
    it('应该记录代码生成历史', async () => {
      const config: CodeGenerationConfig = {
        entityName: 'Test',
        namespace: 'TestApp',
        targetFramework: 'abp',
        outputPath: './generated',
        features: {
          frontend: { generateList: true, generateForm: false, generateDetail: false, uiFramework: 'element-plus' },
          backend: { generateAppService: true, generateDto: true, generateRepository: false, generatePermissions: false }
        },
        fields: []
      }

      await store.generateCode(config)

      expect(store.generationHistory.length).toBe(1)
      expect(store.generationHistory[0].entityName).toBe('Test')
    })

    it('应该提供准确的统计信息', async () => {
      const config: CodeGenerationConfig = {
        entityName: 'Stats',
        namespace: 'TestApp',
        targetFramework: 'abp',
        outputPath: './generated',
        features: {
          frontend: { generateList: true, generateForm: true, generateDetail: true, uiFramework: 'element-plus' },
          backend: { generateAppService: true, generateDto: true, generateRepository: true, generatePermissions: true }
        },
        fields: []
      }

      await store.generateCode(config)

      const stats = store.getStatistics()
      
      expect(stats.totalGenerations).toBe(1)
      expect(stats.totalFiles).toBeGreaterThan(0)
      expect(stats.totalLines).toBeGreaterThan(0)
      expect(stats.successRate).toBe(100)
    })
  })

  describe('模板管理集成', () => {
    it('应该加载代码生成模板', () => {
      const templates = store.loadTemplates()
      expect(templates).toBeDefined()
      expect(Array.isArray(templates)).toBe(true)
    })

    it('应该支持应用模板生成代码', async () => {
      const config: CodeGenerationConfig = {
        entityName: 'TemplateTest',
        namespace: 'TestApp',
        targetFramework: 'abp',
        outputPath: './generated',
        features: {
          frontend: { generateList: true, generateForm: false, generateDetail: false, uiFramework: 'element-plus' },
          backend: { generateAppService: true, generateDto: false, generateRepository: false, generatePermissions: false }
        },
        fields: []
      }

      const result = await store.applyTemplate('default', config)
      expect(result.success).toBe(true)
    })
  })
})
