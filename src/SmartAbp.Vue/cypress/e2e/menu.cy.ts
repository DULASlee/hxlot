describe('菜单系统测试', () => {
  beforeEach(() => {
    // 模拟登录状态
    cy.window().then(win => {
      win.localStorage.setItem('token', 'fake-jwt-token')
      win.localStorage.setItem('user', JSON.stringify({
        name: 'Test User',
        roles: ['admin']
      }))
    })
    // 访问主页
    cy.visit('/')
    // 等待应用加载完成
    cy.get('.admin-layout').should('be.visible')
  })

  it('主菜单应该默认可见且副菜单隐藏', () => {
    // 确认主菜单可见
    cy.get('.admin-sidebar').should('be.visible')
    // 确认副菜单默认不可见
    cy.get('.admin-submenu.show').should('not.exist')
  })

  it('点击系统管理菜单应显示副菜单且不覆盖主菜单', () => {
    // 点击系统管理菜单
    cy.contains('系统管理').click()
    // 副菜单应该可见
    cy.get('.admin-submenu.show').should('be.visible')
    // 主菜单应该仍然可见
    cy.get('.admin-sidebar').should('be.visible')
    
    // 视觉检查：副菜单应该位于主菜单右侧不覆盖
    cy.get('.admin-body').then($body => {
      const bodyRect = $body[0].getBoundingClientRect()
      cy.get('.admin-sidebar').then($sidebar => {
        const sidebarRect = $sidebar[0].getBoundingClientRect()
        cy.get('.admin-submenu.show').then($submenu => {
          const submenuRect = $submenu[0].getBoundingClientRect()
          // 验证副菜单不覆盖主菜单（左侧边缘应该大于或等于主菜单右侧边缘）
          expect(submenuRect.left).to.be.at.least(sidebarRect.right)
        })
      })
    })
  })

  it('点击隐藏副菜单按钮应该关闭副菜单', () => {
    // 先打开副菜单
    cy.contains('系统管理').click()
    cy.get('.admin-submenu.show').should('be.visible')
    
    // 点击隐藏副菜单按钮
    cy.contains('隐藏副菜单').click()
    
    // 确认副菜单已隐藏
    cy.get('.admin-submenu.show').should('not.exist')
  })

  it('主题切换按钮应该生效', () => {
    // 检查初始主题
    cy.get('html').should('not.have.attr', 'data-theme', 'dark')
    
    // 点击主题切换按钮
    cy.get('.theme-toggle').click()
    
    // 验证主题已切换到暗色
    cy.get('html').should('have.attr', 'data-theme', 'dark')
    
    // 再次点击恢复亮色主题
    cy.get('.theme-toggle').click()
    cy.get('html').should('not.have.attr', 'data-theme', 'dark')
  })
  
  it('折叠侧边栏按钮应该正常工作', () => {
    // 检查初始状态
    cy.get('.admin-sidebar').should('be.visible')
    cy.get('.admin-sidebar').should('not.have.class', 'collapsed')
    
    // 点击折叠按钮
    cy.get('.toggle-sidebar-btn').click()
    
    // 验证侧边栏已折叠
    cy.get('.admin-sidebar').should('have.class', 'collapsed')
    
    // 再次点击展开
    cy.get('.toggle-sidebar-btn').click()
    cy.get('.admin-sidebar').should('not.have.class', 'collapsed')
  })
}) 