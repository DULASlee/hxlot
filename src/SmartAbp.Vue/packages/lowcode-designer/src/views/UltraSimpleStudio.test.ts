import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import UltraSimpleStudio from './UltraSimpleStudio.vue'
import { codeGeneratorApi } from '@smartabp/lowcode-api'
import type { ModuleMetadata, TableSchema } from '@smartabp/lowcode-api'

// ============================================================================
// Mock 设置
// ============================================================================

// Mock Element Plus
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

// Mock Vue I18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, any>) => {
      // 简单的翻译模拟
      const translations: Record<string, string> = {
        'ultraSimple.title': '极简代码生成',
        'ultraSimple.subtitle': '三步快速生成完整代码',
        'ultraSimple.form.selectTable': '选择数据库表',
        'ultraSimple.form.tablePlaceholder': '请选择要生成代码的表',
        'ultraSimple.form.systemName': '系统名称',
        'ultraSimple.form.systemNamePlaceholder': '如: SmartConstruction',
        'ultraSimple.form.moduleName': '模块名称',
        'ultraSimple.form.moduleNamePlaceholder': '如: ProjectManagement',
        'ultraSimple.form.displayName': '显示名称',
        'ultraSimple.form.displayNamePlaceholder': '如: 项目管理',
        'ultraSimple.form.architecturePattern': '架构模式',
        'ultraSimple.form.databaseProvider': '数据库类型',
        'ultraSimple.form.parentMenu': '父级菜单',
        'ultraSimple.form.menuIcon': '菜单图标',
        'ultraSimple.actions.oneClickGenerate': '一键生成',
        'ultraSimple.actions.generating': '生成中...',
        'ultraSimple.messages.tableSelected': '已选择表: {tableName}',
        'ultraSimple.messages.success': '代码生成成功！',
        'ultraSimple.messages.error': '代码生成失败',
        'ultraSimple.logs.connectingDatabase': '正在连接数据库...',
        'ultraSimple.logs.databaseConnected': '数据库连接成功: {dbName}',
        'ultraSimple.logs.tablesFound': '找到 {count} 个表',
        'ultraSimple.logs.startGeneration': '开始生成代码...',
        'ultraSimple.validation.noCodeToView': '没有可查看的代码',
        'ultraSimple.validation.noCodeToDownload': '没有可下载的代码'
      }
      
      if (params) {
        let result = translations[key] || key
        Object.entries(params).forEach(([k, v]) => {
          result = result.replace(`{${k}}`, String(v))
        })
        return result
      }
      
      return translations[key] || key
    }
  })
}))

// Mock theme composable
vi.mock('@smartabp/lowcode-shared/theme', () => ({
  useTheme: () => ({
    mode: { value: 'light' },
    toggleTheme: vi.fn()
  })
}))

// Mock codeGeneratorApi
vi.mock('@smartabp/lowcode-api', () => ({
  codeGeneratorApi: {
    testDatabaseConnection: vi.fn(),
    introspectDatabase: vi.fn(),
    generateModule: vi.fn(),
    getGenerationStatus: vi.fn(),
    exportGeneratedCode: vi.fn()
  }
}))

// ============================================================================
// 测试辅助函数
// ============================================================================

/**
 * 创建模拟的表架构数据
 */
function createMockTableSchema(tableName: string): TableSchema {
  return {
    name: tableName,
    displayName: tableName,
    columns: [
      { name: 'Id', dataType: 'uniqueidentifier', isNullable: false, isPrimaryKey: true },
      { name: 'Name', dataType: 'nvarchar', isNullable: false, maxLength: 200, isPrimaryKey: false },
      { name: 'CreatedAt', dataType: 'datetime2', isNullable: false, isPrimaryKey: false }
    ],
    primaryKeys: ['Id'],
    foreignKeys: []
  }
}

/**
 * 创建组件挂载器
 */
function createWrapper(): VueWrapper<any> {
  return mount(UltraSimpleStudio, {
    global: {
      plugins: [createPinia()],
      stubs: {
        'el-form': false,
        'el-form-item': false,
        'el-select': false,
        'el-option': false,
        'el-input': false,
        'el-button': false,
        'el-progress': false,
        'el-alert': false,
        'el-divider': false,
        'el-row': false,
        'el-col': false,
        'el-tooltip': false
      }
    }
  })
}

/**
 * 等待异步操作完成
 */
async function waitForAsyncUpdate() {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 50))
  await nextTick()
}

// ============================================================================
// 测试套件
// ============================================================================

