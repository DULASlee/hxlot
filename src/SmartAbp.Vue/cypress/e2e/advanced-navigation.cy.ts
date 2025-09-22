/**
 * AdvancedNavigation Component E2E Test Suite
 * 测试多层级导航、面包屑、移动端菜单等完整用户交互流程
 */

import "../support/component-commands"

describe("AdvancedNavigation E2E Tests", () => {
  const mockNavigationItems = [
    {
      id: "dashboard",
      label: "仪表板",
      icon: "dashboard",
      path: "/dashboard",
      visible: true,
      permissions: ["dashboard.view"],
    },
    {
      id: "system",
      label: "系统管理",
      icon: "system",
      path: "/system",
      visible: true,
      permissions: ["system.view"],
      children: [
        {
          id: "users",
          label: "用户管理",
          icon: "user",
          path: "/system/users",
          visible: true,
          permissions: ["user.view"],
          children: [
            {
              id: "user-list",
              label: "用户列表",
              path: "/system/users/list",
              visible: true,
            },
            {
              id: "user-roles",
              label: "用户角色",
              path: "/system/users/roles",
              visible: true,
            },
          ],
        },
        {
          id: "roles",
          label: "角色管理",
          icon: "role",
          path: "/system/roles",
          visible: true,
          permissions: ["role.view"],
        },
        {
          id: "permissions",
          label: "权限管理",
          icon: "permission",
          path: "/system/permissions",
          visible: true,
          permissions: ["permission.view"],
        },
      ],
    },
    {
      id: "content",
      label: "内容管理",
      icon: "content",
      path: "/content",
      visible: true,
      permissions: ["content.view"],
      children: [
        {
          id: "articles",
          label: "文章管理",
          path: "/content/articles",
          visible: true,
        },
        {
          id: "media",
          label: "媒体库",
          path: "/content/media",
          visible: true,
        },
      ],
    },
    {
      id: "reports",
      label: "报表中心",
      icon: "chart",
      path: "/reports",
      visible: true,
      permissions: ["report.view"],
    },
    {
      id: "settings",
      label: "系统设置",
      icon: "settings",
      path: "/settings",
      visible: true,
      permissions: ["settings.view"],
    },
  ]

  const mockUserPermissions = [
    "dashboard.view",
    "system.view",
    "user.view",
    "role.view",
    "content.view",
    "report.view",
    "settings.view",
  ]

  beforeEach(() => {
    cy.visit("/")
  })

  it("should render navigation with proper structure", () => {
    cy.mountComponent("AdvancedNavigation", {
      items: mockNavigationItems,
      currentPath: "/system/users",
      userPermissions: mockUserPermissions,
      mode: "vertical",
    })

    // Verify basic structure
    cy.get(".advanced-navigation").should("exist")
    cy.get(".navigation-container").should("exist")

    // Verify top-level items
    cy.get('[data-id="dashboard"]').should("contain", "仪表板")
    cy.get('[data-id="system"]').should("contain", "系统管理")
    cy.get('[data-id="reports"]').should("contain", "报表中心")

    // Verify icons are displayed
    cy.get(".nav-icon").should("have.length.greaterThan", 0)
  })

  it("should handle multi-level menu expansion and navigation", () => {
    cy.mountComponent("AdvancedNavigation", {
      items: mockNavigationItems,
      currentPath: "/dashboard",
      userPermissions: mockUserPermissions,
      mode: "vertical",
    })

    // Test navigation flow through multiple levels
    cy.testNavigationFlow([
      "system", // Expand system menu
      "users", // Expand users submenu
      "user-list", // Navigate to user list
      "user-roles", // Navigate to user roles
    ])

    // Verify menu expansion states
    cy.get('[data-id="system"]').should("have.class", "menu-expanded")
    cy.get('[data-id="users"]').should("have.class", "menu-expanded")

    // Verify active states
    cy.get('[data-id="user-roles"]').should("have.class", "is-active")
  })

  it("should display and interact with breadcrumb navigation", () => {
    cy.mountComponent("AdvancedNavigation", {
      items: mockNavigationItems,
      currentPath: "/system/users/roles",
      userPermissions: mockUserPermissions,
      showBreadcrumb: true,
    })

    // Verify breadcrumb is displayed
    cy.get(".navigation-breadcrumb").should("be.visible")

    // Verify breadcrumb items
    cy.get(".breadcrumb-item").should("have.length", 3)
    cy.get(".breadcrumb-item").eq(0).should("contain", "系统管理")
    cy.get(".breadcrumb-item").eq(1).should("contain", "用户管理")
    cy.get(".breadcrumb-item").eq(2).should("contain", "用户角色")

    // Test breadcrumb navigation
    cy.get('.breadcrumb-item[data-path="/system"]').click()
    cy.window().its("lastNavigatePath").should("equal", "/system")
  })

  it("should work properly on mobile devices", () => {
    cy.mountComponent("AdvancedNavigation", {
      items: mockNavigationItems,
      currentPath: "/dashboard",
      userPermissions: mockUserPermissions,
    })

    // Switch to mobile viewport
    cy.viewport(375, 667)
    cy.wait(200)

    // Verify mobile mode is activated
    cy.get(".advanced-navigation").should("have.class", "mobile-mode")
    cy.get(".mobile-menu-toggle").should("be.visible")
    cy.get(".mobile-menu-title").should("contain", "仪表板")

    // Test mobile menu toggle
    cy.get(".mobile-menu-toggle").click()
    cy.get(".advanced-navigation").should("have.class", "mobile-menu-open")
    cy.get(".mobile-menu-overlay").should("be.visible")

    // Test navigation in mobile mode
    cy.get('[data-id="system"]').click()
    cy.get('[data-id="users"]').should("be.visible")

    // Test closing mobile menu by clicking overlay
    cy.get(".mobile-menu-overlay").click()
    cy.get(".advanced-navigation").should("not.have.class", "mobile-menu-open")
  })

  it("should support search functionality", () => {
    cy.mountComponent("AdvancedNavigation", {
      items: mockNavigationItems,
      currentPath: "/dashboard",
      userPermissions: mockUserPermissions,
      enableSearch: true,
    })

    // Verify search box is present
    cy.get(".navigation-search").should("be.visible")
    cy.get(".search-input input").should("be.visible")

    // Test search functionality
    cy.get(".search-input input").type("用户")

    // Verify search results
    cy.get('[data-id="users"]').should("not.have.class", "search-hidden")
    cy.get('[data-id="reports"]').should("have.class", "search-hidden")

    // Verify search highlighting
    cy.get(".search-highlight").should("exist")
    cy.get(".search-highlight").should("contain", "用户")

    // Test search clearing
    cy.get(".search-clear").click()
    cy.get(".search-input input").should("have.value", "")
    cy.get(".search-hidden").should("not.exist")
  })

  it("should enforce permission-based visibility", () => {
    const limitedPermissions = ["dashboard.view", "content.view"]

    cy.mountComponent("AdvancedNavigation", {
      items: mockNavigationItems,
      currentPath: "/dashboard",
      userPermissions: limitedPermissions,
    })

    // Verify items with permissions are visible
    cy.get('[data-id="dashboard"]').should("exist")
    cy.get('[data-id="content"]').should("exist")

    // Verify items without permissions are hidden
    cy.get('[data-id="system"]').should("not.exist")
    cy.get('[data-id="reports"]').should("not.exist")
    cy.get('[data-id="settings"]').should("not.exist")
  })

  it("should support keyboard navigation", () => {
    cy.mountComponent("AdvancedNavigation", {
      items: mockNavigationItems,
      currentPath: "/dashboard",
      userPermissions: mockUserPermissions,
      keyboardNavigation: true,
    })

    cy.testKeyboardNavigation(".advanced-navigation")

    // Test specific navigation keyboard shortcuts
    cy.get('[data-id="dashboard"]').focus()
    cy.focused().type("{downArrow}")
    cy.focused().should("have.attr", "data-id", "system")

    // Test menu expansion with keyboard
    cy.focused().type("{rightArrow}")
    cy.get('[data-id="system"]').should("have.class", "menu-expanded")

    // Test submenu navigation
    cy.focused().type("{downArrow}")
    cy.focused().should("have.attr", "data-id", "users")
  })

  it("should handle different navigation modes", () => {
    // Test vertical mode
    cy.mountComponent("AdvancedNavigation", {
      items: mockNavigationItems,
      userPermissions: mockUserPermissions,
      mode: "vertical",
    })

    cy.get(".advanced-navigation").should("have.class", "nav-mode-vertical")
    cy.get(".navigation-container").should("have.class", "vertical-layout")

    // Test horizontal mode
    cy.mountComponent("AdvancedNavigation", {
      items: mockNavigationItems,
      userPermissions: mockUserPermissions,
      mode: "horizontal",
    })

    cy.get(".advanced-navigation").should("have.class", "nav-mode-horizontal")
    cy.get(".navigation-container").should("have.class", "horizontal-layout")

    // Test sidebar mode
    cy.mountComponent("AdvancedNavigation", {
      items: mockNavigationItems,
      userPermissions: mockUserPermissions,
      mode: "sidebar",
      collapse: false,
    })

    cy.get(".advanced-navigation").should("have.class", "nav-mode-sidebar")
    cy.get(".navigation-container").should("have.class", "sidebar-layout")
  })

  it("should maintain accessibility standards", () => {
    cy.mountComponent("AdvancedNavigation", {
      items: mockNavigationItems,
      currentPath: "/system/users",
      userPermissions: mockUserPermissions,
    })

    cy.testAriaAttributes(".advanced-navigation")

    // Test specific navigation accessibility
    cy.get('nav[role="navigation"]').should("exist")
    cy.get('[role="menuitem"]').should("have.length.greaterThan", 0)

    // Verify ARIA expanded states
    cy.get('[aria-expanded="true"]').should("exist") // For expanded system menu
    cy.get('[aria-expanded="false"]').should("exist") // For collapsed menus

    // Test screen reader descriptions
    cy.get("[aria-label]").each(($el) => {
      expect($el.attr("aria-label")).to.not.be.empty
    })
  })

  it("should handle error scenarios gracefully", () => {
    // Test with invalid data
    cy.mountComponent("AdvancedNavigation", {
      items: null,
      userPermissions: mockUserPermissions,
    })

    cy.get(".navigation-error").should("be.visible")

    // Test with empty permissions
    cy.mountComponent("AdvancedNavigation", {
      items: mockNavigationItems,
      userPermissions: [],
    })

    cy.get(".navigation-empty").should("be.visible")
    cy.get(".navigation-empty").should("contain", "暂无导航项目")
  })

  it("should perform well with large menu structures", () => {
    // Create large navigation structure
    const largeNavItems = Array.from({ length: 100 }, (_, i) => ({
      id: `category-${i}`,
      label: `分类 ${i}`,
      path: `/category/${i}`,
      visible: true,
      permissions: ["view"],
      children: Array.from({ length: 20 }, (_, j) => ({
        id: `item-${i}-${j}`,
        label: `项目 ${i}-${j}`,
        path: `/category/${i}/item/${j}`,
        visible: true,
      })),
    }))

    cy.mountComponent("AdvancedNavigation", {
      items: largeNavItems,
      userPermissions: ["view"],
      enableSearch: true,
    })

    // Test rendering performance
    cy.measurePerformance(() => {
      cy.get(".advanced-navigation").should("be.visible")
    })

    // Test search performance with large dataset
    cy.measurePerformance(() => {
      cy.get(".search-input input").type("项目 50")
      cy.wait(100)
    })

    // Test navigation expansion performance
    cy.measurePerformance(() => {
      cy.get('[data-id="category-50"]').click()
      cy.wait(100)
    })
  })

  it("should support complex enterprise navigation scenarios", () => {
    const enterpriseNavItems = [
      {
        id: "dashboard",
        label: "工作台",
        path: "/dashboard",
        icon: "dashboard",
        badge: { value: 5, type: "warning" },
        visible: true,
      },
      {
        id: "business",
        label: "业务管理",
        icon: "business",
        visible: true,
        children: [
          {
            id: "orders",
            label: "订单管理",
            path: "/business/orders",
            badge: { value: "new", type: "danger" },
            children: [
              {
                id: "pending-orders",
                label: "待处理订单",
                path: "/business/orders/pending",
                badge: { value: 23, type: "warning" },
              },
              {
                id: "completed-orders",
                label: "已完成订单",
                path: "/business/orders/completed",
              },
            ],
          },
          {
            id: "customers",
            label: "客户管理",
            path: "/business/customers",
            children: [
              {
                id: "customer-list",
                label: "客户列表",
                path: "/business/customers/list",
              },
              {
                id: "customer-groups",
                label: "客户分组",
                path: "/business/customers/groups",
              },
            ],
          },
        ],
      },
    ]

    cy.mountComponent("AdvancedNavigation", {
      items: enterpriseNavItems,
      currentPath: "/business/orders/pending",
      userPermissions: ["view"],
      showBreadcrumb: true,
      enableSearch: true,
    })

    // Test badge display
    cy.get('[data-id="dashboard"] .nav-badge').should("contain", "5")
    cy.get('[data-id="orders"] .nav-badge').should("contain", "new")

    // Test deep navigation path
    cy.get(".navigation-breadcrumb .breadcrumb-item").should("have.length", 3)
    cy.get(".breadcrumb-item").eq(2).should("contain", "待处理订单")

    // Test enterprise search across multiple levels
    cy.get(".search-input input").type("订单")
    cy.get('[data-id="orders"]').should("not.have.class", "search-hidden")
    cy.get('[data-id="pending-orders"]').should("not.have.class", "search-hidden")
    cy.get('[data-id="customers"]').should("have.class", "search-hidden")
  })
})
