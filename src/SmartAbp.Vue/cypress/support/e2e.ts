/**
 * Cypress E2E Support Commands for Security Dashboard & Permission System Integration Testing
 * Stage 6.1 TDD Implementation - End-to-End Integration Testing Framework
 */

// Import commands for component testing
import "./component-commands"

// Authentication & Login Commands
Cypress.Commands.add("login", (username: string = "admin", password: string = "admin123") => {
  cy.session([username, password], () => {
    cy.visit("/login")
    cy.get('[data-testid="username-input"]').type(username)
    cy.get('[data-testid="password-input"]').type(password)
    cy.get('[data-testid="login-button"]').click()

    // Wait for successful login and redirect
    cy.url().should("not.include", "/login")
    cy.get('[data-testid="user-menu"]').should("be.visible")
  })
})

Cypress.Commands.add("logout", () => {
  cy.get('[data-testid="user-menu"]').click()
  cy.get('[data-testid="logout-button"]').click()
  cy.url().should("include", "/login")
})

// Security Dashboard Navigation Commands
Cypress.Commands.add("navigateToSecurityDashboard", () => {
  cy.login()
  cy.visit("/security/dashboard")
  cy.get(".security-dashboard").should("be.visible")
  cy.get('[data-testid="dashboard-loading"]').should("not.exist")
})

Cypress.Commands.add("waitForDashboardLoad", () => {
  cy.get(".security-dashboard").should("be.visible")
  cy.get('[data-testid="dashboard-loading"]').should("not.exist")
  cy.get(".security-overview").should("be.visible")
})

// Real-time Alert Testing Commands
Cypress.Commands.add("waitForRealTimeConnection", () => {
  cy.get('[data-testid="connection-status"]')
    .should("contain.text", "Connected")
    .or("contain.text", "Connecting")

  // Wait for WebSocket connection to be established
  cy.wait(2000)
})

Cypress.Commands.add("simulateSecurityAlert", (alertType: string = "HighRiskPermissionAccess") => {
  // Simulate receiving a real-time security alert
  cy.window().then((win) => {
    win.dispatchEvent(
      new CustomEvent("security-alert", {
        detail: {
          id: `alert-${Date.now()}`,
          type: alertType,
          severity: "High",
          description: `Simulated ${alertType} alert for testing`,
          timestamp: new Date(),
          userInfo: { displayName: "Test User" },
          isAcknowledged: false,
        },
      }),
    )
  })
})

Cypress.Commands.add("acknowledgeAlert", (alertId: string) => {
  cy.get(`[data-alert-id="${alertId}"]`).within(() => {
    cy.get('[data-testid="acknowledge-button"]').click()
  })
  cy.get(`[data-alert-id="${alertId}"]`).should("have.class", "acknowledged")
})

// Security Metrics Testing Commands
Cypress.Commands.add("verifySecurityMetrics", () => {
  cy.get('[data-testid="risk-events-card"]').should("be.visible")
  cy.get('[data-testid="permission-changes-card"]').should("be.visible")
  cy.get('[data-testid="abnormal-logins-card"]').should("be.visible")
  cy.get('[data-testid="compliance-score-card"]').should("be.visible")

  // Verify metric values are loaded
  cy.get('[data-testid="risk-events-card"] .value-text').should("not.be.empty")
  cy.get('[data-testid="compliance-score-card"] .value-text').should("not.be.empty")
})

Cypress.Commands.add("refreshSecurityMetrics", () => {
  cy.get('[data-testid="refresh-metrics-button"]').click()
  cy.get('[data-testid="metrics-loading"]').should("be.visible")
  cy.get('[data-testid="metrics-loading"]').should("not.exist")
})

// Chart Interaction Commands
Cypress.Commands.add("testPermissionTrendChart", () => {
  cy.get('[data-testid="permission-trend-chart"]').should("be.visible")
  cy.get('[data-testid="permission-trend-chart"] canvas').should("be.visible")

  // Test chart interactions
  cy.get('[data-testid="permission-trend-chart"] canvas').click(200, 150)
  cy.wait(500)
})

Cypress.Commands.add("testRiskDistributionChart", () => {
  cy.get('[data-testid="risk-distribution-chart"]').should("be.visible")
  cy.get('[data-testid="risk-distribution-chart"] canvas').should("be.visible")

  // Test chart legend
  cy.get(".risk-legend .legend-item").should("have.length.greaterThan", 0)
  cy.get(".risk-legend .legend-item").first().click()
})

