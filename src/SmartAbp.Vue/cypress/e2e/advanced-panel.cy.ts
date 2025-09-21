/**
 * AdvancedPanel Component E2E Test Suite
 * 测试可折叠面板、手风琴模式、拖拽排序等完整用户交互流程
 */

import '../support/component-commands'

describe('AdvancedPanel E2E Tests', () => {
  const mockPanelItems = [
    {
      id: 'basic-info',
      title: '基础信息',
      content: '这里是基础信息的内容，包含用户的基本资料和联系方式。',
      icon: 'info',
      expanded: true,
      collapsible: true,
      actions: [
        { key: 'edit', label: '编辑', icon: 'edit', type: 'primary' },
        { key: 'delete', label: '删除', icon: 'delete', type: 'danger' }
      ]
    },
    {
      id: 'advanced-settings',
      title: '高级设置',
      content: '这里是高级设置的内容，包含系统配置和权限管理。',
      icon: 'settings',
      expanded: false,
      collapsible: true,
      badge: { value: 3, type: 'warning' }
    },
    {
      id: 'security',
      title: '安全设置',
      content: '这里是安全设置的内容，包含密码策略和访问控制。',
      icon: 'security',
      expanded: false,
      collapsible: true,
      badge: { value: 'new', type: 'danger' }
    },
    {
      id: 'notifications',
      title: '通知设置',
      content: '这里是通知设置的内容，包含邮件和短信通知配置。',
      icon: 'notification',
      expanded: false,
      collapsible: true
    },
    {
      id: 'system-logs',
      title: '系统日志',
      content: '这里显示系统操作日志和审计信息。',
      icon: 'log',
      expanded: false,
      collapsible: false, // Non-collapsible panel
      disabled: false
    }
  ]

  const mockNestedPanels = [
    {
      id: 'user-management',
      title: '用户管理',
      icon: 'user',
      expanded: true,
      children: [
        {
          id: 'user-profile',
          title: '用户档案',
          content: '用户基础信息和头像设置',
          expanded: false,
          children: [
            {
              id: 'personal-info',
              title: '个人信息',
              content: '姓名、邮箱、电话等基础信息',
              expanded: false
            },
            {
              id: 'avatar-settings',
              title: '头像设置',
              content: '上传和管理用户头像',
              expanded: false
            }
          ]
        },
        {
          id: 'user-permissions',
          title: '用户权限',
          content: '角色分配和权限管理',
          expanded: false,
          badge: { value: 5, type: 'info' }
        }
      ]
    },
    {
      id: 'system-config',
      title: '系统配置',
      icon: 'config',
      expanded: false,
      children: [
        {
          id: 'general-settings',
          title: '常规设置',
          content: '系统基本参数配置',
          expanded: false
        },
        {
          id: 'database-config',
          title: '数据库配置',
          content: '数据库连接和优化设置',
          expanded: false
        }
      ]
    }
  ]

  beforeEach(() => {
    cy.visit('/')
  })

  it('should render panels with proper structure and states', () => {
    cy.mountComponent('AdvancedPanel', {
      items: mockPanelItems,
      mode: 'normal'
    })

    // Verify basic structure
    cy.get('.advanced-panel').should('exist')
    cy.get('.panel-container').should('exist')

    // Verify all panels are rendered
    cy.get('.panel-item').should('have.length', mockPanelItems.length)

    // Verify panel titles and icons
    cy.get('[data-id="basic-info"] .panel-title').should('contain', '基础信息')
    cy.get('[data-id="basic-info"] .panel-icon').should('be.visible')

    // Verify initial expansion states
    cy.get('[data-id="basic-info"]').should('have.class', 'panel-expanded')
    cy.get('[data-id="advanced-settings"]').should('have.class', 'panel-collapsed')

    // Verify badges
    cy.get('[data-id="advanced-settings"] .panel-badge').should('contain', '3')
    cy.get('[data-id="security"] .panel-badge').should('contain', 'new')

    // Verify action buttons
    cy.get('[data-id="basic-info"] .panel-actions .el-button').should('have.length', 2)
  })

  it('should handle panel expansion and collapse correctly', () => {
    cy.mountComponent('AdvancedPanel', {
      items: mockPanelItems,
      mode: 'normal',
      animated: true
    })

    // Test expanding a collapsed panel
    cy.get('[data-id="advanced-settings"] .panel-toggle').click()
    cy.wait(400) // Wait for animation

    cy.get('[data-id="advanced-settings"]').should('have.class', 'panel-expanded')
    cy.get('[data-id="advanced-settings"] .panel-content').should('be.visible')
    cy.get('[data-id="advanced-settings"] .panel-content').should('contain', '高级设置的内容')

    // Test collapsing an expanded panel
    cy.get('[data-id="basic-info"] .panel-toggle').click()
    cy.wait(400)

    cy.get('[data-id="basic-info"]').should('have.class', 'panel-collapsed')
    cy.get('[data-id="basic-info"] .panel-content').should('not.be.visible')

    // Verify toggle icon changes
    cy.get('[data-id="advanced-settings"] .panel-toggle').should('contain', '▼')
    cy.get('[data-id="basic-info"] .panel-toggle').should('contain', '▶')
  })

  it('should work properly in accordion mode', () => {
    cy.mountComponent('AdvancedPanel', {
      items: mockPanelItems,
      accordion: true,
      allowCollapseAll: false
    })

    // Test accordion behavior
    cy.testPanelAccordion(['basic-info', 'advanced-settings', 'security', 'notifications'])

    // Verify only one panel is expanded at a time
    cy.get('.panel-expanded').should('have.length', 1)
    cy.get('[data-id="notifications"]').should('have.class', 'panel-expanded')

    // Test that accordion mode is properly indicated
    cy.get('.advanced-panel').should('have.class', 'accordion-mode')
  })

  it('should support accordion mode with collapse all', () => {
    cy.mountComponent('AdvancedPanel', {
      items: mockPanelItems,
      accordion: true,
      allowCollapseAll: true
    })

    // Expand a panel first
    cy.get('[data-id="security"] .panel-toggle').click()
    cy.get('[data-id="security"]').should('have.class', 'panel-expanded')

    // Click the same panel again to collapse all
    cy.get('[data-id="security"] .panel-toggle').click()
    cy.wait(200)

    // Verify all panels are collapsed
    cy.get('.panel-expanded').should('have.length', 0)
  })

  it('should support drag and drop reordering', () => {
    cy.mountComponent('AdvancedPanel', {
      items: mockPanelItems,
      draggable: true
    })

    // Verify draggable mode is active
    cy.get('.advanced-panel').should('have.class', 'draggable-panels')
    cy.get('.panel-item').should('have.attr', 'draggable', 'true')

    // Verify drag handles are visible
    cy.get('.drag-handle').should('have.length', mockPanelItems.length)

    // Test drag and drop
    cy.testDragAndDrop(
      '[data-id="basic-info"]',
      '[data-id="security"]'
    )

    // Verify reordering event was triggered
    cy.window().its('lastPanelReorder').should('exist')
  })

  it('should handle nested panels correctly', () => {
    cy.mountComponent('AdvancedPanel', {
      items: mockNestedPanels,
      nested: true,
      level: 0
    })

    // Verify nested structure
    cy.get('[data-id="user-management"]').should('exist')
    cy.get('.nested-panel').should('exist')

    // Test nested panel expansion
    cy.get('[data-id="user-profile"] .panel-toggle').click()
    cy.wait(200)

    cy.get('[data-id="user-profile"]').should('have.class', 'panel-expanded')

    // Test deeply nested panels (3 levels)
    cy.get('[data-id="personal-info"] .panel-toggle').click()
    cy.wait(200)

    cy.get('[data-id="personal-info"]').should('have.class', 'panel-expanded')
    cy.get('[data-id="personal-info"] .panel-content').should('contain', '基础信息')

    // Verify nesting level classes
    cy.get('.nest-level-2').should('exist')
    cy.get('.nest-level-3').should('exist')
  })

  it('should support keyboard navigation', () => {
    cy.mountComponent('AdvancedPanel', {
      items: mockPanelItems,
      keyboardNavigation: true
    })

    cy.testKeyboardNavigation('.advanced-panel')

    // Test specific panel keyboard interactions
    cy.get('[data-id="basic-info"] .panel-header').focus()
    
    // Test space key to toggle
    cy.focused().type(' ')
    cy.wait(200)
    cy.get('[data-id="basic-info"]').should('have.class', 'panel-collapsed')

    // Test enter key to toggle
    cy.focused().type('{enter}')
    cy.wait(200)
    cy.get('[data-id="basic-info"]').should('have.class', 'panel-expanded')

    // Test arrow key navigation
    cy.focused().type('{downArrow}')
    cy.focused().should('have.attr', 'aria-controls').and('contain', 'advanced-settings')
  })

  it('should handle panel actions correctly', () => {
    cy.mountComponent('AdvancedPanel', {
      items: mockPanelItems
    })

    // Test action button clicks
    cy.get('[data-id="basic-info"] .panel-actions .el-button').first().click()
    cy.window().its('lastActionClick').should('deep.include', { key: 'edit' })

    cy.get('[data-id="basic-info"] .panel-actions .el-button').last().click()
    cy.window().its('lastActionClick').should('deep.include', { key: 'delete' })

    // Verify actions don't trigger panel toggle
    cy.get('[data-id="basic-info"]').should('have.class', 'panel-expanded')
  })

  it('should be responsive across different screen sizes', () => {
    cy.mountComponent('AdvancedPanel', {
      items: mockPanelItems
    })

    cy.testResponsiveBreakpoints('.advanced-panel')

    // Test mobile-specific behaviors
    cy.viewport(375, 667)
    cy.wait(200)

    // Verify panels adapt to mobile layout
    cy.get('.panel-header').should('have.css', 'padding', '12px')
    cy.get('.panel-content').should('have.css', 'padding', '12px')
  })

  it('should maintain accessibility standards', () => {
    cy.mountComponent('AdvancedPanel', {
      items: mockPanelItems,
      keyboardNavigation: true
    })

    cy.testAriaAttributes('.advanced-panel')

    // Test specific panel accessibility
    cy.get('[role="tablist"]').should('exist')
    cy.get('[role="tab"]').should('have.length.greaterThan', 0)
    cy.get('[role="tabpanel"]').should('exist')

    // Verify ARIA expanded states
    cy.get('[aria-expanded="true"]').should('exist')
    cy.get('[aria-expanded="false"]').should('exist')

    // Test focus management
    cy.get('.panel-header').first().focus()
    cy.focused().should('have.attr', 'tabindex', '0')
  })

  it('should handle different panel modes', () => {
    // Test card mode
    cy.mountComponent('AdvancedPanel', {
      items: mockPanelItems,
      mode: 'card'
    })

    cy.get('.advanced-panel').should('have.class', 'panel-mode-card')
    cy.get('.panel-item').should('have.css', 'margin-bottom')

    // Test ghost mode
    cy.mountComponent('AdvancedPanel', {
      items: mockPanelItems,
      mode: 'ghost'
    })

    cy.get('.advanced-panel').should('have.class', 'panel-mode-ghost')
  })

  it('should handle error scenarios gracefully', () => {
    // Test with invalid data
    cy.mountComponent('AdvancedPanel', {
      items: null
    })

    cy.get('.panel-error').should('be.visible')

    // Test with empty items
    cy.mountComponent('AdvancedPanel', {
      items: []
    })

    cy.get('.panel-empty').should('be.visible')
    cy.get('.panel-empty').should('contain', '暂无面板项目')

    // Test disabled panels
    const disabledItems = [
      { ...mockPanelItems[0], disabled: true }
    ]

    cy.mountComponent('AdvancedPanel', {
      items: disabledItems
    })

    cy.get('[data-id="basic-info"]').should('have.class', 'panel-disabled')
    cy.get('[data-id="basic-info"] .panel-toggle').should('have.attr', 'disabled')
  })

  it('should perform well with many panels', () => {
    const manyPanels = Array.from({ length: 100 }, (_, i) => ({
      id: `panel-${i}`,
      title: `面板 ${i}`,
      content: `这是面板 ${i} 的内容。`.repeat(10),
      expanded: i % 10 === 0,
      collapsible: true
    }))

    cy.mountComponent('AdvancedPanel', {
      items: manyPanels,
      animated: true
    })

    // Test rendering performance
    cy.measurePerformance(() => {
      cy.get('.advanced-panel').should('be.visible')
    })

    // Test expansion performance
    cy.measurePerformance(() => {
      for (let i = 0; i < 10; i++) {
        cy.get(`[data-id="panel-${i * 10}"] .panel-toggle`).click({ force: true })
        cy.wait(50)
      }
    })
  })

  it('should support custom content and HTML rendering', () => {
    const customPanels = [
      {
        id: 'html-content',
        title: 'HTML内容面板',
        content: '<p>这是<strong>HTML内容</strong>，支持<em>富文本</em>显示。</p>',
        htmlContent: true,
        expanded: true
      },
      {
        id: 'slot-content',
        title: '自定义插槽面板',
        contentSlot: true,
        expanded: true
      },
      {
        id: 'header-slot',
        title: '自定义头部',
        content: '常规内容',
        headerSlot: true,
        expanded: false
      }
    ]

    cy.mountComponent('AdvancedPanel', {
      items: customPanels
    })

    // Test HTML content rendering
    cy.get('[data-id="html-content"] .panel-html-content').within(() => {
      cy.get('strong').should('contain', 'HTML内容')
      cy.get('em').should('contain', '富文本')
    })

    // Test slot content
    cy.get('[data-id="slot-content"] .panel-content-slot').should('exist')
    cy.get('[data-id="header-slot"] .panel-header-slot').should('exist')
  })

  it('should handle complex enterprise scenarios', () => {
    const enterprisePanels = [
      {
        id: 'dashboard-overview',
        title: '仪表板概览',
        icon: 'dashboard',
        expanded: true,
        badge: { value: 'live', type: 'success' },
        content: '实时业务数据和关键指标展示',
        actions: [
          { key: 'refresh', label: '刷新', icon: 'refresh', type: 'default' },
          { key: 'export', label: '导出', icon: 'download', type: 'primary' },
          { key: 'settings', label: '设置', icon: 'setting', type: 'default' }
        ]
      },
      {
        id: 'business-analytics',
        title: '业务分析',
        icon: 'analytics',
        expanded: false,
        badge: { value: 12, type: 'warning' },
        children: [
          {
            id: 'sales-report',
            title: '销售报告',
            content: '详细的销售数据分析和趋势图表',
            badge: { value: 'new', type: 'danger' },
            expanded: false
          },
          {
            id: 'customer-analysis',
            title: '客户分析',
            content: '客户行为分析和用户画像',
            expanded: false
          }
        ]
      },
      {
        id: 'system-monitoring',
        title: '系统监控',
        icon: 'monitor',
        expanded: false,
        children: [
          {
            id: 'server-status',
            title: '服务器状态',
            content: '服务器性能监控和资源使用情况',
            badge: { value: 'warning', type: 'warning' },
            expanded: false
          },
          {
            id: 'error-logs',
            title: '错误日志',
            content: '系统错误和异常日志记录',
            badge: { value: 3, type: 'danger' },
            expanded: false
          }
        ]
      }
    ]

    cy.mountComponent('AdvancedPanel', {
      items: enterprisePanels,
      nested: true,
      draggable: true,
      accordion: false,
      animated: true
    })

    // Test enterprise features integration
    cy.get('[data-id="dashboard-overview"]').within(() => {
      cy.get('.panel-badge').should('contain', 'live')
      cy.get('.panel-actions .el-button').should('have.length', 3)
    })

    // Test nested enterprise panels
    cy.get('[data-id="business-analytics"] .panel-toggle').click()
    cy.wait(300)

    cy.get('[data-id="sales-report"]').should('be.visible')
    cy.get('[data-id="sales-report"] .panel-badge').should('contain', 'new')

    // Test action handling in enterprise context
    cy.get('[data-id="dashboard-overview"] .panel-actions').within(() => {
      cy.contains('刷新').click()
      cy.contains('导出').click()
      cy.contains('设置').click()
    })

    // Verify complex badge types
    cy.get('[data-id="system-monitoring"] .panel-toggle').click()
    cy.wait(300)

    cy.get('[data-id="server-status"] .panel-badge').should('contain', 'warning')
    cy.get('[data-id="error-logs"] .panel-badge').should('contain', '3')
  })
})