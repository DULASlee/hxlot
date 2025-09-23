/**
 * SmartAbp LowCode Studio 端到端测试套件
 * 
 * 验证核心业务流程:
 * 1. 数据建模 (Entity Modeling)
 * 2. 页面设计 (Page Design) 
 * 3. 代码生成 (Code Generation)
 * 
 * @version 1.0.0
 * @author SmartAbp Team
 */

describe('LowCode Studio - 端到端业务流程测试', () => {
  beforeEach(() => {
    cy.visit('/studio')
    cy.viewport(1920, 1080)
    
    // 等待页面完全加载
    cy.get('[data-testid="lowcode-studio-header"]').should('be.visible')
    cy.get('[data-testid="lowcode-studio-nav"]').should('be.visible')
    cy.get('[data-testid="lowcode-studio-workspace"]').should('be.visible')
  })

  describe('🏗️ 数据建模流程测试', () => {
    it('应该能够创建新的实体模型', () => {
      // 进入数据建模步骤
      cy.get('[data-testid="nav-modeling"]').click()
      cy.url().should('include', '/studio/modeling')
      
      // 验证数据建模界面加载
      cy.get('[data-testid="entity-modeling-view"]').should('be.visible')
      cy.get('[data-testid="entity-list"]').should('be.visible')
      cy.get('[data-testid="design-area"]').should('be.visible')
      
      // 创建新实体
      cy.get('[data-testid="btn-create-entity"]').click()
      cy.get('[data-testid="entity-form-dialog"]').should('be.visible')
      
      // 填写实体信息
      cy.get('[data-testid="input-entity-name"]').type('Product')
      cy.get('[data-testid="input-entity-display-name"]').type('产品')
      cy.get('[data-testid="input-entity-description"]').type('产品管理实体')
      
      // 保存实体
      cy.get('[data-testid="btn-save-entity"]').click()
      cy.get('[data-testid="entity-form-dialog"]').should('not.exist')
      
      // 验证实体已创建
      cy.get('[data-testid="entity-list"]')
        .should('contain', 'Product')
        .should('contain', '产品')
    })

    it('应该能够为实体添加字段', () => {
      // 假设已有Product实体，选中它
      cy.get('[data-testid="entity-item-Product"]').click()
      
      // 添加名称字段
      cy.get('[data-testid="btn-add-field"]').click()
      cy.get('[data-testid="field-form-dialog"]').should('be.visible')
      
      cy.get('[data-testid="input-field-name"]').type('Name')
      cy.get('[data-testid="input-field-display-name"]').type('产品名称')
      cy.get('[data-testid="select-field-type"]').click()
      cy.get('[data-testid="option-string"]').click()
      cy.get('[data-testid="input-field-max-length"]').type('100')
      cy.get('[data-testid="checkbox-field-required"]').check()
      
      cy.get('[data-testid="btn-save-field"]').click()
      
      // 添加价格字段
      cy.get('[data-testid="btn-add-field"]').click()
      cy.get('[data-testid="input-field-name"]').type('Price')
      cy.get('[data-testid="input-field-display-name"]').type('价格')
      cy.get('[data-testid="select-field-type"]').click()
      cy.get('[data-testid="option-decimal"]').click()
      cy.get('[data-testid="checkbox-field-required"]').check()
      
      cy.get('[data-testid="btn-save-field"]').click()
      
      // 验证字段已添加
      cy.get('[data-testid="field-list"]')
        .should('contain', 'Name')
        .should('contain', 'Price')
        .should('contain', '产品名称')
        .should('contain', '价格')
    })

    it('应该能够设置实体关系', () => {
      // 创建Category实体用于关联
      cy.get('[data-testid="btn-create-entity"]').click()
      cy.get('[data-testid="input-entity-name"]').type('Category')
      cy.get('[data-testid="input-entity-display-name"]').type('分类')
      cy.get('[data-testid="btn-save-entity"]').click()
      
      // 选中Product实体
      cy.get('[data-testid="entity-item-Product"]').click()
      
      // 添加关系
      cy.get('[data-testid="btn-add-relation"]').click()
      cy.get('[data-testid="relation-form-dialog"]').should('be.visible')
      
      cy.get('[data-testid="input-relation-name"]').type('Category')
      cy.get('[data-testid="select-relation-target"]').click()
      cy.get('[data-testid="option-entity-Category"]').click()
      cy.get('[data-testid="select-relation-type"]').click()
      cy.get('[data-testid="option-many-to-one"]').click()
      
      cy.get('[data-testid="btn-save-relation"]').click()
      
      // 验证关系已创建
      cy.get('[data-testid="relation-list"]')
        .should('contain', 'Category')
        .should('contain', 'many-to-one')
    })

    it('应该显示实体完成状态', () => {
      // 验证Product实体的完成状态
      cy.get('[data-testid="entity-item-Product"]').within(() => {
        cy.get('[data-testid="entity-completeness"]').should('contain', '90%')
        cy.get('[data-testid="entity-status-icon"]').should('have.class', 'success')
      })
      
      // 验证架构概览
      cy.get('[data-testid="architecture-overview"]').should('be.visible')
      cy.get('[data-testid="overview-entities"]').should('contain', '2')
      cy.get('[data-testid="overview-fields"]').should('contain', '2')
      cy.get('[data-testid="overview-relations"]').should('contain', '1')
    })
  })

  describe('🎨 页面设计流程测试', () => {
    it('应该能够进入页面设计步骤', () => {
      // 进入页面设计
      cy.get('[data-testid="nav-design"]').click()
      cy.url().should('include', '/studio/design')
      
      // 验证页面设计界面加载
      cy.get('[data-testid="design-view"]').should('be.visible')
      cy.get('[data-testid="component-palette"]').should('be.visible')
      cy.get('[data-testid="design-canvas"]').should('be.visible')
      cy.get('[data-testid="property-panel"]').should('be.visible')
    })

    it('应该能够基于实体批量生成页面', () => {
      cy.get('[data-testid="nav-design"]').click()
      
      // 点击批量生成按钮
      cy.get('[data-testid="btn-batch-generate"]').click()
      cy.get('[data-testid="batch-generate-dialog"]').should('be.visible')
      
      // 选择Product实体
      cy.get('[data-testid="checkbox-entity-Product"]').check()
      
      // 选择页面类型
      cy.get('[data-testid="checkbox-page-list"]').check()
      cy.get('[data-testid="checkbox-page-form"]').check()
      cy.get('[data-testid="checkbox-page-detail"]').check()
      
      // 执行批量生成
      cy.get('[data-testid="btn-execute-generate"]').click()
      
      // 验证生成结果
      cy.get('[data-testid="generate-progress"]').should('be.visible')
      cy.get('[data-testid="generate-success"]', { timeout: 10000 }).should('be.visible')
      
      // 验证生成的页面
      cy.get('[data-testid="page-list"]')
        .should('contain', 'ProductList')
        .should('contain', 'ProductForm')
        .should('contain', 'ProductDetail')
    })

    it('应该能够可视化设计页面', () => {
      // 选择ProductList页面进行编辑
      cy.get('[data-testid="page-item-ProductList"]').click()
      
      // 验证设计画布显示页面结构
      cy.get('[data-testid="design-canvas"]').within(() => {
        cy.get('[data-testid="component-search-bar"]').should('be.visible')
        cy.get('[data-testid="component-data-table"]').should('be.visible')
        cy.get('[data-testid="component-pagination"]').should('be.visible')
      })
      
      // 从组件面板拖拽新组件
      cy.get('[data-testid="palette-button"]')
        .trigger('dragstart')
        .then(() => {
          cy.get('[data-testid="design-canvas"]')
            .trigger('dragover')
            .trigger('drop')
        })
      
      // 验证组件已添加
      cy.get('[data-testid="design-canvas"]')
        .should('contain', '[data-testid="component-button"]')
      
      // 配置组件属性
      cy.get('[data-testid="component-button"]').click()
      cy.get('[data-testid="property-panel"]').within(() => {
        cy.get('[data-testid="input-button-text"]').clear().type('新建产品')
        cy.get('[data-testid="select-button-type"]').select('primary')
      })
    })

    it('应该能够预览设计的页面', () => {
      // 点击预览按钮
      cy.get('[data-testid="btn-preview-page"]').click()
      
      // 验证预览对话框打开
      cy.get('[data-testid="preview-dialog"]').should('be.visible')
      cy.get('[data-testid="preview-iframe"]').should('be.visible')
      
      // 验证预览内容
      cy.get('[data-testid="preview-iframe"]').then(($iframe) => {
        const iframe = $iframe.contents()
        cy.wrap(iframe.find('[data-testid="product-list-table"]')).should('be.visible')
        cy.wrap(iframe.find('[data-testid="search-input"]')).should('be.visible')
      })
      
      // 关闭预览
      cy.get('[data-testid="btn-close-preview"]').click()
      cy.get('[data-testid="preview-dialog"]').should('not.exist')
    })
  })

  describe('⚙️ 代码生成流程测试', () => {
    it('应该能够进入代码生成步骤', () => {
      // 进入代码生成
      cy.get('[data-testid="nav-generation"]').click()
      cy.url().should('include', '/studio/generation')
      
      // 验证代码生成界面加载
      cy.get('[data-testid="enhanced-generation-view"]').should('be.visible')
      cy.get('[data-testid="entity-selection"]').should('be.visible')
      cy.get('[data-testid="generation-config"]').should('be.visible')
      cy.get('[data-testid="template-selection"]').should('be.visible')
    })

    it('应该能够选择实体和生成配置', () => {
      cy.get('[data-testid="nav-generation"]').click()
      
      // 选择要生成的实体
      cy.get('[data-testid="entity-tree"]').within(() => {
        cy.get('[data-testid="checkbox-entity-Product"]').check()
        cy.get('[data-testid="checkbox-entity-Category"]').check()
      })
      
      // 配置生成参数
      cy.get('[data-testid="input-project-name"]').clear().type('ProductManagement')
      cy.get('[data-testid="input-namespace"]').clear().type('SmartAbp.ProductManagement')
      cy.get('[data-testid="select-output-path"]').select('src/generated')
      
      // 选择生成模板
      cy.get('[data-testid="template-list"]').within(() => {
        cy.get('[data-testid="template-vue-crud"]').check()
        cy.get('[data-testid="template-abp-service"]').check()
        cy.get('[data-testid="template-entity-dto"]').check()
      })
    })

    it('应该能够执行全栈代码生成', () => {
      // 点击生成按钮
      cy.get('[data-testid="btn-generate-code"]').click()
      
      // 验证生成进度
      cy.get('[data-testid="generation-progress"]').should('be.visible')
      cy.get('[data-testid="progress-bar"]').should('be.visible')
      
      // 等待生成完成
      cy.get('[data-testid="generation-success"]', { timeout: 30000 }).should('be.visible')
      
      // 验证生成统计
      cy.get('[data-testid="generation-stats"]').within(() => {
        cy.get('[data-testid="stat-files"]').should('contain', '12')
        cy.get('[data-testid="stat-lines"]').should('contain', '2,450')
        cy.get('[data-testid="stat-time"]').should('contain', 'seconds')
      })
    })

    it('应该能够预览生成的代码', () => {
      // 切换到文件树模式
      cy.get('[data-testid="view-mode-tree"]').click()
      
      // 展开后端文件夹
      cy.get('[data-testid="folder-backend"]').click()
      cy.get('[data-testid="folder-application"]').click()
      
      // 点击查看ProductAppService.cs
      cy.get('[data-testid="file-ProductAppService.cs"]').click()
      
      // 验证代码内容
      cy.get('[data-testid="code-viewer"]').within(() => {
        cy.get('.code-content').should('contain', 'public class ProductAppService')
        cy.get('.code-content').should('contain', 'IProductAppService')
        cy.get('.code-content').should('contain', 'GetListAsync')
        cy.get('.code-content').should('contain', 'CreateAsync')
      })
      
      // 切换到前端文件
      cy.get('[data-testid="folder-frontend"]').click()
      cy.get('[data-testid="file-ProductManagement.vue"]').click()
      
      // 验证Vue组件代码
      cy.get('[data-testid="code-viewer"]').within(() => {
        cy.get('.code-content').should('contain', '<template>')
        cy.get('.code-content').should('contain', 'ProductManagement')
        cy.get('.code-content').should('contain', 'el-table')
        cy.get('.code-content').should('contain', 'setup()')
      })
    })

    it('应该能够下载生成的代码', () => {
      // 点击下载按钮
      cy.get('[data-testid="btn-download-code"]').click()
      
      // 验证下载选项
      cy.get('[data-testid="download-options"]').should('be.visible')
      
      // 选择下载格式
      cy.get('[data-testid="radio-download-zip"]').check()
      cy.get('[data-testid="checkbox-include-backend"]').check()
      cy.get('[data-testid="checkbox-include-frontend"]').check()
      cy.get('[data-testid="checkbox-include-tests"]').check()
      
      // 执行下载
      cy.get('[data-testid="btn-confirm-download"]').click()
      
      // 验证下载成功
      cy.get('[data-testid="download-success"]').should('be.visible')
      cy.get('[data-testid="download-link"]').should('be.visible')
    })
  })

  describe('🔄 完整工作流程集成测试', () => {
    it('应该能够完成从建模到代码生成的完整流程', () => {
      // 1. 数据建模阶段
      cy.get('[data-testid="nav-modeling"]').click()
      
      // 创建Order实体
      cy.get('[data-testid="btn-create-entity"]').click()
      cy.get('[data-testid="input-entity-name"]').type('Order')
      cy.get('[data-testid="input-entity-display-name"]').type('订单')
      cy.get('[data-testid="btn-save-entity"]').click()
      
      // 添加订单字段
      cy.get('[data-testid="entity-item-Order"]').click()
      cy.get('[data-testid="btn-add-field"]').click()
      cy.get('[data-testid="input-field-name"]').type('OrderNumber')
      cy.get('[data-testid="input-field-display-name"]').type('订单号')
      cy.get('[data-testid="select-field-type"]').select('string')
      cy.get('[data-testid="checkbox-field-required"]').check()
      cy.get('[data-testid="btn-save-field"]').click()
      
      // 2. 页面设计阶段
      cy.get('[data-testid="nav-design"]').click()
      
      // 批量生成订单管理页面
      cy.get('[data-testid="btn-batch-generate"]').click()
      cy.get('[data-testid="checkbox-entity-Order"]').check()
      cy.get('[data-testid="checkbox-page-list"]').check()
      cy.get('[data-testid="checkbox-page-form"]').check()
      cy.get('[data-testid="btn-execute-generate"]').click()
      
      cy.get('[data-testid="generate-success"]', { timeout: 10000 }).should('be.visible')
      
      // 3. 代码生成阶段
      cy.get('[data-testid="nav-generation"]').click()
      
      // 选择Order实体生成代码
      cy.get('[data-testid="checkbox-entity-Order"]').check()
      cy.get('[data-testid="template-vue-crud"]').check()
      cy.get('[data-testid="template-abp-service"]').check()
      
      cy.get('[data-testid="btn-generate-code"]').click()
      cy.get('[data-testid="generation-success"]', { timeout: 30000 }).should('be.visible')
      
      // 验证完整流程成功
      cy.get('[data-testid="workflow-success"]').should('be.visible')
      cy.get('[data-testid="success-message"]').should('contain', '已成功生成完整的订单管理模块')
    })
  })

  describe('🚨 错误处理和边界情况测试', () => {
    it('应该处理无效的实体名称', () => {
      cy.get('[data-testid="nav-modeling"]').click()
      cy.get('[data-testid="btn-create-entity"]').click()
      
      // 输入无效名称
      cy.get('[data-testid="input-entity-name"]').type('123InvalidName')
      cy.get('[data-testid="btn-save-entity"]').click()
      
      // 验证错误提示
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .should('contain', '实体名称必须以字母开头')
    })

    it('应该处理代码生成失败', () => {
      cy.get('[data-testid="nav-generation"]').click()
      
      // 不选择任何实体直接生成
      cy.get('[data-testid="btn-generate-code"]').click()
      
      // 验证错误提示
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .should('contain', '请至少选择一个实体')
    })

    it('应该处理网络错误', () => {
      // 模拟网络断开
      cy.intercept('POST', '/api/codegen/**', { forceNetworkError: true }).as('networkError')
      
      cy.get('[data-testid="nav-generation"]').click()
      cy.get('[data-testid="checkbox-entity-Product"]').check()
      cy.get('[data-testid="btn-generate-code"]').click()
      
      // 验证网络错误处理
      cy.get('[data-testid="error-network"]')
        .should('be.visible')
        .should('contain', '网络连接失败')
    })
  })

  describe('🔧 性能基准测试', () => {
    it('页面加载性能应该满足要求', () => {
      // 测试首屏加载时间
      cy.window().its('performance').then((perf) => {
        const navigationStart = perf.timing.navigationStart
        const loadComplete = perf.timing.loadEventEnd
        const loadTime = loadComplete - navigationStart
        
        // 首屏加载应该小于3秒
        expect(loadTime).to.be.lessThan(3000)
      })
    })

    it('代码生成性能应该满足要求', () => {
      cy.get('[data-testid="nav-generation"]').click()
      cy.get('[data-testid="checkbox-entity-Product"]').check()
      cy.get('[data-testid="template-vue-crud"]').check()
      
      const startTime = Date.now()
      cy.get('[data-testid="btn-generate-code"]').click()
      
      cy.get('[data-testid="generation-success"]', { timeout: 10000 }).should('be.visible').then(() => {
        const endTime = Date.now()
        const generationTime = endTime - startTime
        
        // 单个组件生成应该小于10秒
        expect(generationTime).to.be.lessThan(10000)
      })
    })

    it('大数据量处理性能测试', () => {
      // 创建包含多个字段的复杂实体
      cy.get('[data-testid="nav-modeling"]').click()
      cy.get('[data-testid="btn-create-entity"]').click()
      cy.get('[data-testid="input-entity-name"]').type('ComplexEntity')
      cy.get('[data-testid="btn-save-entity"]').click()
      
      // 添加20个字段
      cy.get('[data-testid="entity-item-ComplexEntity"]').click()
      for (let i = 1; i <= 20; i++) {
        cy.get('[data-testid="btn-add-field"]').click()
        cy.get('[data-testid="input-field-name"]').type(`Field${i}`)
        cy.get('[data-testid="input-field-display-name"]').type(`字段${i}`)
        cy.get('[data-testid="select-field-type"]').select('string')
        cy.get('[data-testid="btn-save-field"]').click()
      }
      
      // 测试复杂实体的代码生成性能
      cy.get('[data-testid="nav-generation"]').click()
      cy.get('[data-testid="checkbox-entity-ComplexEntity"]').check()
      cy.get('[data-testid="template-vue-crud"]').check()
      
      const startTime = Date.now()
      cy.get('[data-testid="btn-generate-code"]').click()
      
      cy.get('[data-testid="generation-success"]', { timeout: 30000 }).should('be.visible').then(() => {
        const endTime = Date.now()
        const generationTime = endTime - startTime
        
        // 复杂实体生成应该小于30秒
        expect(generationTime).to.be.lessThan(30000)
      })
    })
  })
})
