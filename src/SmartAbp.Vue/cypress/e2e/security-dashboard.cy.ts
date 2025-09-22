/**
 * Security Dashboard E2E Tests
 * Stage 6.1 End-to-End Integration Testing Framework
 *
 * Tests: Real-time alerts, permission monitoring, compliance checks,
 * behavior analysis, charts interaction, and full dashboard workflows
 */

describe("Security Dashboard - End-to-End Integration Tests", () => {
  beforeEach(() => {
    // Set up API intercepts for consistent testing
    cy.interceptSecurityAPIs()

    // Navigate to security dashboard with authentication
    cy.navigateToSecurityDashboard()
  })

  describe("Dashboard Initialization & Core Functionality", () => {
    it("should load security dashboard with all components", () => {
      cy.waitForDashboardLoad()

      // Verify main dashboard container
      cy.get(".security-dashboard").should("be.visible")
      cy.get(".dashboard-header").should("contain.text", "Security Analysis Dashboard")

      // Verify all API calls are completed
      cy.verifyAPICallsCompleted()

      // Verify all major sections are loaded
      cy.get(".security-overview").should("be.visible")
      cy.get(".risk-alerts-card").should("be.visible")
      cy.get(".charts-row").should("be.visible")
      cy.get('[data-testid="abnormal-behavior-table"]').should("be.visible")
      cy.get('[data-testid="compliance-status-monitor"]').should("be.visible")
    })

    it("should display security metrics correctly", () => {
      cy.verifySecurityMetrics()

      // Verify specific metric values from fixture
      cy.get('[data-testid="risk-events-card"] .value-text').should("contain", "12")
      cy.get('[data-testid="permission-changes-card"] .value-text').should("contain", "8")
      cy.get('[data-testid="abnormal-logins-card"] .value-text').should("contain", "3")
      cy.get('[data-testid="compliance-score-card"] .value-text').should("contain", "94")

      // Verify trend indicators
      cy.get('[data-testid="risk-events-card"] .trend-text').should("contain", "+5")
      cy.get('[data-testid="permission-changes-card"] .trend-text').should("contain", "-2")
    })

    it("should refresh metrics when refresh button is clicked", () => {
      cy.refreshSecurityMetrics()

      // Verify metrics are reloaded
      cy.wait("@getMetrics")
      cy.get('[data-testid="metrics-loading"]').should("not.exist")
    })
  })

  describe("Real-time Security Alerts", () => {
    it("should display existing security alerts", () => {
      cy.get(".risk-alerts-list").should("be.visible")
      cy.get(".alert-item").should("have.length", 4) // Based on fixture data

      // Verify alert details from fixture
      cy.get('[data-alert-id="alert-001"]').within(() => {
        cy.contains("High-risk permission access detected")
        cy.get(".alert-tag").should("contain", "High")
        cy.contains("John Doe")
      })

      cy.get('[data-alert-id="alert-002"]').within(() => {
        cy.contains("Access from unusual geographic location")
        cy.get(".alert-tag").should("contain", "Critical")
        cy.contains("Jane Smith")
      })
    })

    it("should handle alert acknowledgment", () => {
      // Acknowledge a specific alert
      cy.acknowledgeAlert("alert-001")

      // Verify API call was made
      cy.wait("@acknowledgeAlert")

      // Verify alert is marked as acknowledged
      cy.get('[data-alert-id="alert-001"]').should("have.class", "acknowledged")
      cy.get('[data-alert-id="alert-001"] .alert-actions').should("not.contain", "Acknowledge")
    })

    it("should simulate real-time alert reception", () => {
      // Get initial alert count
      cy.get(".alert-item").then(($alerts) => {
        const initialCount = $alerts.length

        // Simulate new alert
        cy.simulateSecurityAlert("HighRiskPermissionAccess")
        cy.wait(1000)

        // Verify new alert appears
        cy.get(".alert-item").should("have.length", initialCount + 1)
        cy.get('[aria-live="polite"]').should("not.be.empty")
      })
    })

    it("should handle alert investigation workflow", () => {
      cy.get('[data-alert-id="alert-001"]').within(() => {
        cy.get('[data-testid="investigate-button"]').click()
      })

      // Should navigate to investigation page
      cy.url().should("include", "/security/alerts/alert-001/investigate")
    })

    it("should display alert badge with unread count", () => {
      cy.get(".alert-badge").should("be.visible")

      // Count unacknowledged alerts from fixture (3 unacknowledged)
      cy.get(".alert-badge .el-badge__content").should("contain", "3")
    })
  })

  describe("Charts and Data Visualization", () => {
    it("should render permission access trend chart", () => {
      cy.testPermissionTrendChart()

      // Verify chart data points are rendered
      cy.get('[data-testid="permission-trend-chart"] canvas').should("be.visible")
      cy.get('[data-testid="chart-legend"]').should("be.visible")
    })

    it("should render risk level distribution chart", () => {
      cy.testRiskDistributionChart()

      // Verify legend items
      cy.get(".risk-legend .legend-item").should("have.length", 4)
      cy.get(".risk-legend").should("contain", "Low")
      cy.get(".risk-legend").should("contain", "Medium")
      cy.get(".risk-legend").should("contain", "High")
      cy.get(".risk-legend").should("contain", "Critical")
    })

    it("should handle chart interactions", () => {
      // Test permission trend chart interaction
      cy.get('[data-testid="permission-trend-chart"] canvas').click(200, 150)
      cy.wait(500)

      // Test risk distribution chart legend interaction
      cy.get(".risk-legend .legend-item").first().click()
      cy.wait(500)

      // Verify chart remains responsive
      cy.get('[data-testid="permission-trend-chart"]').should("be.visible")
      cy.get('[data-testid="risk-distribution-chart"]').should("be.visible")
    })
  })

  describe("Abnormal User Behavior Analysis", () => {
    it("should display abnormal behavior table", () => {
      cy.verifyAbnormalBehaviorTable()

      // Verify behavior entries from fixture
      cy.get('[data-behavior-id="behavior-001"]').within(() => {
        cy.contains("John Doe")
        cy.contains("UnusualHours")
        cy.contains("Access outside normal business hours")
        cy.get(".risk-level").should("contain", "Medium")
      })

      cy.get('[data-behavior-id="behavior-002"]').within(() => {
        cy.contains("Jane Smith")
        cy.contains("HighFrequency")
        cy.contains("45 in 1 hour")
        cy.get(".risk-level").should("contain", "High")
      })
    })

    it("should handle behavior investigation", () => {
      cy.investigateBehavior("behavior-001")

      // Verify navigation to investigation page
      cy.url().should("include", "/security/behaviors/behavior-001/investigate")
    })

    it("should filter behaviors by risk level", () => {
      // Test high-risk filter
      cy.get('[data-testid="risk-filter"]').select("High")
      cy.wait(500)

      cy.get(".behavior-table-row").each(($row) => {
        cy.wrap($row).find(".risk-level").should("contain", "High")
      })

      // Reset filter
      cy.get('[data-testid="risk-filter"]').select("All")
    })

    it("should handle user click navigation", () => {
      cy.get('[data-behavior-id="behavior-001"]').within(() => {
        cy.get('[data-testid="user-link"]').click()
      })

      // Should navigate to user profile
      cy.url().should("include", "/security/users/user-123")
    })
  })

  describe("Compliance Status Monitoring", () => {
    it("should display compliance status overview", () => {
      cy.verifyComplianceStatus()

      // Verify compliance score calculation
      cy.get(".compliance-card .status-score").should("not.be.empty")
      cy.get(".compliance-card .status-text").should("be.visible")

      // Verify statistics
      cy.get(".stat-item").should("have.length", 4)
      cy.get(".stat-value.critical").should("be.visible")
      cy.get(".stat-value.high").should("be.visible")
    })

    it("should display compliance issues list", () => {
      cy.get(".issues-list").should("be.visible")
      cy.get(".issue-item").should("have.length", 5) // Based on fixture data

      // Verify specific issues
      cy.get('[data-issue-id="compliance-001"]').within(() => {
        cy.contains("Data retention policy violation")
        cy.get(".el-tag").should("contain", "High")
        cy.get(".el-tag").should("contain", "Open")
      })

      cy.get('[data-issue-id="compliance-003"]').within(() => {
        cy.contains("Audit logging gaps detected")
        cy.get(".el-tag").should("contain", "Critical")
      })
    })

    it("should handle compliance issue resolution", () => {
      cy.resolveComplianceIssue("compliance-001")

      // Verify API call was made
      cy.wait("@resolveIssue")

      // Verify issue is marked as resolved
      cy.get('[data-issue-id="compliance-001"]').should("have.class", "resolved")
    })

    it("should toggle resolved issues visibility", () => {
      // Initially, resolved issues should be hidden
      cy.get('[data-issue-id="compliance-004"]').should("not.exist")

      // Show resolved issues
      cy.get('[data-testid="show-resolved-toggle"]').click()
      cy.wait(500)

      // Now resolved issues should be visible
      cy.get('[data-issue-id="compliance-004"]').should("be.visible")
      cy.get('[data-issue-id="compliance-004"]').should("have.class", "resolved")
    })
  })

  describe("Data Export Functionality", () => {
    it("should export data as PDF", () => {
      cy.testDataExport("pdf")

      // Verify export process completed
      cy.get('[data-testid="export-success"]').should("be.visible")
    })

    it("should export data as Excel", () => {
      cy.testDataExport("excel")

      // Verify export process completed
      cy.get('[data-testid="export-success"]').should("be.visible")
    })

    it("should export data as CSV", () => {
      cy.testDataExport("csv")

      // Verify export process completed
      cy.get('[data-testid="export-success"]').should("be.visible")
    })
  })

  describe("Performance and Memory Testing", () => {
    it("should load dashboard within performance thresholds", () => {
      cy.measureDashboardPerformance()

      // Performance is measured in the custom command
      // Dashboard should load within 3 seconds
    })

    it("should not have significant memory leaks", () => {
      cy.testMemoryUsage()

      // Memory usage increase should be reasonable
      // Specific thresholds are checked in the custom command
    })

    it("should handle multiple metric refreshes efficiently", () => {
      // Perform multiple refreshes
      for (let i = 0; i < 5; i++) {
        cy.refreshSecurityMetrics()
        cy.wait(1000)
      }

      // Dashboard should remain responsive
      cy.get(".security-dashboard").should("be.visible")
      cy.get('[data-testid="dashboard-loading"]').should("not.exist")
    })
  })

  describe("Error Handling and Resilience", () => {
    it("should handle API errors gracefully", () => {
      cy.testAPIErrorHandling()

      // Error states should be displayed
      cy.get('[data-testid="error-message"]').should("be.visible")
      cy.get('[data-testid="retry-button"]').should("be.visible")

      // User should be able to retry
      cy.get('[data-testid="retry-button"]').click()
    })

    it("should handle WebSocket connection failures", () => {
      // Simulate WebSocket disconnection
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent("websocket-disconnect"))
      })

      // Verify connection status updates
      cy.get('[data-testid="connection-status"]')
        .should("contain.text", "Disconnected")
        .or("contain.text", "Reconnecting")

      // Simulate reconnection
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent("websocket-connect"))
      })

      cy.get('[data-testid="connection-status"]').should("contain.text", "Connected")
    })

    it("should handle partial data loading failures", () => {
      // Simulate partial API failures
      cy.intercept("GET", "/api/security/behaviors", { statusCode: 500 }).as("behaviorsError")

      // Reload page
      cy.reload()
      cy.navigateToSecurityDashboard()

      // Other sections should still work
      cy.verifySecurityMetrics()
      cy.verifyComplianceStatus()

      // Failed section should show error state
      cy.get('[data-testid="behavior-error"]').should("be.visible")
    })
  })

  describe("Accessibility and Usability", () => {
    it("should meet accessibility standards", () => {
      cy.testSecurityDashboardAccessibility()

      // ARIA attributes should be properly set
      cy.get('[aria-live="polite"]').should("exist")
      cy.get('[role="alert"]').should("exist")

      // All interactive elements should be keyboard accessible
      cy.get('button, [tabindex="0"]').each(($el) => {
        cy.wrap($el).should("be.visible")
      })
    })

    it("should support keyboard navigation", () => {
      // Test tab navigation through dashboard
      cy.get("body").tab()
      cy.focused().should("be.visible")

      // Navigate through alert items
      cy.get(".alert-item").first().focus()
      cy.focused().type("{downArrow}")
      cy.focused().should("not.be", ".alert-item:first")

      // Test enter/space activation
      cy.get('[data-testid="refresh-metrics-button"]').focus()
      cy.focused().type("{enter}")
      cy.wait("@getMetrics")
    })
  })

  describe("Mobile Responsive Design", () => {
    it("should adapt to mobile viewport", () => {
      cy.testMobileSecurityDashboard()

      // Verify mobile-specific elements
      cy.get(".security-dashboard").should("have.class", "mobile-layout")
      cy.get('[data-testid="mobile-menu-toggle"]').should("be.visible")

      // Test mobile navigation
      cy.get('[data-testid="mobile-menu-toggle"]').click()
      cy.get(".mobile-menu").should("be.visible")
    })

    it("should maintain functionality on tablet viewport", () => {
      cy.viewport("ipad-2")
      cy.navigateToSecurityDashboard()

      // Verify tablet layout
      cy.get(".security-dashboard").should("have.class", "tablet-layout")

      // All major functionality should work
      cy.verifySecurityMetrics()
      cy.testPermissionTrendChart()
      cy.verifyComplianceStatus()
    })
  })

  describe("Real-time Updates and WebSocket Integration", () => {
    it("should establish WebSocket connection for real-time updates", () => {
      cy.waitForRealTimeConnection()

      // Verify connection status
      cy.get('[data-testid="connection-status"]').should("contain.text", "Connected")
    })

    it("should receive and display real-time metric updates", () => {
      cy.waitForRealTimeConnection()

      // Simulate metric update via WebSocket
      cy.window().then((win) => {
        win.dispatchEvent(
          new CustomEvent("metric-update", {
            detail: {
              todayRiskEvents: 15,
              complianceScore: 96,
            },
          }),
        )
      })

      cy.wait(1000)

      // Verify metrics updated
      cy.get('[data-testid="risk-events-card"] .value-text').should("contain", "15")
      cy.get('[data-testid="compliance-score-card"] .value-text').should("contain", "96")
    })

    it("should handle real-time alert notifications", () => {
      cy.waitForRealTimeConnection()

      // Get initial unread count
      cy.get(".alert-badge .el-badge__content").then(($badge) => {
        const initialCount = parseInt($badge.text())

        // Simulate new alert via WebSocket
        cy.simulateSecurityAlert("SuspiciousActivity")
        cy.wait(1000)

        // Verify unread count increased
        cy.get(".alert-badge .el-badge__content").should("contain", (initialCount + 1).toString())

        // Verify screen reader announcement
        cy.get('[aria-live="polite"]').should("contain.text", "New")
      })
    })
  })

  describe("Integration with Permission System", () => {
    it("should respect user role permissions", () => {
      // Test with admin role
      cy.login("admin", "admin123")
      cy.navigateToSecurityDashboard()

      // Admin should see all features
      cy.get('[data-testid="export-data-button"]').should("be.visible")
      cy.get('[data-testid="resolve-issue-button"]').should("be.visible")
      cy.get('[data-testid="acknowledge-alert-button"]').should("be.visible")
    })

    it("should restrict features for limited roles", () => {
      // Test with read-only role
      cy.login("viewer", "viewer123")
      cy.navigateToSecurityDashboard()

      // Viewer should have limited access
      cy.get('[data-testid="export-data-button"]').should("not.exist")
      cy.get('[data-testid="resolve-issue-button"]').should("not.exist")
      cy.get('[data-testid="acknowledge-alert-button"]').should("not.exist")

      // But should still see data
      cy.verifySecurityMetrics()
      cy.verifyComplianceStatus()
    })
  })
})
