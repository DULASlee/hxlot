/**
 * AdvancedTable Component E2E Test Suite
 * 测试完整的用户交互流程和企业级场景
 */

import '../support/component-commands'

describe('AdvancedTable E2E Tests', () => {
  const mockLargeData = Array.from({ length: 10000 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    department: ['Engineering', 'Sales', 'Marketing'][i % 3],
    salary: 50000 + (i * 1000),
    status: i % 2 === 0 ? 'active' : 'inactive'
  }))

  const mockColumns = [
    { key: 'id', label: 'ID', width: 80, sortable: true },
    { key: 'name', label: '姓名', width: 120, sortable: true },
    { key: 'email', label: '邮箱', width: 200 },
    { key: 'department', label: '部门', width: 100, sortable: true },
    { key: 'salary', label: '薪资', width: 100, sortable: true },
    { key: 'status', label: '状态', width: 80 }
  ]

  beforeEach(() => {
    cy.visit('/') // Assuming there's a demo page
  })

  it('should handle large dataset with virtual scrolling', () => {
    cy.mountComponent('AdvancedTable', {
      columns: mockColumns,
      data: mockLargeData,
      virtualScroll: true,
      itemHeight: 40,
      containerHeight: 400
    })

    // Test virtual scrolling performance
    cy.testVirtualScrolling('.advanced-table')

    // Verify only visible items are rendered
    cy.get('.layout-item').should('have.length.lessThan', 20)
    
    // Test scrolling to different positions
    cy.measurePerformance(() => {
      cy.get('.table-body').scrollTo(0, 5000)
    })

    // Verify data integrity after scrolling
    cy.get('.layout-item').first().should('contain', 'User')
  })

  it('should support column dragging and reordering', () => {
    cy.mountComponent('AdvancedTable', {
      columns: mockColumns,
      data: mockLargeData.slice(0, 100),
      columnDraggable: true
    })

    // Get initial column order
    cy.get('.column-header').first().should('contain', 'ID')
    cy.get('.column-header').eq(1).should('contain', '姓名')

    // Test column drag and drop
    cy.testDragAndDrop(
      '.column-header:first',
      '.column-header:nth-child(3)'
    )

    // Verify column reordering event
    cy.window().its('lastColumnOrder').should('exist')
  })

  it('should handle sorting functionality', () => {
    cy.mountComponent('AdvancedTable', {
      columns: mockColumns,
      data: mockLargeData.slice(0, 100),
      sortable: true
    })

    // Test ascending sort
    cy.get('[data-column="salary"] .sort-indicator').click()
    cy.get('.sort-asc').should('be.visible')

    // Verify data is sorted
    cy.get('.layout-item').first().should('contain', '50000')

    // Test descending sort
    cy.get('[data-column="salary"] .sort-indicator').click()
    cy.get('.sort-desc').should('be.visible')

    // Verify reverse sort
    cy.get('.layout-item').first().should('contain', '149000')
  })

  it('should support keyboard navigation', () => {
    cy.mountComponent('AdvancedTable', {
      columns: mockColumns,
      data: mockLargeData.slice(0, 10),
      keyboardNavigation: true
    })

    cy.testKeyboardNavigation('.advanced-table')

    // Test row selection with keyboard
    cy.get('.layout-item').first().focus()
    cy.focused().type('{enter}')
    
    // Verify row selection
    cy.get('.layout-item.selected').should('exist')
  })

  it('should be responsive across different screen sizes', () => {
    cy.mountComponent('AdvancedTable', {
      columns: mockColumns,
      data: mockLargeData.slice(0, 50)
    })

    cy.testResponsiveBreakpoints('.advanced-table')

    // Test mobile-specific behaviors
    cy.viewport(375, 667)
    cy.get('.advanced-table').should('have.class', 'mobile-mode')
  })

  it('should pass accessibility standards', () => {
    cy.mountComponent('AdvancedTable', {
      columns: mockColumns,
      data: mockLargeData.slice(0, 20)
    })

    cy.testAriaAttributes('.advanced-table')

    // Test specific table accessibility
    cy.get('[role="grid"]').should('exist')
    cy.get('[role="gridcell"]').should('have.length.greaterThan', 0)
    cy.get('[role="columnheader"]').should('have.length', mockColumns.length)
  })

  it('should handle edge cases and error scenarios', () => {
    // Test empty data
    cy.mountComponent('AdvancedTable', {
      columns: mockColumns,
      data: []
    })
    
    cy.get('.table-empty').should('be.visible')
    cy.get('.table-empty').should('contain', '暂无数据')

    // Test invalid data
    cy.mountComponent('AdvancedTable', {
      columns: mockColumns,
      data: null
    })

    cy.get('.table-error').should('be.visible')
  })

  it('should maintain performance under stress conditions', () => {
    const stressTestData = Array.from({ length: 50000 }, (_, i) => ({
      id: i,
      name: `Stress Test User ${i}`,
      email: `stress${i}@test.com`,
      data: 'x'.repeat(100) // Large text field
    }))

    cy.mountComponent('AdvancedTable', {
      columns: mockColumns,
      data: stressTestData,
      virtualScroll: true
    })

    // Measure rendering performance
    cy.measurePerformance(() => {
      cy.get('.advanced-table').should('be.visible')
    })

    // Test rapid scrolling
    cy.measurePerformance(() => {
      for (let i = 0; i < 10; i++) {
        cy.get('.table-body').scrollTo(0, i * 1000, { duration: 50 })
        cy.wait(10)
      }
    })
  })

  it('should handle real-world enterprise scenarios', () => {
    // Simulate real enterprise data with complex structures
    const enterpriseData = Array.from({ length: 1000 }, (_, i) => ({
      id: `EMP-${String(i).padStart(6, '0')}`,
      name: `Employee ${i}`,
      email: `emp${i}@company.com`,
      department: {
        id: Math.floor(i / 10),
        name: `Department ${Math.floor(i / 10)}`,
        manager: `Manager ${Math.floor(i / 50)}`
      },
      salary: {
        base: 50000 + (i * 500),
        bonus: (i % 10) * 1000,
        currency: 'USD'
      },
      status: {
        employment: i % 2 === 0 ? 'active' : 'inactive',
        lastLogin: new Date(Date.now() - i * 86400000).toISOString()
      }
    }))

    const enterpriseColumns = [
      { 
        key: 'id', 
        label: '员工编号', 
        width: 120, 
        sortable: true,
        formatter: (value: string) => value.toUpperCase()
      },
      { 
        key: 'name', 
        label: '姓名', 
        width: 150, 
        sortable: true 
      },
      { 
        key: 'department.name', 
        label: '部门', 
        width: 150, 
        sortable: true 
      },
      { 
        key: 'salary.base', 
        label: '基本薪资', 
        width: 120, 
        sortable: true,
        formatter: (value: number) => `$${value.toLocaleString()}`
      },
      { 
        key: 'status.employment', 
        label: '状态', 
        width: 100,
        sortable: true
      }
    ]

    cy.mountComponent('AdvancedTable', {
      columns: enterpriseColumns,
      data: enterpriseData,
      virtualScroll: true,
      columnDraggable: true,
      keyboardNavigation: true
    })

    // Test complex data rendering
    cy.get('.layout-item').first().within(() => {
      cy.contains('EMP-000000').should('be.visible')
      cy.contains('Department 0').should('be.visible')
      cy.contains('$50,000').should('be.visible')
    })

    // Test sorting complex nested data
    cy.get('[data-column="salary.base"] .sort-indicator').click()
    cy.wait(500)

    // Verify sorted complex data
    cy.get('.layout-item').first().should('contain', '$50,000')

    // Test filtering capabilities if implemented
    // cy.get('.table-filter-input').type('Department 1')
    // cy.get('.layout-item').should('have.length.lessThan', 100)
  })
})