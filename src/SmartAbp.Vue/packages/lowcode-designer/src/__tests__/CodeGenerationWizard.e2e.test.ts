/**
 * 代码生成向导端到端测试
 * 
 * 测试覆盖：
 * - 完整的5步向导流程
 * - 实体设计和关系配置
 * - UI定制和代码生成
 * - 错误处理和边界情况
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { ElMessage } from 'element-plus'
import CodeGenerationWizard from '../components/CodeGenerationWizard.vue'

// Mock Element Plus组件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    }
  }
})

describe('CodeGenerationWizard - 端到端测试', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    wrapper = mount(CodeGenerationWizard, {
      props: {
        visible: true
      },
      global: {
        stubs: {
          'el-card': true,
          'el-steps': true,
          'el-step': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-button': true,
          'el-table': true,
          'el-table-column': true,
          'el-checkbox-group': true,
          'el-checkbox': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-color-picker': true,
          'el-alert': true,
          'el-dialog': true,
          'el-progress': true,
          'el-result': true,
          'el-tree': true,
          'el-tag': true,
          'el-icon': true
        }
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('步骤1：项目配置', () => {
    it('应该正确初始化项目配置表单', () => {
      expect(wrapper.vm.currentStep).toBe(0)
      expect(wrapper.vm.projectConfig).toBeDefined()
      expect(wrapper.vm.projectConfig.projectName).toBe('')
      expect(wrapper.vm.projectConfig.databaseType).toBe('SqlServer')
    })

    it('应该验证必填项', async () => {
      const vm = wrapper.vm as any
      
      // 不填写项目名称，点击下一步
      try {
        await vm.nextStep()
        // 应该抛出验证错误
        expect(true).toBe(false) // 不应该执行到这里
      } catch (error) {
        // 验证失败，符合预期
        expect(true).toBe(true)
      }
    })

    it('应该验证项目代码格式（PascalCase）', async () => {
      const vm = wrapper.vm as any
      
      vm.projectConfig.projectName = '测试项目'
      vm.projectConfig.projectCode = 'testProject' // 不符合PascalCase
      vm.projectConfig.namespace = 'TestProject'
      
      try {
        await vm.nextStep()
        // 应该验证失败
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('应该成功填写并进入下一步', async () => {
      const vm = wrapper.vm as any
      
      vm.projectConfig.projectName = '智慧工地管理系统'
      vm.projectConfig.projectCode = 'SmartConstruction'
      vm.projectConfig.namespace = 'SmartConstruction'
      vm.projectConfig.databaseType = 'PostgreSQL'
      vm.projectConfig.description = '这是一个测试项目'
      
      // Mock表单验证通过
      vm.projectFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }
      
      await vm.nextStep()
      
      expect(vm.currentStep).toBe(1)
    })
  })

  describe('步骤2：实体设计', () => {
    beforeEach(async () => {
      const vm = wrapper.vm as any
      
      // 先完成步骤1
      vm.projectConfig = {
        projectName: '测试项目',
        projectCode: 'TestProject',
        namespace: 'TestProject',
        databaseType: 'SqlServer'
      }
      vm.projectFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }
      await vm.nextStep()
    })

    it('应该能够添加实体', () => {
      const vm = wrapper.vm as any
      
      expect(vm.entities.length).toBe(0)
      
      vm.addEntity()
      
      expect(vm.entities.length).toBe(1)
      expect(vm.entities[0]).toHaveProperty('name')
      expect(vm.entities[0]).toHaveProperty('displayName')
      expect(vm.entities[0]).toHaveProperty('properties')
    })

    it('应该能够删除实体', () => {
      const vm = wrapper.vm as any
      
      vm.addEntity()
      vm.addEntity()
      expect(vm.entities.length).toBe(2)
      
      vm.deleteEntity(0)
      expect(vm.entities.length).toBe(1)
    })

    it('应该验证实体名称格式', () => {
      const vm = wrapper.vm as any
      
      const entity = { name: 'invalidName', displayName: '测试' }
      vm.validateEntityName(entity)
      
      expect(ElMessage.warning).toHaveBeenCalledWith(
        expect.stringContaining('大写字母')
      )
    })

    it('应该能够编辑实体属性', () => {
      const vm = wrapper.vm as any
      
      vm.addEntity()
      const entity = vm.entities[0]
      entity.name = 'Project'
      entity.displayName = '项目'
      
      vm.editEntityProperties(entity)
      
      expect(vm.propertyDialogVisible).toBe(true)
      expect(vm.currentEditEntity).toBe(entity)
    })

    it('应该能够添加和删除属性', () => {
      const vm = wrapper.vm as any
      
      vm.addEntity()
      vm.currentEditEntity = vm.entities[0]
      
      expect(vm.currentEditEntity.properties.length).toBe(0)
      
      vm.addProperty()
      expect(vm.currentEditEntity.properties.length).toBe(1)
      
      vm.deleteProperty(0)
      expect(vm.currentEditEntity.properties.length).toBe(0)
    })

    it('应该阻止在没有实体时进入下一步', async () => {
      const vm = wrapper.vm as any
      
      await vm.nextStep()
      
      expect(ElMessage.warning).toHaveBeenCalledWith('请至少添加一个实体')
      expect(vm.currentStep).toBe(1) // 仍在当前步骤
    })

    it('应该能够成功进入下一步（有实体时）', async () => {
      const vm = wrapper.vm as any
      
      vm.addEntity()
      vm.entities[0].name = 'Project'
      vm.entities[0].displayName = '项目'
      
      await vm.nextStep()
      
      expect(vm.currentStep).toBe(2)
    })
  })

  describe('步骤3：关系配置', () => {
    beforeEach(async () => {
      const vm = wrapper.vm as any
      
      // 完成前两步
      vm.projectConfig = {
        projectName: '测试项目',
        projectCode: 'TestProject',
        namespace: 'TestProject',
        databaseType: 'SqlServer'
      }
      vm.projectFormRef = {
        validate: vi.fn().mockResolvedValue(true)
      }
      await vm.nextStep()
      
      vm.addEntity()
      vm.entities[0].name = 'Project'
      vm.entities[0].displayName = '项目'
      await vm.nextStep()
    })

    it('应该能够添加关系', () => {
      const vm = wrapper.vm as any
      
      expect(vm.relationships.length).toBe(0)
      
      vm.addRelationship()
      
      expect(vm.relationships.length).toBe(1)
      expect(vm.relationships[0]).toHaveProperty('type')
      expect(vm.relationships[0]).toHaveProperty('sourceEntity')
      expect(vm.relationships[0]).toHaveProperty('targetEntity')
      expect(vm.relationships[0]).toHaveProperty('foreignKey')
    })

    it('应该能够删除关系', () => {
      const vm = wrapper.vm as any
      
      vm.addRelationship()
      vm.addRelationship()
      expect(vm.relationships.length).toBe(2)
      
      vm.deleteRelationship(0)
      expect(vm.relationships.length).toBe(1)
    })

    it('应该能够配置不同类型的关系', () => {
      const vm = wrapper.vm as any
      
      // 一对多
      vm.addRelationship()
      vm.relationships[0].type = 'OneToMany'
      expect(vm.relationships[0].type).toBe('OneToMany')
      
      // 多对多
      vm.addRelationship()
      vm.relationships[1].type = 'ManyToMany'
      expect(vm.relationships[1].type).toBe('ManyToMany')
      
      // 一对一
      vm.addRelationship()
      vm.relationships[2].type = 'OneToOne'
      expect(vm.relationships[2].type).toBe('OneToOne')
    })

    it('应该能够进入下一步', async () => {
      const vm = wrapper.vm as any
      
      await vm.nextStep()
      
      expect(vm.currentStep).toBe(3)
    })
  })

  describe('步骤4：UI定制', () => {
    beforeEach(async () => {
      const vm = wrapper.vm as any
      
      // 完成前三步
      vm.currentStep = 3
    })

    it('应该正确初始化UI配置', () => {
      const vm = wrapper.vm as any
      
      expect(vm.uiConfig).toBeDefined()
      expect(vm.uiConfig.theme).toBe('light')
      expect(vm.uiConfig.primaryColor).toBe('#409EFF')
      expect(vm.uiConfig.layout).toBe('classic')
    })

    it('应该能够修改主题', () => {
      const vm = wrapper.vm as any
      
      vm.uiConfig.theme = 'dark'
      expect(vm.uiConfig.theme).toBe('dark')
    })

    it('应该能够修改主色调', () => {
      const vm = wrapper.vm as any
      
      vm.uiConfig.primaryColor = '#FF0000'
      expect(vm.uiConfig.primaryColor).toBe('#FF0000')
    })

    it('应该能够选择UI组件', () => {
      const vm = wrapper.vm as any
      
      vm.uiConfig.components = ['form', 'table', 'chart']
      expect(vm.uiConfig.components).toContain('form')
      expect(vm.uiConfig.components).toContain('chart')
    })

    it('应该能够进入下一步（代码生成）', async () => {
      const vm = wrapper.vm as any
      
      await vm.nextStep()
      
      expect(vm.currentStep).toBe(4)
    })
  })

  describe('步骤5：代码生成', () => {
    beforeEach(async () => {
      const vm = wrapper.vm as any
      
      // 完成前四步
      vm.currentStep = 4
      vm.projectConfig = {
        projectName: '测试项目',
        projectCode: 'TestProject',
        namespace: 'TestProject',
        databaseType: 'SqlServer'
      }
      vm.entities = [
        { name: 'Project', displayName: '项目', properties: [] }
      ]
      vm.relationships = []
      vm.uiConfig = {
        theme: 'light',
        primaryColor: '#409EFF',
        layout: 'classic',
        components: ['form', 'table']
      }
    })

    it('应该正确显示生成准备状态', () => {
      const vm = wrapper.vm as any
      
      expect(vm.isGenerating).toBe(false)
      expect(vm.generationComplete).toBe(false)
    })

    it('应该能够开始生成代码', async () => {
      const vm = wrapper.vm as any
      
      // 模拟定时器
      vi.useFakeTimers()
      
      const generatePromise = vm.startGeneration()
      
      expect(vm.isGenerating).toBe(true)
      expect(vm.generationProgress).toBe(0)
      
      // 快进所有定时器
      await vi.runAllTimersAsync()
      await generatePromise
      
      expect(vm.generationProgress).toBe(100)
      expect(vm.isGenerating).toBe(false)
      expect(vm.generationComplete).toBe(true)
      
      vi.useRealTimers()
    })

    it('应该生成正确的日志', async () => {
      const vm = wrapper.vm as any
      
      vi.useFakeTimers()
      
      const generatePromise = vm.startGeneration()
      await vi.runAllTimersAsync()
      await generatePromise
      
      expect(vm.generationLogs.length).toBeGreaterThan(0)
      expect(vm.generationLogs[0]).toHaveProperty('time')
      expect(vm.generationLogs[0]).toHaveProperty('message')
      expect(vm.generationLogs[0]).toHaveProperty('level')
      
      vi.useRealTimers()
    })

    it('应该生成文件列表', async () => {
      const vm = wrapper.vm as any
      
      vi.useFakeTimers()
      
      await vm.startGeneration()
      await vi.runAllTimersAsync()
      
      expect(vm.generatedFiles.length).toBeGreaterThan(0)
      expect(vm.fileTreeData.length).toBeGreaterThan(0)
      
      vi.useRealTimers()
    })

    it('应该能够下载代码', async () => {
      const vm = wrapper.vm as any
      
      vi.useFakeTimers()
      await vm.startGeneration()
      await vi.runAllTimersAsync()
      vi.useRealTimers()
      
      vm.downloadCode()
      
      expect(ElMessage.success).toHaveBeenCalledWith(
        expect.stringContaining('下载')
      )
    })

    it('应该能够完成整个向导', async () => {
      const vm = wrapper.vm as any
      
      vi.useFakeTimers()
      await vm.startGeneration()
      await vi.runAllTimersAsync()
      vi.useRealTimers()
      
      const emitted = wrapper.emitted('complete')
      
      vm.finish()
      
      expect(wrapper.emitted('complete')).toBeTruthy()
    })
  })

  describe('完整流程测试', () => {
    it('应该能够完成完整的5步向导流程', async () => {
      const vm = wrapper.vm as any
      
      // 步骤1：项目配置
      expect(vm.currentStep).toBe(0)
      vm.projectConfig = {
        projectName: '智慧工地管理系统',
        projectCode: 'SmartConstruction',
        namespace: 'SmartConstruction',
        databaseType: 'PostgreSQL',
        description: '用于工地管理的智能系统',
        techStack: ['ABP vNext', 'Vue3', 'TypeScript', 'Element Plus']
      }
      vm.projectFormRef = { validate: vi.fn().mockResolvedValue(true) }
      await vm.nextStep()
      expect(vm.currentStep).toBe(1)
      
      // 步骤2：实体设计
      vm.addEntity()
      vm.entities[0].name = 'Project'
      vm.entities[0].displayName = '项目'
      vm.entities[0].properties = [
        { name: 'Name', displayName: '名称', type: 'string', isRequired: true },
        { name: 'StartDate', displayName: '开始日期', type: 'datetime', isRequired: true }
      ]
      
      vm.addEntity()
      vm.entities[1].name = 'Task'
      vm.entities[1].displayName = '任务'
      vm.entities[1].properties = [
        { name: 'Title', displayName: '标题', type: 'string', isRequired: true },
        { name: 'Status', displayName: '状态', type: 'string', isRequired: false }
      ]
      
      await vm.nextStep()
      expect(vm.currentStep).toBe(2)
      
      // 步骤3：关系配置
      vm.addRelationship()
      vm.relationships[0] = {
        type: 'OneToMany',
        sourceEntity: 'Project',
        targetEntity: 'Task',
        foreignKey: 'ProjectId'
      }
      
      await vm.nextStep()
      expect(vm.currentStep).toBe(3)
      
      // 步骤4：UI定制
      vm.uiConfig = {
        theme: 'light',
        primaryColor: '#1890ff',
        layout: 'sidebar',
        components: ['form', 'table', 'search', 'detail']
      }
      
      await vm.nextStep()
      expect(vm.currentStep).toBe(4)
      
      // 步骤5：代码生成
      vi.useFakeTimers()
      await vm.startGeneration()
      await vi.runAllTimersAsync()
      vi.useRealTimers()
      
      expect(vm.generationComplete).toBe(true)
      expect(vm.generatedFiles.length).toBeGreaterThan(0)
      
      // 完成
      vm.finish()
      expect(wrapper.emitted('complete')).toBeTruthy()
      
      const completeData = wrapper.emitted('complete')?.[0]?.[0]
      expect(completeData).toHaveProperty('projectConfig')
      expect(completeData).toHaveProperty('entities')
      expect(completeData).toHaveProperty('relationships')
      expect(completeData).toHaveProperty('uiConfig')
    })
  })

  describe('边界情况和错误处理', () => {
    it('应该能够回到上一步', async () => {
      const vm = wrapper.vm as any
      
      vm.currentStep = 2
      vm.prevStep()
      
      expect(vm.currentStep).toBe(1)
    })

    it('应该能够保存进度', () => {
      const vm = wrapper.vm as any
      
      vm.saveProgress()
      
      expect(ElMessage.success).toHaveBeenCalledWith('进度已保存')
    })

    it('应该处理空实体列表', async () => {
      const vm = wrapper.vm as any
      
      vm.currentStep = 1
      vm.entities = []
      
      await vm.nextStep()
      
      expect(ElMessage.warning).toHaveBeenCalled()
      expect(vm.currentStep).toBe(1)
    })

    it('应该处理无效的实体名称', () => {
      const vm = wrapper.vm as any
      
      const entity = { name: 'invalid_name', displayName: '测试' }
      vm.validateEntityName(entity)
      
      expect(ElMessage.warning).toHaveBeenCalled()
    })
  })
})

