/**
 * AdvancedTree Component E2E Test Suite
 * 测试树形组件的虚拟滚动、拖拽排序、懒加载、树形导航等完整用户交互流程
 */

import "../support/component-commands"

describe("AdvancedTree E2E Tests", () => {
  const mockTreeData = [
    {
      id: "1",
      label: "技术部",
      icon: "department",
      expanded: true,
      draggable: true,
      children: [
        {
          id: "1-1",
          label: "前端团队",
          icon: "team",
          expanded: false,
          children: [
            { id: "1-1-1", label: "张三 - 高级前端工程师", icon: "user", type: "employee" },
            { id: "1-1-2", label: "李四 - 前端工程师", icon: "user", type: "employee" },
            { id: "1-1-3", label: "王五 - UI设计师", icon: "user", type: "employee" },
          ],
        },
        {
          id: "1-2",
          label: "后端团队",
          icon: "team",
          expanded: false,
          children: [
            { id: "1-2-1", label: "赵六 - 架构师", icon: "user", type: "employee" },
            { id: "1-2-2", label: "钱七 - 后端工程师", icon: "user", type: "employee" },
          ],
        },
        {
          id: "1-3",
          label: "测试团队",
          icon: "team",
          expanded: false,
          children: [{ id: "1-3-1", label: "孙八 - 测试工程师", icon: "user", type: "employee" }],
        },
      ],
    },
    {
      id: "2",
      label: "产品部",
      icon: "department",
      expanded: false,
      children: [
        {
          id: "2-1",
          label: "产品设计",
          icon: "team",
          children: [
            { id: "2-1-1", label: "周九 - 产品经理", icon: "user", type: "employee" },
            { id: "2-1-2", label: "吴十 - 交互设计师", icon: "user", type: "employee" },
          ],
        },
      ],
    },
    {
      id: "3",
      label: "市场部",
      icon: "department",
      expanded: false,
      lazy: true,
      children: [], // Will be loaded lazily
    },
  ]

  const mockLargeTreeData = Array.from({ length: 1000 }, (_, i) => ({
    id: `node-${i}`,
    label: `节点 ${i}`,
    icon: i % 3 === 0 ? "folder" : i % 3 === 1 ? "file" : "document",
    expanded: false,
    children:
      i % 5 === 0
        ? Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, j) => ({
            id: `node-${i}-${j}`,
            label: `子节点 ${i}-${j}`,
            icon: "file",
          }))
        : undefined,
  }))

  const mockCheckableTreeData = [
    {
      id: "permissions",
      label: "权限管理",
      checkable: true,
      checked: false,
      indeterminate: false,
      children: [
        {
          id: "user-mgmt",
          label: "用户管理",
          checkable: true,
          checked: true,
          children: [
            { id: "user-create", label: "创建用户", checkable: true, checked: true },
            { id: "user-edit", label: "编辑用户", checkable: true, checked: true },
            { id: "user-delete", label: "删除用户", checkable: true, checked: false },
          ],
        },
        {
          id: "role-mgmt",
          label: "角色管理",
          checkable: true,
          checked: false,
          children: [
            { id: "role-create", label: "创建角色", checkable: true, checked: false },
            { id: "role-edit", label: "编辑角色", checkable: true, checked: false },
          ],
        },
      ],
    },
  ]

  beforeEach(() => {
    cy.visit("/")
  })

  it("should render tree structure correctly", () => {
    cy.mountComponent("AdvancedTree", {
      data: mockTreeData,
      expandOnClickNode: false,
      showCheckbox: false,
    })

    // Verify tree structure
    cy.get(".advanced-tree").should("exist")
    cy.get(".tree-container").should("exist")

    // Verify root nodes
    cy.get(".tree-node").should("have.length", 3)
    cy.get('[data-id="1"] .node-label').should("contain", "技术部")
    cy.get('[data-id="2"] .node-label').should("contain", "产品部")
    cy.get('[data-id="3"] .node-label').should("contain", "市场部")

    // Verify expanded state
    cy.get('[data-id="1"]').should("have.class", "node-expanded")
    cy.get('[data-id="1"] .node-children').should("be.visible")

    // Verify collapsed state
    cy.get('[data-id="2"]').should("have.class", "node-collapsed")
    cy.get('[data-id="2"] .node-children').should("not.be.visible")

    // Verify icons
    cy.get('[data-id="1"] .node-icon').should("be.visible")
    cy.get('[data-id="1-1"] .node-icon').should("be.visible")
  })

  it("should handle node expansion and collapse", () => {
    cy.mountComponent("AdvancedTree", {
      data: mockTreeData,
      animated: true,
    })

    // Expand a collapsed node
    cy.get('[data-id="2"] .expand-toggle').click()
    cy.wait(300) // Wait for animation

    cy.get('[data-id="2"]').should("have.class", "node-expanded")
    cy.get('[data-id="2"] .node-children').should("be.visible")
    cy.get('[data-id="2-1"]').should("be.visible")

    // Collapse an expanded node
    cy.get('[data-id="1"] .expand-toggle').click()
    cy.wait(300)

    cy.get('[data-id="1"]').should("have.class", "node-collapsed")
    cy.get('[data-id="1"] .node-children').should("not.be.visible")
    cy.get('[data-id="1-1"]').should("not.be.visible")

    // Verify expand/collapse events
    cy.window().its("lastNodeToggle").should("exist")
  })

  it("should support node selection and highlighting", () => {
    cy.mountComponent("AdvancedTree", {
      data: mockTreeData,
      selectable: true,
      highlightCurrent: true,
    })

    // Select a node
    cy.get('[data-id="1-1-1"] .node-content').click()

    // Verify selection
    cy.get('[data-id="1-1-1"]').should("have.class", "node-selected")
    cy.get(".node-selected").should("have.length", 1)

    // Select another node
    cy.get('[data-id="1-2-1"] .node-content').click()

    // Verify single selection
    cy.get('[data-id="1-1-1"]').should("not.have.class", "node-selected")
    cy.get('[data-id="1-2-1"]').should("have.class", "node-selected")

    // Verify selection event
    cy.window().its("lastNodeSelected").should("deep.include", { id: "1-2-1" })
  })

  it("should support checkbox selection with parent-child relationship", () => {
    cy.mountComponent("AdvancedTree", {
      data: mockCheckableTreeData,
      showCheckbox: true,
      checkStrictly: false,
    })

    // Verify initial checkbox states
    cy.get('[data-id="user-mgmt"] .el-checkbox').should("have.class", "is-indeterminate")
    cy.get('[data-id="user-create"] .el-checkbox').should("have.class", "is-checked")
    cy.get('[data-id="user-delete"] .el-checkbox').should("not.have.class", "is-checked")

    // Check parent node (should check all children)
    cy.get('[data-id="role-mgmt"] .el-checkbox .el-checkbox__input').click()

    cy.get('[data-id="role-mgmt"] .el-checkbox').should("have.class", "is-checked")
    cy.get('[data-id="role-create"] .el-checkbox').should("have.class", "is-checked")
    cy.get('[data-id="role-edit"] .el-checkbox').should("have.class", "is-checked")

    // Uncheck a child node (should make parent indeterminate)
    cy.get('[data-id="role-create"] .el-checkbox .el-checkbox__input').click()

    cy.get('[data-id="role-mgmt"] .el-checkbox').should("have.class", "is-indeterminate")
    cy.get('[data-id="role-create"] .el-checkbox').should("not.have.class", "is-checked")

    // Verify checkbox selection event
    cy.window().its("lastCheckboxChange").should("exist")
  })

  it("should support drag and drop reordering", () => {
    cy.mountComponent("AdvancedTree", {
      data: mockTreeData,
      draggable: true,
      allowDrop: true,
    })

    // Verify draggable mode is active
    cy.get(".advanced-tree").should("have.class", "tree-draggable")
    cy.get('[data-id="1-1"]').should("have.attr", "draggable", "true")

    // Test drag and drop between siblings
    cy.testDragAndDrop('[data-id="1-1"]', '[data-id="1-2"]')

    // Verify reordering event
    cy.window().its("lastNodeMove").should("exist")

    // Test drag and drop to different parent
    cy.testDragAndDrop('[data-id="1-1-1"]', '[data-id="2-1"]')

    // Verify cross-parent move event
    cy.window().its("lastCrossParentMove").should("exist")
  })

  it("should handle lazy loading of tree nodes", () => {
    cy.mountComponent("AdvancedTree", {
      data: mockTreeData,
      lazy: true,
      load: (node, resolve) => {
        // Simulate async loading
        setTimeout(() => {
          const children = [
            { id: `${node.id}-lazy-1`, label: "懒加载节点1", icon: "file" },
            { id: `${node.id}-lazy-2`, label: "懒加载节点2", icon: "file" },
            { id: `${node.id}-lazy-3`, label: "懒加载节点3", icon: "file" },
          ]
          resolve(children)
        }, 500)
      },
    })

    // Verify lazy loading indicator
    cy.get('[data-id="3"] .expand-toggle').should("contain", "+")

    // Trigger lazy loading
    cy.get('[data-id="3"] .expand-toggle').click()

    // Verify loading state
    cy.get('[data-id="3"] .loading-indicator').should("be.visible")

    // Wait for lazy loading to complete
    cy.wait(600)

    // Verify loaded children
    cy.get('[data-id="3"]').should("have.class", "node-expanded")
    cy.get('[data-id="3-lazy-1"]').should("be.visible")
    cy.get('[data-id="3-lazy-2"]').should("be.visible")
    cy.get('[data-id="3-lazy-3"]').should("be.visible")
  })

  it("should support virtual scrolling for large datasets", () => {
    cy.mountComponent("AdvancedTree", {
      data: mockLargeTreeData,
      virtualScroll: true,
      itemHeight: 32,
      containerHeight: 400,
    })

    // Test virtual scrolling
    cy.testVirtualScrolling(".advanced-tree")

    // Verify only visible nodes are rendered
    cy.get(".tree-node").should("have.length.lessThan", 20)

    // Test scrolling performance
    cy.measurePerformance(() => {
      cy.get(".tree-container").scrollTo(0, 2000)
      cy.wait(100)
      cy.get(".tree-container").scrollTo(0, 5000)
    })

    // Verify nodes are still functional after scrolling
    cy.get(".tree-node").first().find(".node-content").click()
    cy.get(".node-selected").should("exist")
  })

  it("should support tree search and filtering", () => {
    cy.mountComponent("AdvancedTree", {
      data: mockTreeData,
      searchable: true,
      filterNodeMethod: (value, data) => {
        return data.label.toLowerCase().includes(value.toLowerCase())
      },
    })

    // Verify search functionality
    cy.get(".tree-search").should("be.visible")

    // Search for specific nodes
    cy.get(".tree-search input").type("张三")

    // Verify filtered results
    cy.get(".tree-node").should("have.length", 1)
    cy.get('[data-id="1-1-1"]').should("be.visible")
    cy.get('[data-id="1-1-2"]').should("not.exist")

    // Clear search
    cy.get(".tree-search input").clear()

    // Verify all nodes are visible again
    cy.get(".tree-node").should("have.length", 3) // Root nodes

    // Search with multiple results
    cy.get(".tree-search input").type("团队")

    cy.get(".tree-node:visible").should("have.length.greaterThan", 1)
  })

  it("should support keyboard navigation", () => {
    cy.mountComponent("AdvancedTree", {
      data: mockTreeData,
      keyboardNavigation: true,
    })

    cy.testKeyboardNavigation(".advanced-tree")

    // Test specific tree keyboard navigation
    cy.get('[data-id="1"] .node-content').focus()

    // Test arrow key navigation
    cy.focused().type("{downArrow}")
    cy.focused().should("have.attr", "data-id", "1-1")

    cy.focused().type("{rightArrow}") // Expand node
    cy.wait(100)
    cy.get('[data-id="1-1"]').should("have.class", "node-expanded")

    cy.focused().type("{downArrow}")
    cy.focused().should("have.attr", "data-id", "1-1-1")

    // Test Enter key for selection
    cy.focused().type("{enter}")
    cy.get('[data-id="1-1-1"]').should("have.class", "node-selected")

    // Test Space key for checkbox toggle
    cy.get('[data-id="1-1-1"] .el-checkbox .el-checkbox__input').focus()
    cy.focused().type(" ")
    cy.get('[data-id="1-1-1"] .el-checkbox').should("have.class", "is-checked")
  })

  it("should be responsive across different screen sizes", () => {
    cy.mountComponent("AdvancedTree", {
      data: mockTreeData,
    })

    cy.testResponsiveBreakpoints(".advanced-tree")

    // Test mobile-specific behaviors
    cy.viewport(375, 667)
    cy.wait(200)

    cy.get(".advanced-tree").should("have.class", "mobile-tree")
    cy.get(".node-content").should("have.css", "padding-left")

    // Test touch interactions on mobile
    cy.get('[data-id="2"] .node-content').trigger("touchstart")
    cy.get('[data-id="2"] .node-content').trigger("touchend")

    cy.get('[data-id="2"]').should("have.class", "node-selected")
  })

  it("should pass accessibility standards", () => {
    cy.mountComponent("AdvancedTree", {
      data: mockTreeData,
      keyboardNavigation: true,
      ariaLabel: "组织架构树",
    })

    cy.testAriaAttributes(".advanced-tree")

    // Test tree-specific accessibility
    cy.get('[role="tree"]').should("exist")
    cy.get('[role="treeitem"]').should("have.length.greaterThan", 0)
    cy.get("[aria-expanded]").should("exist")

    // Test focus management
    cy.get(".tree-node").first().find(".node-content").focus()
    cy.focused().should("have.attr", "tabindex", "0")

    // Test screen reader announcements
    cy.get('[data-id="1"] .expand-toggle').click()
    cy.get('[aria-live="polite"]').should("exist")
  })

  it("should handle context menus and node actions", () => {
    const treeWithActions = mockTreeData.map((node) => ({
      ...node,
      actions: [
        { key: "edit", label: "编辑", icon: "edit" },
        { key: "delete", label: "删除", icon: "delete", type: "danger" },
        { key: "add-child", label: "添加子节点", icon: "plus" },
      ],
    }))

    cy.mountComponent("AdvancedTree", {
      data: treeWithActions,
      showActions: true,
      contextMenu: true,
    })

    // Test action buttons
    cy.get('[data-id="1"] .node-actions').should("be.visible")
    cy.get('[data-id="1"] .action-button').should("have.length", 3)

    // Test action click
    cy.get('[data-id="1"] .action-edit').click()
    cy.window().its("lastAction").should("deep.include", { action: "edit", nodeId: "1" })

    // Test context menu
    cy.get('[data-id="1-1"] .node-content').rightclick()
    cy.get(".context-menu").should("be.visible")
    cy.get(".context-menu-item").should("have.length", 3)

    // Test context menu action
    cy.get('.context-menu-item[data-action="delete"]').click()
    cy.window().its("lastContextAction").should("deep.include", { action: "delete" })
  })

  it("should handle complex enterprise scenarios", () => {
    const enterpriseTreeData = [
      {
        id: "company",
        label: "总公司",
        type: "company",
        metadata: {
          employeeCount: 1500,
          revenue: 50000000,
          established: "2010-01-01",
        },
        permissions: ["view", "edit", "manage"],
        status: "active",
        children: [
          {
            id: "region-north",
            label: "北方大区",
            type: "region",
            metadata: { employeeCount: 600, revenue: 20000000 },
            children: [
              {
                id: "office-beijing",
                label: "北京办事处",
                type: "office",
                metadata: { employeeCount: 300, revenue: 12000000 },
                children: [
                  {
                    id: "dept-tech-bj",
                    label: "技术部",
                    type: "department",
                    manager: { id: "emp-001", name: "张经理" },
                    budget: 2000000,
                    children: [
                      {
                        id: "team-frontend-bj",
                        label: "前端开发团队",
                        type: "team",
                        lead: { id: "emp-010", name: "李组长" },
                        members: [
                          { id: "emp-011", name: "王开发", level: "senior" },
                          { id: "emp-012", name: "赵工程师", level: "junior" },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]

    cy.mountComponent("AdvancedTree", {
      data: enterpriseTreeData,
      customNodeRenderer: true,
      showMetadata: true,
      permissionBased: true,
      audit: true,
    })

    // Test custom node rendering with metadata
    cy.get('[data-id="company"] .node-metadata').should("be.visible")
    cy.get('[data-id="company"] .employee-count').should("contain", "1500")
    cy.get('[data-id="company"] .revenue-display').should("contain", "5000万")

    // Test permission-based actions
    cy.get('[data-id="company"] .permission-indicator').should("contain", "manage")
    cy.get('[data-id="company"] .manage-button').should("be.visible")

    // Test hierarchical data display
    cy.get('[data-id="company"] .expand-toggle').click()
    cy.wait(200)

    cy.get('[data-id="region-north"] .region-badge').should("be.visible")
    cy.get('[data-id="region-north"] .employee-count').should("contain", "600")

    // Test deep expansion and navigation
    cy.get('[data-id="region-north"] .expand-toggle').click()
    cy.get('[data-id="office-beijing"] .expand-toggle').click()
    cy.get('[data-id="dept-tech-bj"] .expand-toggle').click()

    // Verify deep nested content
    cy.get('[data-id="team-frontend-bj"]').should("be.visible")
    cy.get('[data-id="team-frontend-bj"] .team-lead').should("contain", "李组长")
    cy.get('[data-id="team-frontend-bj"] .member-count').should("contain", "2")

    // Test audit trail
    cy.get('[data-id="team-frontend-bj"] .node-content').click()
    cy.window().its("auditLog").should("have.length.greaterThan", 0)

    // Test bulk operations
    cy.get(".bulk-operations-toggle").click()
    cy.get(".bulk-operations-panel").should("be.visible")

    // Select multiple nodes for bulk operation
    cy.get('[data-id="dept-tech-bj"] .bulk-checkbox').click()
    cy.get('[data-id="team-frontend-bj"] .bulk-checkbox').click()

    cy.get(".bulk-selected-count").should("contain", "2")
    cy.get(".bulk-action-export").click()

    cy.window().its("bulkExport").should("exist")
  })

  it("should handle performance with extremely large trees", () => {
    const performanceTestData = Array.from({ length: 50000 }, (_, i) => ({
      id: `perf-node-${i}`,
      label: `Performance Test Node ${i}`,
      icon: "file",
      metadata: {
        size: Math.floor(Math.random() * 1000000),
        modified: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
        type: ["document", "image", "video", "audio"][Math.floor(Math.random() * 4)],
      },
      children:
        i % 20 === 0
          ? Array.from({ length: 5 }, (_, j) => ({
              id: `perf-child-${i}-${j}`,
              label: `Child ${j}`,
              icon: "file",
            }))
          : undefined,
    }))

    cy.mountComponent("AdvancedTree", {
      data: performanceTestData,
      virtualScroll: true,
      itemHeight: 28,
      containerHeight: 600,
      bufferSize: 10,
      renderOptimized: true,
    })

    // Test initial rendering performance
    cy.measurePerformance(() => {
      cy.get(".advanced-tree").should("be.visible")
    })

    // Test scrolling performance
    cy.measurePerformance(() => {
      for (let i = 0; i < 10; i++) {
        cy.get(".tree-container").scrollTo(0, i * 1000, { duration: 50 })
        cy.wait(10)
      }
    })

    // Test search performance with large dataset
    cy.measurePerformance(() => {
      cy.get(".tree-search input").type("Performance Test")
      cy.wait(100)
    })

    // Verify search results are still accurate
    cy.get(".tree-node:visible").should("have.length.greaterThan", 0)
    cy.get(".tree-node:visible").first().should("contain", "Performance Test")

    // Test selection performance
    cy.measurePerformance(() => {
      cy.get(".tree-node:visible").first().find(".node-content").click()
    })

    cy.get(".node-selected").should("exist")
  })
})