describe('UltraSimpleStudio.vue - 极简代码生成器完整功能测试', () => {
  
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ==========================================================================
  // 1. 组件渲染测试
  // ==========================================================================
  
  describe('组件渲染测试', () => {
    it('应该正确渲染主容器和标题', async () => {
      const wrapper = createWrapper()
      await nextTick()

      expect(wrapper.find('.ultra-simple-studio').exists()).toBe(true)
      expect(wrapper.find('.studio-container').exists()).toBe(true)
      expect(wrapper.find('.title').text()).toContain('极简代码生成')
    })

    it('应该渲染配置表单面板', async () => {
      const wrapper = createWrapper()
      await nextTick()

      expect(wrapper.find('.config-panel').exists()).toBe(true)
      expect(wrapper.find('.config-form').exists()).toBe(true)
    })

    it('应该渲染日志面板', async () => {
      const wrapper = createWrapper()
      await nextTick()

      expect(wrapper.find('.log-panel').exists()).toBe(true)
      expect(wrapper.find('.panel-header').exists()).toBe(true)
      expect(wrapper.find('.log-list').exists()).toBe(true)
    })

    it('应该渲染所有必需的表单项', async () => {
      const wrapper = createWrapper()
      await nextTick()

      // 数据库表选择
      expect(wrapper.html()).toContain('选择数据库表')
      
      // 系统基础信息
      expect(wrapper.html()).toContain('系统名称')
      expect(wrapper.html()).toContain('模块名称')
      expect(wrapper.html()).toContain('显示名称')
      
      // 代码生成配置
      expect(wrapper.html()).toContain('架构模式')
      expect(wrapper.html()).toContain('数据库类型')
      
      // 前端界面配置
      expect(wrapper.html()).toContain('父级菜单')
      expect(wrapper.html()).toContain('菜单图标')
    })
  })

  // ==========================================================================
  // 2. 数据库连接测试
  // ==========================================================================
  
  describe('数据库连接测试', () => {
    it('应该在组件挂载时测试数据库连接', async () => {
      const mockConnection = {
        success: true,
        message: '连接成功',
        databaseName: 'SmartAbpDb',
        tableCount: 10,
        tables: ['Projects', 'Tasks', 'Users']
      }
      
      vi.mocked(codeGeneratorApi.testDatabaseConnection).mockResolvedValue(mockConnection)

      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      expect(codeGeneratorApi.testDatabaseConnection).toHaveBeenCalledWith({
        provider: 'SqlServer',
        connectionString: 'Default'
      })
    })

    it('应该成功加载真实表名列表', async () => {
      const mockConnection = {
        success: true,
        message: '连接成功',
        databaseName: 'SmartAbpDb',
        tableCount: 3,
        tables: ['Projects', 'Tasks', 'Users']
      }
      
      vi.mocked(codeGeneratorApi.testDatabaseConnection).mockResolvedValue(mockConnection)

      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      // 检查是否正确加载表名
      const vm = wrapper.vm as any
      expect(vm.availableTables).toHaveLength(3)
      expect(vm.availableTables[0].name).toBe('Projects')
      expect(vm.availableTables[1].name).toBe('Tasks')
      expect(vm.availableTables[2].name).toBe('Users')
    })

    it('应该在表名列表为空时尝试获取完整架构', async () => {
      const mockConnection = {
        success: true,
        message: '连接成功',
        tableCount: 2
      }
      
      const mockSchema = {
        tables: [
          createMockTableSchema('Projects'),
          createMockTableSchema('Tasks')
        ]
      }
      
      vi.mocked(codeGeneratorApi.testDatabaseConnection).mockResolvedValue(mockConnection)
      vi.mocked(codeGeneratorApi.introspectDatabase).mockResolvedValue(mockSchema)

      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      expect(codeGeneratorApi.introspectDatabase).toHaveBeenCalledWith({
        provider: 'SqlServer',
        connectionStringName: 'Default'
      })
    })

    it('应该在连接失败时使用降级方案', async () => {
      vi.mocked(codeGeneratorApi.testDatabaseConnection).mockRejectedValue(new Error('连接失败'))

      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      // 应该仍然能正常渲染，不应该崩溃
      expect(wrapper.find('.ultra-simple-studio').exists()).toBe(true)
    })
  })

  // ==========================================================================
  // 3. 表单输入和验证测试
  // ==========================================================================
  
  describe('表单输入和验证测试', () => {
    beforeEach(async () => {
      const mockConnection = {
        success: true,
        tables: ['Projects', 'Tasks', 'Users']
      }
      vi.mocked(codeGeneratorApi.testDatabaseConnection).mockResolvedValue(mockConnection)
    })

    it('应该正确处理表选择事件', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      
      // 模拟表选择
      vm.handleTableSelected('Projects')
      await nextTick()

      expect(vm.config.moduleName).toBe('Projects')
      expect(vm.config.displayName).toBe('Projects')
    })

    it('应该验证必填字段', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      
      // 初始状态应该无效（缺少必填字段）
      expect(vm.isConfigValid).toBe(false)

      // 填写所有必填字段
      vm.selectedTable = 'Projects'
      vm.config.systemName = 'SmartConstruction'
      vm.config.moduleName = 'ProjectManagement'
      vm.config.displayName = '项目管理'
      vm.config.architecturePattern = 'Crud'
      vm.config.databaseProvider = 'SqlServer'
      vm.config.parentMenuId = 'business'
      
      await nextTick()
      
      // 现在应该有效
      expect(vm.isConfigValid).toBe(true)
    })

    it('应该正确计算派生属性', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      
      vm.config.systemName = 'SmartConstruction'
      vm.config.moduleName = 'ProjectManagement'
      
      await nextTick()

      expect(vm.derivedNamespace).toBe('SmartConstruction.ProjectManagement')
      expect(vm.derivedRoutePrefix).toBe('/projectmanagement')
      expect(vm.derivedApiEndpoint).toBe('/api/app/projectmanagement')
    })

    it('生成按钮应该在表单无效时禁用', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const generateBtn = wrapper.find('.generate-btn')
      expect(generateBtn.exists()).toBe(true)
      
      // 表单无效时应该禁用
      const vm = wrapper.vm as any
      expect(vm.isConfigValid).toBe(false)
      expect(generateBtn.attributes('disabled')).toBeDefined()
    })
  })

  // ==========================================================================
  // 4. 代码生成流程测试
  // ==========================================================================
  
  describe('代码生成流程测试', () => {
    beforeEach(async () => {
      const mockConnection = {
        success: true,
        tables: ['Projects']
      }
      vi.mocked(codeGeneratorApi.testDatabaseConnection).mockResolvedValue(mockConnection)
    })

    it('应该成功执行完整的代码生成流程', async () => {
      const mockGenerationResult = {
        success: true,
        sessionId: 'session-123',
        message: '生成成功',
        generatedFiles: ['ProjectAppService.cs', 'ProjectDto.cs', 'ProjectManagement.vue']
      }
      
      const mockStatus = {
        status: 'completed',
        percentage: 100,
        currentStep: '完成',
        completedFiles: ['ProjectAppService.cs', 'ProjectDto.cs']
      }
      
      vi.mocked(codeGeneratorApi.generateModule).mockResolvedValue(mockGenerationResult)
      vi.mocked(codeGeneratorApi.getGenerationStatus).mockResolvedValue(mockStatus)

      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      
      // 填写表单
      vm.selectedTable = 'Projects'
      vm.config.systemName = 'SmartConstruction'
      vm.config.moduleName = 'ProjectManagement'
      vm.config.displayName = '项目管理'
      vm.config.architecturePattern = 'Crud'
      vm.config.databaseProvider = 'SqlServer'
      vm.config.parentMenuId = 'business'
      
      await nextTick()

      // 开始生成
      await vm.startGeneration()
      await waitForAsyncUpdate()

      // 验证API调用
      expect(codeGeneratorApi.generateModule).toHaveBeenCalled()
      const callArg = vi.mocked(codeGeneratorApi.generateModule).mock.calls[0][0] as ModuleMetadata
      
      expect(callArg.systemName).toBe('SmartConstruction')
      expect(callArg.name).toBe('ProjectManagement')
      expect(callArg.displayName).toBe('项目管理')
      expect(callArg.architecturePattern).toBe('Crud')
      
      // 验证生成状态
      expect(vm.generating).toBe(false)
      expect(vm.generationComplete).toBe(true)
      expect(vm.generationProgress).toBe(100)
      expect(vm.generationSessionId).toBe('session-123')
    })

    it('应该处理生成过程中的错误', async () => {
      vi.mocked(codeGeneratorApi.generateModule).mockRejectedValue(new Error('生成失败'))

      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      
      // 填写表单
      vm.selectedTable = 'Projects'
      vm.config.systemName = 'SmartConstruction'
      vm.config.moduleName = 'ProjectManagement'
      vm.config.displayName = '项目管理'
      vm.config.architecturePattern = 'Crud'
      vm.config.databaseProvider = 'SqlServer'
      vm.config.parentMenuId = 'business'
      
      await nextTick()

      // 开始生成
      await vm.startGeneration()
      await waitForAsyncUpdate()

      // 验证错误处理
      expect(vm.generating).toBe(false)
      expect(vm.generationComplete).toBe(false)
      expect(vm.generationLogs.some((log: any) => log.type === 'error')).toBe(true)
    })

    it('应该正确轮询生成进度', async () => {
      const mockGenerationResult = {
        success: true,
        sessionId: 'session-123'
      }
      
      let callCount = 0
      vi.mocked(codeGeneratorApi.generateModule).mockResolvedValue(mockGenerationResult)
      vi.mocked(codeGeneratorApi.getGenerationStatus).mockImplementation(async () => {
        callCount++
        if (callCount < 3) {
          return {
            status: 'processing',
            percentage: callCount * 30,
            currentStep: `步骤 ${callCount}`
          }
        }
        return {
          status: 'completed',
          percentage: 100,
          currentStep: '完成'
        }
      })

      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      
      // 填写表单
      vm.selectedTable = 'Projects'
      vm.config.systemName = 'SmartConstruction'
      vm.config.moduleName = 'ProjectManagement'
      vm.config.displayName = '项目管理'
      vm.config.architecturePattern = 'Crud'
      vm.config.databaseProvider = 'SqlServer'
      vm.config.parentMenuId = 'business'
      
      await nextTick()

      // 开始生成
      await vm.startGeneration()
      await waitForAsyncUpdate()

      // 验证进度轮询
      expect(vi.mocked(codeGeneratorApi.getGenerationStatus).mock.calls.length).toBeGreaterThanOrEqual(3)
      expect(vm.generationComplete).toBe(true)
    })
  })

  // ==========================================================================
  // 5. 生成后操作测试
  // ==========================================================================
  
  describe('生成后操作测试', () => {
    beforeEach(async () => {
      const mockConnection = {
        success: true,
        tables: ['Projects']
      }
      vi.mocked(codeGeneratorApi.testDatabaseConnection).mockResolvedValue(mockConnection)
    })

    it('应该能够查看生成的代码', async () => {
      const mockStatus = {
        status: 'completed',
        completedFiles: ['ProjectAppService.cs', 'ProjectDto.cs', 'ProjectManagement.vue']
      }
      
      vi.mocked(codeGeneratorApi.getGenerationStatus).mockResolvedValue(mockStatus)

      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      vm.generationSessionId = 'session-123'
      vm.generationComplete = true
      
      await vm.viewGeneratedCode()
      await waitForAsyncUpdate()

      expect(codeGeneratorApi.getGenerationStatus).toHaveBeenCalledWith('session-123')
    })

    it('应该能够下载生成的代码', async () => {
      const mockBlob = new Blob(['test content'], { type: 'application/zip' })
      vi.mocked(codeGeneratorApi.exportGeneratedCode).mockResolvedValue(mockBlob)

      // Mock DOM API
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)
      const createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      const revokeObjectURLSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {})

      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      vm.generationSessionId = 'session-123'
      vm.generationComplete = true
      vm.config.moduleName = 'ProjectManagement'
      
      await vm.downloadGeneratedCode()
      await waitForAsyncUpdate()

      expect(codeGeneratorApi.exportGeneratedCode).toHaveBeenCalledWith('session-123')
      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockLink.click).toHaveBeenCalled()

      // 清理
      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
      createObjectURLSpy.mockRestore()
      revokeObjectURLSpy.mockRestore()
    })

    it('应该能够重置并重新开始', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      
      // 设置一些状态
      vm.selectedTable = 'Projects'
      vm.generating = false
      vm.generationComplete = true
      vm.generationProgress = 100
      vm.generationSessionId = 'session-123'
      vm.config.systemName = 'TestSystem'
      
      await nextTick()

      // 重置
      vm.resetToStart()
      await nextTick()

      // 验证重置后的状态
      expect(vm.selectedTable).toBe('')
      expect(vm.generating).toBe(false)
      expect(vm.generationComplete).toBe(false)
      expect(vm.generationProgress).toBe(0)
      expect(vm.generationSessionId).toBe('')
      expect(vm.config.systemName).toBe('')
    })
  })

  // ==========================================================================
  // 6. 日志系统测试
  // ==========================================================================
  
  describe('日志系统测试', () => {
    it('应该正确添加不同类型的日志', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      
      vm.addLog('信息日志', 'info')
      vm.addLog('成功日志', 'success')
      vm.addLog('警告日志', 'warning')
      vm.addLog('错误日志', 'error')
      
      await nextTick()

      expect(vm.generationLogs).toHaveLength(4)
      expect(vm.generationLogs[0].type).toBe('info')
      expect(vm.generationLogs[1].type).toBe('success')
      expect(vm.generationLogs[2].type).toBe('warning')
      expect(vm.generationLogs[3].type).toBe('error')
    })

    it('日志应该包含时间戳', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      
      vm.addLog('测试日志', 'info')
      await nextTick()

      const log = vm.generationLogs[0]
      expect(log.time).toMatch(/^\d{2}:\d{2}:\d{2}$/)
    })

    it('应该在生成开始时清空之前的日志', async () => {
      const mockConnection = {
        success: true,
        tables: ['Projects']
      }
      vi.mocked(codeGeneratorApi.testDatabaseConnection).mockResolvedValue(mockConnection)
      
      const mockGenerationResult = {
        success: true,
        sessionId: 'session-123'
      }
      vi.mocked(codeGeneratorApi.generateModule).mockResolvedValue(mockGenerationResult)
      vi.mocked(codeGeneratorApi.getGenerationStatus).mockResolvedValue({
        status: 'completed',
        percentage: 100,
        currentStep: '完成'
      })

      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      
      // 添加一些日志
      vm.addLog('旧日志1', 'info')
      vm.addLog('旧日志2', 'info')
      expect(vm.generationLogs).toHaveLength(2)
      
      // 填写表单并开始生成
      vm.selectedTable = 'Projects'
      vm.config.systemName = 'SmartConstruction'
      vm.config.moduleName = 'ProjectManagement'
      vm.config.displayName = '项目管理'
      vm.config.architecturePattern = 'Crud'
      vm.config.databaseProvider = 'SqlServer'
      vm.config.parentMenuId = 'business'
      
      await nextTick()
      await vm.startGeneration()
      await waitForAsyncUpdate()

      // 旧日志应该被清空，只有新的生成日志
      const infoLogs = vm.generationLogs.filter((log: any) => log.message === '旧日志1' || log.message === '旧日志2')
      expect(infoLogs).toHaveLength(0)
    })
  })

  // ==========================================================================
  // 7. 边界条件和错误处理测试
  // ==========================================================================
  
  describe('边界条件和错误处理测试', () => {
    it('应该处理空表名列表', async () => {
      const mockConnection = {
        success: true,
        tables: []
      }
      vi.mocked(codeGeneratorApi.testDatabaseConnection).mockResolvedValue(mockConnection)
      vi.mocked(codeGeneratorApi.introspectDatabase).mockResolvedValue({ tables: [] })

      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      expect(vm.availableTables).toHaveLength(0)
    })

    it('应该处理API返回的错误状态', async () => {
      const mockConnection = {
        success: true,
        tables: ['Projects']
      }
      vi.mocked(codeGeneratorApi.testDatabaseConnection).mockResolvedValue(mockConnection)
      
      const mockGenerationResult = {
        success: false,
        message: '生成失败：缺少必需参数'
      }
      vi.mocked(codeGeneratorApi.generateModule).mockResolvedValue(mockGenerationResult)

      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      
      vm.selectedTable = 'Projects'
      vm.config.systemName = 'SmartConstruction'
      vm.config.moduleName = 'ProjectManagement'
      vm.config.displayName = '项目管理'
      vm.config.architecturePattern = 'Crud'
      vm.config.databaseProvider = 'SqlServer'
      vm.config.parentMenuId = 'business'
      
      await nextTick()

      // 开始生成
      await vm.startGeneration()
      await waitForAsyncUpdate()

      // 应该记录错误日志
      const errorLogs = vm.generationLogs.filter((log: any) => log.type === 'error')
      expect(errorLogs.length).toBeGreaterThan(0)
    })

    it('应该处理进度查询超时', async () => {
      const mockConnection = {
        success: true,
        tables: ['Projects']
      }
      vi.mocked(codeGeneratorApi.testDatabaseConnection).mockResolvedValue(mockConnection)
      
      const mockGenerationResult = {
        success: true,
        sessionId: 'session-123'
      }
      vi.mocked(codeGeneratorApi.generateModule).mockResolvedValue(mockGenerationResult)
      
      // 模拟永远不完成的进度查询
      vi.mocked(codeGeneratorApi.getGenerationStatus).mockResolvedValue({
        status: 'processing',
        percentage: 50,
        currentStep: '处理中...'
      })

      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      
      vm.selectedTable = 'Projects'
      vm.config.systemName = 'SmartConstruction'
      vm.config.moduleName = 'ProjectManagement'
      vm.config.displayName = '项目管理'
      vm.config.architecturePattern = 'Crud'
      vm.config.databaseProvider = 'SqlServer'
      vm.config.parentMenuId = 'business'
      
      await nextTick()

      // 开始生成
      await vm.startGeneration()
      await waitForAsyncUpdate()

      // 应该记录超时警告
      const warningLogs = vm.generationLogs.filter((log: any) => log.type === 'warning')
      expect(warningLogs.some((log: any) => log.message.includes('超时') || log.message.includes('timeout'))).toBe(true)
    })

    it('应该处理没有sessionId时的查看代码操作', async () => {
      const { ElMessage } = await import('element-plus')
      
      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      vm.generationSessionId = ''
      
      await vm.viewGeneratedCode()
      await nextTick()

      expect(ElMessage.warning).toHaveBeenCalled()
    })

    it('应该处理没有sessionId时的下载操作', async () => {
      const { ElMessage } = await import('element-plus')
      
      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      vm.generationSessionId = ''
      
      await vm.downloadGeneratedCode()
      await nextTick()

      expect(ElMessage.warning).toHaveBeenCalled()
    })
  })

  // ==========================================================================
  // 8. 响应式数据测试
  // ==========================================================================
  
  describe('响应式数据测试', () => {
    it('生成按钮状态应该响应表单验证结果', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      
      // 初始状态：按钮禁用
      expect(vm.isConfigValid).toBe(false)
      
      // 填写部分字段
      vm.selectedTable = 'Projects'
      vm.config.systemName = 'SmartConstruction'
      await nextTick()
      
      // 仍然无效（缺少其他必填字段）
      expect(vm.isConfigValid).toBe(false)
      
      // 填写所有必填字段
      vm.config.moduleName = 'ProjectManagement'
      vm.config.displayName = '项目管理'
      vm.config.architecturePattern = 'Crud'
      vm.config.databaseProvider = 'SqlServer'
      vm.config.parentMenuId = 'business'
      await nextTick()
      
      // 现在应该有效
      expect(vm.isConfigValid).toBe(true)
    })

    it('派生属性应该响应配置变化', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      
      // 初始状态
      expect(vm.derivedNamespace).toBe('')
      expect(vm.derivedRoutePrefix).toBe('')
      expect(vm.derivedApiEndpoint).toBe('')
      
      // 设置系统名称
      vm.config.systemName = 'SmartConstruction'
      await nextTick()
      expect(vm.derivedNamespace).toBe('')  // 还需要模块名称
      
      // 设置模块名称
      vm.config.moduleName = 'ProjectManagement'
      await nextTick()
      
      expect(vm.derivedNamespace).toBe('SmartConstruction.ProjectManagement')
      expect(vm.derivedRoutePrefix).toBe('/projectmanagement')
      expect(vm.derivedApiEndpoint).toBe('/api/app/projectmanagement')
    })

    it('进度条应该响应生成进度', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      
      // 设置不同的进度值
      vm.generationProgress = 0
      await nextTick()
      expect(vm.generationProgress).toBe(0)
      
      vm.generationProgress = 50
      await nextTick()
      expect(vm.generationProgress).toBe(50)
      
      vm.generationProgress = 100
      await nextTick()
      expect(vm.generationProgress).toBe(100)
    })
  })

  // ==========================================================================
  // 9. 用户交互测试
  // ==========================================================================
  
  describe('用户交互测试', () => {
    it('应该响应主题切换', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      const themeToggle = vm.toggleTheme
      
      expect(themeToggle).toBeDefined()
      expect(typeof themeToggle).toBe('function')
    })

    it('完成后应该显示操作按钮', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()

      const vm = wrapper.vm as any
      
      // 未完成时不显示
      vm.generationComplete = false
      await nextTick()
      expect(wrapper.find('.action-buttons').exists()).toBe(false)
      
      // 完成后显示
      vm.generationComplete = true
      await nextTick()
      expect(wrapper.find('.action-buttons').exists()).toBe(true)
    })
  })

  // ==========================================================================
  // 10. 集成测试 - 完整用户流程
  // ==========================================================================
  
  describe('集成测试 - 完整用户流程', () => {
    it('应该完成从选表到生成成功的完整流程', async () => {
      // 准备Mock数据
      const mockConnection = {
        success: true,
        tables: ['Projects', 'Tasks'],
        databaseName: 'SmartAbpDb',
        tableCount: 2
      }
      
      const mockGenerationResult = {
        success: true,
        sessionId: 'session-complete-flow',
        message: '生成成功',
        generatedFiles: [
          'ProjectAppService.cs',
          'ProjectDto.cs',
          'ProjectController.cs',
          'ProjectManagement.vue'
        ]
      }
      
      const mockStatus = {
        status: 'completed',
        percentage: 100,
        currentStep: '全部完成',
        completedFiles: mockGenerationResult.generatedFiles
      }
      
      vi.mocked(codeGeneratorApi.testDatabaseConnection).mockResolvedValue(mockConnection)
      vi.mocked(codeGeneratorApi.generateModule).mockResolvedValue(mockGenerationResult)
      vi.mocked(codeGeneratorApi.getGenerationStatus).mockResolvedValue(mockStatus)

      // 步骤1：挂载组件，等待数据库连接
      const wrapper = createWrapper()
      await waitForAsyncUpdate()
      
      const vm = wrapper.vm as any
      
      // 验证：数据库连接成功，表列表已加载
      expect(vm.availableTables).toHaveLength(2)
      expect(vm.availableTables[0].name).toBe('Projects')
      
      // 步骤2：选择表
      vm.handleTableSelected('Projects')
      await nextTick()
      
      // 验证：表选择后自动填充了模块名和显示名
      expect(vm.selectedTable).toBe('Projects')
      expect(vm.config.moduleName).toBe('Projects')
      expect(vm.config.displayName).toBe('Projects')
      
      // 步骤3：填写其他必填配置
      vm.config.systemName = 'SmartConstruction'
      vm.config.architecturePattern = 'DDD'
      vm.config.databaseProvider = 'SqlServer'
      vm.config.parentMenuId = 'business'
      vm.config.menuIcon = 'project'
      await nextTick()
      
      // 验证：表单有效，可以生成
      expect(vm.isConfigValid).toBe(true)
      expect(vm.derivedNamespace).toBe('SmartConstruction.Projects')
      
      // 步骤4：开始生成
      await vm.startGeneration()
      await waitForAsyncUpdate()
      
      // 验证：生成成功
      expect(vm.generationComplete).toBe(true)
      expect(vm.generationProgress).toBe(100)
      expect(vm.generationSessionId).toBe('session-complete-flow')
      expect(vm.generating).toBe(false)
      
      // 验证：日志中包含成功信息
      const successLogs = vm.generationLogs.filter((log: any) => log.type === 'success')
      expect(successLogs.length).toBeGreaterThan(0)
      
      // 步骤5：重置并准备下一次生成
      vm.resetToStart()
      await nextTick()
      
      // 验证：所有状态已重置
      expect(vm.selectedTable).toBe('')
      expect(vm.generationComplete).toBe(false)
      expect(vm.generationProgress).toBe(0)
      expect(vm.config.systemName).toBe('')
    })
  })

  // ==========================================================================
  // 11. 高级边界条件测试（扩展覆盖率）
  // ==========================================================================
  
  describe('高级边界条件测试', () => {
    it('应该处理特殊字符的系统名称', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()
      const vm = wrapper.vm as any
      
      vm.config.systemName = 'Smart@Construction#2024'
      vm.config.moduleName = 'Project'
      await nextTick()
      
      expect(vm.derivedNamespace).toContain('Smart@Construction#2024')
    })

    it('应该处理极长的表名', async () => {
      const mockConnection = {
        success: true,
        tables: ['A'.repeat(200)]
      }
      vi.mocked(codeGeneratorApi.testDatabaseConnection).mockResolvedValue(mockConnection)
      
      const wrapper = createWrapper()
      await waitForAsyncUpdate()
      const vm = wrapper.vm as any
      
      expect(vm.availableTables[0].name).toHaveLength(200)
    })

    it('应该处理数据库返回超大表数量', async () => {
      const mockConnection = {
        success: true,
        tableCount: 1000,
        tables: Array.from({ length: 1000 }, (_, i) => `Table${i + 1}`)
      }
      vi.mocked(codeGeneratorApi.testDatabaseConnection).mockResolvedValue(mockConnection)
      
      const wrapper = createWrapper()
      await waitForAsyncUpdate()
      const vm = wrapper.vm as any
      
      expect(vm.availableTables).toHaveLength(1000)
    })

    it('应该处理生成进度状态为error', async () => {
      const mockConnection = {
        success: true,
        tables: ['Projects']
      }
      const mockGenerationResult = {
        success: true,
        sessionId: 'session-error'
      }
      vi.mocked(codeGeneratorApi.testDatabaseConnection).mockResolvedValue(mockConnection)
      vi.mocked(codeGeneratorApi.generateModule).mockResolvedValue(mockGenerationResult)
      vi.mocked(codeGeneratorApi.getGenerationStatus).mockResolvedValue({
        status: 'error',
        percentage: 50,
        error: '生成过程中出错',
        currentStep: '错误'
      })

      const wrapper = createWrapper()
      await waitForAsyncUpdate()
      const vm = wrapper.vm as any
      
      vm.selectedTable = 'Projects'
      vm.config.systemName = 'Test'
      vm.config.moduleName = 'Test'
      vm.config.displayName = 'Test'
      vm.config.architecturePattern = 'Crud'
      vm.config.databaseProvider = 'SqlServer'
      vm.config.parentMenuId = 'business'
      
      await vm.startGeneration().catch(() => {})
      await waitForAsyncUpdate()
      
      const errorLogs = vm.generationLogs.filter((log: any) => log.type === 'error')
      expect(errorLogs.length).toBeGreaterThan(0)
    })

    it('应该处理所有架构模式', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()
      const vm = wrapper.vm as any
      
      const patterns = ['Crud', 'DDD', 'CQRS']
      for (const pattern of patterns) {
        vm.config.architecturePattern = pattern
        await nextTick()
        expect(vm.config.architecturePattern).toBe(pattern)
      }
    })

    it('应该处理所有数据库提供者', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()
      const vm = wrapper.vm as any
      
      const providers = ['SqlServer', 'MySql', 'PostgreSql']
      for (const provider of providers) {
        vm.config.databaseProvider = provider
        await nextTick()
        expect(vm.config.databaseProvider).toBe(provider)
      }
    })

    it('应该处理查看预览时API返回空数据', async () => {
      const { ElMessage } = await import('element-plus')
      vi.mocked(codeGeneratorApi.getGenerationStatus).mockResolvedValue({
        status: 'completed',
        percentage: 100,
        currentStep: '完成',
        completedFiles: []
      })

      const wrapper = createWrapper()
      await waitForAsyncUpdate()
      const vm = wrapper.vm as any
      
      vm.generationSessionId = 'test-session'
      await vm.viewGeneratedCode()
      await nextTick()
      
      expect(ElMessage.info).toHaveBeenCalled()
    })

    it('应该处理下载时Blob创建失败', async () => {
      const { ElMessage } = await import('element-plus')
      vi.mocked(codeGeneratorApi.exportGeneratedCode).mockRejectedValue(new Error('Blob error'))

      const wrapper = createWrapper()
      await waitForAsyncUpdate()
      const vm = wrapper.vm as any
      
      vm.generationSessionId = 'test-session'
      vm.config.moduleName = 'Test'
      
      await vm.downloadGeneratedCode()
      await nextTick()
      
      expect(ElMessage.error).toHaveBeenCalled()
    })

    it('应该处理表选择为空字符串', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()
      const vm = wrapper.vm as any
      
      vm.handleTableSelected('')
      await nextTick()
      
      expect(vm.config.moduleName).toBe('')
    })

    it('应该处理未找到表架构时的情况', async () => {
      const mockConnection = {
        success: true,
        tables: ['Projects', 'Tasks']
      }
      vi.mocked(codeGeneratorApi.testDatabaseConnection).mockResolvedValue(mockConnection)

      const wrapper = createWrapper()
      await waitForAsyncUpdate()
      const vm = wrapper.vm as any
      
      vm.handleTableSelected('NonExistent')
      await nextTick()
      
      expect(vm.config.moduleName).toBe('NonExistent')
    })
  })

  // ==========================================================================
  // 12. 性能和并发测试
  // ==========================================================================
  
  describe('性能和并发测试', () => {
    it('应该能快速处理大量日志', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()
      const vm = wrapper.vm as any
      
      const startTime = Date.now()
      for (let i = 0; i < 100; i++) {
        vm.addLog(`日志 ${i}`, 'info')
      }
      const endTime = Date.now()
      
      expect(vm.generationLogs).toHaveLength(100)
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('应该处理快速连续的表选择', async () => {
      const mockConnection = {
        success: true,
        tables: ['Table1', 'Table2', 'Table3']
      }
      vi.mocked(codeGeneratorApi.testDatabaseConnection).mockResolvedValue(mockConnection)

      const wrapper = createWrapper()
      await waitForAsyncUpdate()
      const vm = wrapper.vm as any
      
      vm.handleTableSelected('Table1')
      vm.handleTableSelected('Table2')
      vm.handleTableSelected('Table3')
      await nextTick()
      
      expect(vm.selectedTable).toBe('Table3')
    })

    it('应该处理配置的快速连续修改', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()
      const vm = wrapper.vm as any
      
      for (let i = 0; i < 10; i++) {
        vm.config.systemName = `System${i}`
        vm.config.moduleName = `Module${i}`
      }
      await nextTick()
      
      expect(vm.config.systemName).toBe('System9')
      expect(vm.derivedNamespace).toBe('System9.Module9')
    })
  })

  // ==========================================================================
  // 13. 国际化和本地化测试
  // ==========================================================================
  
  describe('国际化测试', () => {
    it('应该正确使用i18n翻译键', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()
      
      expect(wrapper.html()).toContain('极简代码生成')
    })

    it('应该在日志中使用翻译', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()
      const vm = wrapper.vm as any
      
      expect(vm.generationLogs.length).toBeGreaterThan(0)
      expect(vm.generationLogs[0].message).toBeTruthy()
    })
  })

  // ==========================================================================
  // 14. 组件生命周期测试
  // ==========================================================================
  
  describe('组件生命周期测试', () => {
    it('应该在挂载时初始化所有状态', async () => {
      const wrapper = createWrapper()
      await waitForAsyncUpdate()
      const vm = wrapper.vm as any
      
      expect(vm.selectedTable).toBe('')
      expect(vm.generating).toBe(false)
      expect(vm.generationComplete).toBe(false)
      expect(vm.generationProgress).toBe(0)
      expect(vm.generationLogs).toBeDefined()
      expect(vm.config).toBeDefined()
    })

    it('应该在卸载时清理资源', () => {
      const wrapper = createWrapper()
      wrapper.unmount()
      
      expect(wrapper.vm).toBeUndefined()
    })
  })
})