// Permission System Commands
Cypress.Commands.add("switchUserRole", (role: string) => {
  cy.get('[data-testid="user-menu"]').click()
  cy.get('[data-testid="switch-role"]').click()
  cy.get(`[data-role="${role}"]`).click()
  cy.get('[data-testid="confirm-role-switch"]').click()

  // Wait for role switch to take effect
  cy.wait(1000)
})

Cypress.Commands.add(
  "verifyPermissionAccess",
  (permission: string, shouldHaveAccess: boolean = true) => {
    cy.get(`[data-permission="${permission}"]`).should(
      shouldHaveAccess ? "be.visible" : "not.exist",
    )
  },
)

Cypress.Commands.add("testRoleBasedAccess", (role: string, expectedPermissions: string[]) => {
  cy.switchUserRole(role)

  expectedPermissions.forEach((permission) => {
    cy.verifyPermissionAccess(permission, true)
  })
})

// Compliance Testing Commands
Cypress.Commands.add("verifyComplianceStatus", () => {
  cy.get('[data-testid="compliance-status-monitor"]').should("be.visible")
  cy.get(".compliance-card").should("be.visible")
  cy.get(".compliance-card .status-score").should("not.be.empty")
})

Cypress.Commands.add("resolveComplianceIssue", (issueId: string) => {
  cy.get(`[data-issue-id="${issueId}"]`).within(() => {
    cy.get('[data-testid="resolve-issue-button"]').click()
  })
  cy.get('[data-testid="confirm-resolve"]').click()
  cy.get(`[data-issue-id="${issueId}"]`).should("have.class", "resolved")
})

// Abnormal Behavior Testing Commands
Cypress.Commands.add("verifyAbnormalBehaviorTable", () => {
  cy.get('[data-testid="abnormal-behavior-table"]').should("be.visible")
  cy.get(".behavior-table-row").should("have.length.greaterThan", 0)
})

Cypress.Commands.add("investigateBehavior", (behaviorId: string) => {
  cy.get(`[data-behavior-id="${behaviorId}"]`).within(() => {
    cy.get('[data-testid="investigate-button"]').click()
  })

  // Should navigate to investigation page
  cy.url().should("include", `/security/behaviors/${behaviorId}/investigate`)
})

// API Integration Testing Commands
Cypress.Commands.add("interceptSecurityAPIs", () => {
  cy.intercept("GET", "/api/security/dashboard/metrics", { fixture: "security-metrics.json" }).as(
    "getMetrics",
  )
  cy.intercept("GET", "/api/security/alerts", { fixture: "security-alerts.json" }).as("getAlerts")
  cy.intercept("GET", "/api/security/compliance", { fixture: "compliance-data.json" }).as(
    "getCompliance",
  )
  cy.intercept("GET", "/api/security/behaviors", { fixture: "abnormal-behaviors.json" }).as(
    "getBehaviors",
  )
  cy.intercept("POST", "/api/security/alerts/*/acknowledge", { success: true }).as(
    "acknowledgeAlert",
  )
  cy.intercept("POST", "/api/security/compliance/*/resolve", { success: true }).as("resolveIssue")
})

Cypress.Commands.add("verifyAPICallsCompleted", () => {
  cy.wait("@getMetrics")
  cy.wait("@getAlerts")
  cy.wait("@getCompliance")
  cy.wait("@getBehaviors")
})

// Export Data Testing Commands
Cypress.Commands.add("testDataExport", (format: "pdf" | "excel" | "csv") => {
  cy.get('[data-testid="export-data-button"]').click()
  cy.get(`[data-export-format="${format}"]`).click()

  // Verify download initiation
  cy.get('[data-testid="export-loading"]').should("be.visible")
  cy.get('[data-testid="export-loading"]').should("not.exist", { timeout: 10000 })
})

// Performance Testing Commands
Cypress.Commands.add("measureDashboardPerformance", () => {
  cy.window().then((win) => {
    const startTime = win.performance.now()

    cy.navigateToSecurityDashboard()
    cy.waitForDashboardLoad()

    cy.window().then((win) => {
      const endTime = win.performance.now()
      const loadTime = endTime - startTime

      expect(loadTime).to.be.lessThan(3000) // Dashboard should load within 3 seconds
      cy.log(`Dashboard Load Time: ${loadTime.toFixed(2)}ms`)
    })
  })
})

