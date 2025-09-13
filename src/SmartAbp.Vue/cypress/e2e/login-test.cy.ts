describe('SmartAbp 登录功能测试', () => {
  beforeEach(() => {
    // 访问登录测试页面
    cy.visit('/test/login')
  })

  it('应该正确加载登录测试页面', () => {
    cy.contains('SmartAbp 登录功能测试').should('be.visible')
    cy.contains('API 连接测试').should('be.visible')
    cy.contains('用户登录测试').should('be.visible')
    cy.contains('认证状态').should('be.visible')
    cy.contains('测试日志').should('be.visible')
  })

  it('应该能够测试 API 连接', () => {
    // 点击 API 连接测试按钮
    cy.contains('测试 API 连接').click()

    // 等待测试完成并检查结果
    cy.get('.test-result', { timeout: 10000 }).should('be.visible')

    // 检查连接状态标签
    cy.get('.card-header').within(() => {
      cy.get('.el-tag').should('contain.text', '连接')
    })
  })

  it('应该能够填充和清空登录表单', () => {
    // 测试填充管理员数据
    cy.contains('填入管理员测试数据').click()
    cy.get('input[placeholder="请输入用户名"]').should('have.value', 'admin')
    cy.get('input[placeholder="请输入密码"]').should('have.value', '1q2w3E*')

    // 清空表单
    cy.get('input[placeholder="请输入用户名"]').clear()
    cy.get('input[placeholder="请输入密码"]').clear()

    // 测试填充普通用户数据
    cy.contains('填入普通用户测试数据').click()
    cy.get('input[placeholder="请输入用户名"]').should('have.value', 'testuser')
    cy.get('input[placeholder="请输入密码"]').should('have.value', 'Test123!')

    // 测试填充无效数据
    cy.contains('填入无效测试数据').click()
    cy.get('input[placeholder="请输入用户名"]').should('have.value', 'invalid')
    cy.get('input[placeholder="请输入密码"]').should('have.value', 'wrongpass')
  })

  it('应该显示表单验证错误', () => {
    // 尝试提交空表单
    cy.contains('登录测试').click()

    // 应该显示验证错误（Element Plus 的验证）
    cy.get('.el-form-item__error').should('exist')
  })

  it('应该能够处理登录失败', () => {
    // 填入无效凭据
    cy.contains('填入无效测试数据').click()

    // 提交登录表单
    cy.contains('登录测试').click()

    // 等待登录完成并检查错误消息
    cy.get('.logs-container', { timeout: 10000 }).within(() => {
      cy.contains('登录失败').should('be.visible')
    })

    // 认证状态应该仍然是未认证
    cy.get('.el-descriptions').within(() => {
      cy.contains('未认证').should('be.visible')
    })
  })

  it('应该能够处理成功登录（模拟）', () => {
    // 注意：这个测试假设后端 API 可用且有有效的测试账户
    // 在实际环境中，您可能需要 mock API 响应

    // 填入管理员测试数据
    cy.contains('填入管理员测试数据').click()

    // 提交登录表单
    cy.contains('登录测试').click()

    // 等待登录处理完成
    cy.get('.logs-container', { timeout: 15000 }).within(() => {
      // 检查是否有登录相关的日志
      cy.contains('开始登录测试').should('be.visible')
    })
  })

  it('应该能够显示和管理测试日志', () => {
    // 执行一些操作来生成日志
    cy.contains('测试 API 连接').click()
    cy.wait(2000)

    // 检查日志是否显示
    cy.get('.logs-container').within(() => {
      cy.contains('开始测试 API 连接').should('be.visible')
    })

    // 清空日志
    cy.contains('清空日志').click()

    // 检查日志是否被清空
    cy.get('.logs-container').within(() => {
      cy.contains('日志已清空').should('be.visible')
    })
  })

  it('应该正确显示认证状态信息', () => {
    // 检查初始认证状态
    cy.get('.el-descriptions').within(() => {
      cy.contains('未认证').should('be.visible')
      cy.contains('无').should('be.visible') // Token 应该显示为 "无"
    })
  })

  it('应该具有响应式设计', () => {
    // 测试桌面视图
    cy.viewport(1280, 720)
    cy.get('.login-card').should('be.visible')

    // 测试平板视图
    cy.viewport(768, 1024)
    cy.get('.login-card').should('be.visible')

    // 测试移动设备视图
    cy.viewport(375, 667)
    cy.get('.login-card').should('be.visible')

    // 检查按钮在移动设备上是否正确显示
    cy.contains('登录测试').should('be.visible')
  })

  it('应该能够处理网络错误', () => {
    // 模拟网络错误（通过拦截请求）
    cy.intercept('GET', '**/health-status', { forceNetworkError: true }).as('networkError')

    // 点击 API 连接测试
    cy.contains('测试 API 连接').click()

    // 等待网络错误
    cy.wait('@networkError')

    // 检查错误处理
    cy.get('.logs-container', { timeout: 10000 }).within(() => {
      cy.contains('API 连接失败').should('be.visible')
    })
  })

  it('应该能够处理慢速网络', () => {
    // 模拟慢速响应
    cy.intercept('GET', '**/health-status', {
      delay: 3000,
      body: { status: 'healthy' }
    }).as('slowResponse')

    // 点击 API 连接测试
    cy.contains('测试 API 连接').click()

    // 检查加载状态
    cy.get('button').contains('测试 API 连接').should('exist')

    // 等待响应
    cy.wait('@slowResponse')

    // 检查成功结果
    cy.get('.test-result', { timeout: 5000 }).should('be.visible')
  })

  it('应该保持测试日志的时间顺序', () => {
    // 执行多个操作
    cy.contains('测试 API 连接').click()
    cy.wait(1000)

    cy.contains('填入管理员测试数据').click()
    cy.wait(1000)

    cy.contains('填入普通用户测试数据').click()

    // 检查日志顺序（最新的在上面）
    cy.get('.log-item').first().should('contain', '填入普通用户测试数据')
  })
})

// 辅助函数测试
describe('登录测试页面辅助功能', () => {
  beforeEach(() => {
    cy.visit('/test/login')
  })

  it('应该能够通过键盘导航', () => {
    // 使用 Tab 键导航
    cy.get('input[placeholder="请输入用户名"]').focus()
    cy.focused().type('testuser')

    // Tab 到密码字段
    cy.focused().type('{tab}')
    cy.focused().type('password123')

    // Tab 到登录按钮
    cy.focused().type('{tab}')
    cy.focused().should('contain', '登录测试')
  })

  it('应该支持 Enter 键提交表单', () => {
    cy.get('input[placeholder="请输入用户名"]').type('testuser')
    cy.get('input[placeholder="请输入密码"]').type('password123{enter}')

    // 应该触发登录流程
    cy.get('.logs-container', { timeout: 5000 }).within(() => {
      cy.contains('开始登录测试').should('be.visible')
    })
  })
})
