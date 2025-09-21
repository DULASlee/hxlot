/**
 * Cypress Custom Commands for Advanced UI Component Testing
 * 阶段3高级UI组件库 - E2E测试支持命令
 */

// Component mounting helpers
Cypress.Commands.add('mountComponent', (component: any, props: any = {}, options: any = {}) => {
  return cy.mount(component, {
    props,
    ...options
  })
})

// Advanced Table specific commands
Cypress.Commands.add('testVirtualScrolling', (selector: string) => {
  cy.get(selector).within(() => {
    cy.get('.advanced-table').should('exist')
    cy.get('.layout-item').should('have.length.greaterThan', 0)
    
    // Test scrolling performance
    cy.get('.table-body').scrollTo(0, 1000, { duration: 500 })
    cy.wait(100)
    cy.get('.layout-item').should('be.visible')
    
    // Test back to top
    cy.get('.table-body').scrollTo(0, 0, { duration: 500 })
  })
})

// Advanced Form specific commands
Cypress.Commands.add('fillAdvancedForm', (formData: Record<string, any>) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`[data-field="${field}"]`).within(() => {
      if (typeof value === 'string') {
        cy.get('input, textarea').type(value)
      } else if (typeof value === 'boolean') {
        if (value) cy.get('input[type="checkbox"]').check()
        else cy.get('input[type="checkbox"]').uncheck()
      }
    })
  })
})

// Advanced Navigation specific commands
Cypress.Commands.add('testNavigationFlow', (navigationItems: string[]) => {
  navigationItems.forEach((itemId, index) => {
    cy.get(`[data-id="${itemId}"]`).click()
    cy.wait(100)
    
    if (index < navigationItems.length - 1) {
      cy.get(`[data-id="${itemId}"]`).should('have.class', 'is-active')
    }
  })
})

// Advanced Panel specific commands  
Cypress.Commands.add('testPanelAccordion', (panelIds: string[]) => {
  panelIds.forEach((panelId) => {
    cy.get(`[data-id="${panelId}"] .panel-toggle`).click()
    cy.wait(200)
    
    // Verify only one panel is expanded in accordion mode
    cy.get('.panel-expanded').should('have.length', 1)
    cy.get(`[data-id="${panelId}"]`).should('have.class', 'panel-expanded')
  })
})

// Performance testing commands
Cypress.Commands.add('measurePerformance', (action: () => void) => {
  const startTime = performance.now()
  
  action()
  
  cy.then(() => {
    const endTime = performance.now()
    const duration = endTime - startTime
    
    expect(duration).to.be.lessThan(1000) // Should complete within 1 second
    cy.log(`Performance: ${duration.toFixed(2)}ms`)
  })
})

// Accessibility testing commands
Cypress.Commands.add('testKeyboardNavigation', (selector: string) => {
  cy.get(selector).focus()
  
  // Test Tab navigation
  cy.focused().tab()
  cy.focused().should('be.visible')
  
  // Test arrow key navigation
  cy.focused().type('{downArrow}')
  cy.wait(50)
  cy.focused().type('{upArrow}')
  cy.wait(50)
  
  // Test Enter/Space activation
  cy.focused().type('{enter}')
  cy.wait(100)
})

Cypress.Commands.add('testAriaAttributes', (selector: string) => {
  cy.get(selector).within(() => {
    // Check for required ARIA attributes
    cy.get('[role]').should('exist')
    cy.get('[aria-label], [aria-labelledby]').should('exist')
    
    // Check for proper ARIA states
    cy.get('[aria-expanded]').each(($el) => {
      expect($el.attr('aria-expanded')).to.match(/^(true|false)$/)
    })
  })
})

// Drag and drop testing
Cypress.Commands.add('testDragAndDrop', (source: string, target: string) => {
  cy.get(source).trigger('mousedown', { button: 0 })
  cy.get(target).trigger('mousemove').trigger('mouseup')
  cy.wait(200)
})

// Responsive testing commands
Cypress.Commands.add('testResponsiveBreakpoints', (selector: string) => {
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1024, height: 768, name: 'desktop' },
    { width: 1440, height: 900, name: 'large' }
  ]
  
  viewports.forEach((viewport) => {
    cy.viewport(viewport.width, viewport.height)
    cy.wait(200)
    
    cy.get(selector).should('be.visible')
    cy.log(`Tested ${viewport.name} viewport: ${viewport.width}x${viewport.height}`)
  })
  
  // Reset to default viewport
  cy.viewport(1280, 720)
})

// Custom type declarations for TypeScript support
declare global {
  namespace Cypress {
    interface Chainable {
      mountComponent(component: any, props?: any, options?: any): Chainable<any>
      testVirtualScrolling(selector: string): Chainable<any>
      fillAdvancedForm(formData: Record<string, any>): Chainable<any>
      testNavigationFlow(navigationItems: string[]): Chainable<any>
      testPanelAccordion(panelIds: string[]): Chainable<any>
      measurePerformance(action: () => void): Chainable<any>
      testKeyboardNavigation(selector: string): Chainable<any>
      testAriaAttributes(selector: string): Chainable<any>
      testDragAndDrop(source: string, target: string): Chainable<any>
      testResponsiveBreakpoints(selector: string): Chainable<any>
    }
  }
}

export {}