// Memory Leak Testing Commands
Cypress.Commands.add("testMemoryUsage", () => {
  cy.window().then((win) => {
    if ("memory" in win.performance) {
      const memory = (win.performance as any).memory
      const initialMemory = memory.usedJSHeapSize

      // Perform actions that might cause memory leaks
      cy.refreshSecurityMetrics()
      cy.simulateSecurityAlert()
      cy.wait(2000)

      cy.window().then((win) => {
        const memory = (win.performance as any).memory
        const finalMemory = memory.usedJSHeapSize
        const memoryIncrease = finalMemory - initialMemory

        // Memory increase should be reasonable (less than 10MB)
        expect(memoryIncrease).to.be.lessThan(10 * 1024 * 1024)
        cy.log(`Memory Usage Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`)
      })
    }
  })
})

// Error Handling Testing Commands
Cypress.Commands.add("testAPIErrorHandling", () => {
  // Simulate API failures
  cy.intercept("GET", "/api/security/dashboard/metrics", { statusCode: 500 }).as("metricsError")
  cy.intercept("GET", "/api/security/alerts", { statusCode: 404 }).as("alertsError")

  cy.navigateToSecurityDashboard()

  // Verify error states are displayed properly
  cy.get('[data-testid="error-message"]').should("be.visible")
  cy.get('[data-testid="retry-button"]').should("be.visible")
})

// Accessibility Testing Commands
Cypress.Commands.add("testSecurityDashboardAccessibility", () => {
  cy.navigateToSecurityDashboard()

  // Test keyboard navigation
  cy.get("body").tab()
  cy.focused().should("be.visible")

  // Test ARIA attributes
  cy.get('[aria-live="polite"]').should("exist") // For alert announcements
  cy.get('[role="alert"]').should("exist") // For error messages
  cy.get("[aria-label], [aria-labelledby]").should("have.length.greaterThan", 0)

  // Test screen reader announcements
  cy.get('[aria-live="polite"]').should("not.be.empty")
})

// Mobile Responsive Testing Commands
Cypress.Commands.add("testMobileSecurityDashboard", () => {
  cy.viewport("iphone-x")
  cy.navigateToSecurityDashboard()

  // Verify mobile layout
  cy.get(".security-dashboard").should("have.class", "mobile-layout")
  cy.get(".dashboard-header").should("be.visible")
  cy.get(".security-overview").should("be.visible")

  // Test mobile navigation
  cy.get('[data-testid="mobile-menu-toggle"]').click()
  cy.get(".mobile-menu").should("be.visible")
})

// Custom Type Declarations for TypeScript Support
declare global {
  namespace Cypress {
    interface Chainable {
      // Authentication Commands
      login(username?: string, password?: string): Chainable<any>
      logout(): Chainable<any>

      // Navigation Commands
      navigateToSecurityDashboard(): Chainable<any>
      waitForDashboardLoad(): Chainable<any>

      // Real-time Alert Commands
      waitForRealTimeConnection(): Chainable<any>
      simulateSecurityAlert(alertType?: string): Chainable<any>
      acknowledgeAlert(alertId: string): Chainable<any>

      // Security Metrics Commands
      verifySecurityMetrics(): Chainable<any>
      refreshSecurityMetrics(): Chainable<any>

      // Chart Testing Commands
      testPermissionTrendChart(): Chainable<any>
      testRiskDistributionChart(): Chainable<any>

      // Permission System Commands
      switchUserRole(role: string): Chainable<any>
      verifyPermissionAccess(permission: string, shouldHaveAccess?: boolean): Chainable<any>
      testRoleBasedAccess(role: string, expectedPermissions: string[]): Chainable<any>

      // Compliance Commands
      verifyComplianceStatus(): Chainable<any>
      resolveComplianceIssue(issueId: string): Chainable<any>

      // Behavior Analysis Commands
      verifyAbnormalBehaviorTable(): Chainable<any>
      investigateBehavior(behaviorId: string): Chainable<any>

      // API Integration Commands
      interceptSecurityAPIs(): Chainable<any>
      verifyAPICallsCompleted(): Chainable<any>

      // Export Commands
      testDataExport(format: "pdf" | "excel" | "csv"): Chainable<any>

      // Performance Commands
      measureDashboardPerformance(): Chainable<any>
      testMemoryUsage(): Chainable<any>

      // Error Handling Commands
      testAPIErrorHandling(): Chainable<any>

      // Accessibility Commands
      testSecurityDashboardAccessibility(): Chainable<any>

      // Mobile Testing Commands
      testMobileSecurityDashboard(): Chainable<any>
    }
  }
}

export {}
