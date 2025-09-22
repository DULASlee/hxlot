/**
 * AdvancedChart Component E2E Test Suite
 * 测试图表组件的实时更新、交互功能、数据可视化等完整用户交互流程
 */

import "../support/component-commands"

describe("AdvancedChart E2E Tests", () => {
  const mockLineChartData = {
    type: "line",
    data: {
      labels: ["1月", "2月", "3月", "4月", "5月", "6月"],
      datasets: [
        {
          label: "销售额",
          data: [12000, 19000, 3000, 5000, 2000, 15000],
          borderColor: "#409EFF",
          backgroundColor: "#409EFF20",
          tension: 0.4,
        },
        {
          label: "利润",
          data: [5000, 8000, 1500, 2000, 800, 6000],
          borderColor: "#67C23A",
          backgroundColor: "#67C23A20",
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      animation: true,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          enabled: true,
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "月份",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "金额 (元)",
          },
        },
      },
    },
  }

  const mockBarChartData = {
    type: "bar",
    data: {
      labels: ["产品A", "产品B", "产品C", "产品D", "产品E"],
      datasets: [
        {
          label: "2023年销量",
          data: [120, 190, 300, 250, 200],
          backgroundColor: "#409EFF",
        },
        {
          label: "2024年销量",
          data: [150, 220, 280, 300, 240],
          backgroundColor: "#67C23A",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        x: {
          beginAtZero: true,
        },
        y: {
          beginAtZero: true,
        },
      },
    },
  }

  const mockPieChartData = {
    type: "pie",
    data: {
      labels: ["技术部", "销售部", "市场部", "人事部", "财务部"],
      datasets: [
        {
          label: "员工分布",
          data: [45, 32, 28, 15, 12],
          backgroundColor: ["#409EFF", "#67C23A", "#E6A23C", "#F56C6C", "#909399"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "right",
        },
      },
    },
  }

  const mockRealTimeData = {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "CPU使用率",
          data: [],
          borderColor: "#F56C6C",
          backgroundColor: "#F56C6C20",
          tension: 0.4,
        },
        {
          label: "内存使用率",
          data: [],
          borderColor: "#409EFF",
          backgroundColor: "#409EFF20",
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      animation: false,
      scales: {
        x: {
          type: "time",
          time: {
            displayFormats: {
              second: "HH:mm:ss",
            },
          },
        },
        y: {
          min: 0,
          max: 100,
          title: {
            display: true,
            text: "使用率 (%)",
          },
        },
      },
    },
  }

  beforeEach(() => {
    cy.visit("/")
  })

  it("should render different chart types correctly", () => {
    // Test Line Chart
    cy.mountComponent("AdvancedChart", mockLineChartData)

    cy.get(".advanced-chart").should("exist")
    cy.get("canvas").should("be.visible")

    // Verify chart type
    cy.window().its("chartInstance.config.type").should("equal", "line")

    // Verify datasets
    cy.window().its("chartInstance.data.datasets").should("have.length", 2)

    // Test Bar Chart
    cy.mountComponent("AdvancedChart", mockBarChartData)
    cy.window().its("chartInstance.config.type").should("equal", "bar")

    // Test Pie Chart
    cy.mountComponent("AdvancedChart", mockPieChartData)
    cy.window().its("chartInstance.config.type").should("equal", "pie")
  })

  it("should handle chart interactions and tooltips", () => {
    cy.mountComponent("AdvancedChart", {
      ...mockLineChartData,
      interactive: true,
    })

    // Test hover interactions
    cy.get("canvas").trigger("mousemove", { x: 200, y: 150 })

    // Verify tooltip appears
    cy.get(".chartjs-tooltip").should("be.visible")
    cy.get(".chartjs-tooltip").should("contain", "销售额")

    // Test click interactions
    cy.get("canvas").click(200, 150)

    // Verify click event
    cy.window().its("lastChartClick").should("exist")
  })

  it("should support legend interactions", () => {
    cy.mountComponent("AdvancedChart", {
      ...mockLineChartData,
      legendClickable: true,
    })

    // Click on legend item to toggle dataset visibility
    cy.get(".chart-legend-item").first().click()

    // Verify dataset is hidden
    cy.window().then((win) => {
      const chartInstance = win.chartInstance
      expect(chartInstance.data.datasets[0].hidden).to.be.true
    })

    // Click again to show dataset
    cy.get(".chart-legend-item").first().click()

    cy.window().then((win) => {
      const chartInstance = win.chartInstance
      expect(chartInstance.data.datasets[0].hidden).to.be.false
    })
  })

  it("should handle real-time data updates", () => {
    cy.mountComponent("AdvancedChart", {
      ...mockRealTimeData,
      realTime: true,
      updateInterval: 1000,
      maxDataPoints: 20,
    })

    // Initial empty chart
    cy.window().its("chartInstance.data.labels").should("have.length", 0)

    // Wait for first data update
    cy.wait(1100)
    cy.window().its("chartInstance.data.labels").should("have.length.greaterThan", 0)

    // Wait for multiple updates
    cy.wait(2200)
    cy.window().its("chartInstance.data.labels").should("have.length.greaterThan", 2)

    // Verify data point limit
    cy.wait(25000) // Wait for enough updates to exceed maxDataPoints
    cy.window().its("chartInstance.data.labels").should("have.length", 20)
  })

  it("should support data filtering and zooming", () => {
    cy.mountComponent("AdvancedChart", {
      ...mockLineChartData,
      zoomable: true,
      filterable: true,
      plugins: ["zoom"],
    })

    // Test zoom functionality
    cy.get("canvas").trigger("wheel", { deltaY: -100, x: 300, y: 200 })

    // Verify zoom event
    cy.window().its("lastZoomEvent").should("exist")

    // Test date range filter
    cy.get(".chart-date-filter").should("be.visible")
    cy.get(".date-range-start").type("2024-01-01")
    cy.get(".date-range-end").type("2024-03-31")
    cy.get(".filter-apply-button").click()

    // Verify filtered data
    cy.window().then((win) => {
      const chartInstance = win.chartInstance
      expect(chartInstance.data.labels.length).to.be.lessThan(6)
    })

    // Reset zoom
    cy.get(".zoom-reset-button").click()
    cy.window().its("lastZoomReset").should("exist")
  })

  it("should handle data export functionality", () => {
    cy.mountComponent("AdvancedChart", {
      ...mockLineChartData,
      exportable: true,
      exportFormats: ["png", "svg", "pdf", "excel"],
    })

    // Test chart export menu
    cy.get(".chart-export-button").click()
    cy.get(".export-menu").should("be.visible")

    // Test PNG export
    cy.get('.export-option[data-format="png"]').click()
    cy.window().its("lastExport.format").should("equal", "png")

    // Test data export to Excel
    cy.get(".chart-export-button").click()
    cy.get('.export-option[data-format="excel"]').click()
    cy.window().its("lastDataExport.format").should("equal", "excel")
  })

  it("should support chart annotations and markers", () => {
    const chartWithAnnotations = {
      ...mockLineChartData,
      annotations: [
        {
          type: "line",
          mode: "vertical",
          value: "3月",
          borderColor: "#F56C6C",
          borderWidth: 2,
          label: {
            content: "重要节点",
            enabled: true,
            position: "top",
          },
        },
        {
          type: "box",
          xMin: "2月",
          xMax: "4月",
          yMin: 0,
          yMax: 10000,
          backgroundColor: "#E6A23C20",
          borderColor: "#E6A23C",
          label: {
            content: "关键时期",
            enabled: true,
          },
        },
      ],
    }

    cy.mountComponent("AdvancedChart", chartWithAnnotations)

    // Verify annotations are rendered
    cy.get("canvas").should("be.visible")

    // Check annotation interactions
    cy.get("canvas").trigger("mousemove", { x: 300, y: 200 })
    cy.get(".annotation-tooltip").should("be.visible")
  })

  it("should handle multiple chart synchronization", () => {
    const chartConfigs = [
      { ...mockLineChartData, chartId: "chart1" },
      { ...mockBarChartData, chartId: "chart2" },
    ]

    cy.mountComponent("AdvancedChart", {
      charts: chartConfigs,
      synchronized: true,
      syncMode: "hover",
    })

    // Hover on first chart
    cy.get('[data-chart-id="chart1"] canvas').trigger("mousemove", { x: 200, y: 150 })

    // Verify synchronization
    cy.get('[data-chart-id="chart2"] .sync-indicator').should("be.visible")

    // Test synchronized tooltips
    cy.get(".synchronized-tooltip").should("have.length", 2)
  })

  it("should be responsive and handle different screen sizes", () => {
    cy.mountComponent("AdvancedChart", {
      ...mockLineChartData,
      responsive: true,
      maintainAspectRatio: false,
    })

    cy.testResponsiveBreakpoints(".advanced-chart")

    // Test mobile-specific chart adaptations
    cy.viewport(375, 667)
    cy.wait(200)

    // Verify chart adapts to mobile
    cy.get(".advanced-chart").should("have.class", "mobile-chart")
    cy.get("canvas").should("have.attr", "width").and("not.equal", "0")

    // Test landscape orientation
    cy.viewport(667, 375)
    cy.wait(200)
    cy.get(".advanced-chart").should("have.class", "landscape-chart")
  })

  it("should pass accessibility standards", () => {
    cy.mountComponent("AdvancedChart", {
      ...mockLineChartData,
      accessible: true,
      altText: "销售数据趋势图，显示1-6月份的销售额和利润变化",
    })

    cy.testAriaAttributes(".advanced-chart")

    // Test chart accessibility features
    cy.get('[role="img"]').should("exist")
    cy.get("[aria-label]").should("contain", "销售数据趋势图")

    // Test keyboard navigation for interactive elements
    cy.get(".chart-legend-item").first().focus()
    cy.focused().type("{enter}")

    // Verify screen reader text
    cy.get(".sr-only").should("exist")
    cy.get(".chart-data-table").should("exist")
  })

  it("should handle error scenarios gracefully", () => {
    // Test with invalid data
    cy.mountComponent("AdvancedChart", {
      type: "line",
      data: null,
    })

    cy.get(".chart-error").should("be.visible")
    cy.get(".chart-error-message").should("contain", "图表数据格式错误")

    // Test with empty data
    cy.mountComponent("AdvancedChart", {
      type: "line",
      data: {
        labels: [],
        datasets: [],
      },
    })

    cy.get(".chart-empty").should("be.visible")
    cy.get(".chart-empty-message").should("contain", "暂无数据")

    // Test network error for remote data
    cy.intercept("GET", "/api/chart-data", { forceNetworkError: true })

    cy.mountComponent("AdvancedChart", {
      type: "line",
      dataSource: "/api/chart-data",
    })

    cy.get(".chart-network-error").should("be.visible")
    cy.get(".retry-button").should("be.visible")
  })

  it("should handle performance with large datasets", () => {
    const largeDataset = {
      type: "line",
      data: {
        labels: Array.from({ length: 10000 }, (_, i) => `Point ${i}`),
        datasets: [
          {
            label: "Large Dataset",
            data: Array.from({ length: 10000 }, () => Math.random() * 100),
            borderColor: "#409EFF",
            pointRadius: 0, // Disable points for performance
          },
        ],
      },
      options: {
        animation: false,
        parsing: false,
        interaction: {
          intersect: false,
        },
        plugins: {
          decimation: {
            enabled: true,
            algorithm: "lttb",
          },
        },
      },
    }

    cy.mountComponent("AdvancedChart", {
      ...largeDataset,
      optimized: true,
    })

    // Test rendering performance
    cy.measurePerformance(() => {
      cy.get(".advanced-chart").should("be.visible")
      cy.get("canvas").should("be.visible")
    })

    // Test interaction performance
    cy.measurePerformance(() => {
      cy.get("canvas").trigger("mousemove", { x: 300, y: 200 })
      cy.wait(50)
      cy.get("canvas").trigger("mousemove", { x: 400, y: 250 })
    })
  })

  it("should support advanced enterprise features", () => {
    const enterpriseChart = {
      type: "line",
      data: {
        labels: ["Q1 2023", "Q2 2023", "Q3 2023", "Q4 2023", "Q1 2024", "Q2 2024"],
        datasets: [
          {
            label: "实际收入",
            data: [1200000, 1350000, 1180000, 1650000, 1420000, 1580000],
            borderColor: "#409EFF",
            backgroundColor: "#409EFF20",
          },
          {
            label: "预算收入",
            data: [1250000, 1300000, 1200000, 1600000, 1400000, 1550000],
            borderColor: "#67C23A",
            backgroundColor: "#67C23A20",
            borderDash: [5, 5],
          },
          {
            label: "目标收入",
            data: [1300000, 1400000, 1250000, 1700000, 1500000, 1650000],
            borderColor: "#E6A23C",
            backgroundColor: "#E6A23C20",
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "季度收入对比分析",
          },
          legend: {
            position: "top",
          },
          annotation: {
            annotations: {
              target: {
                type: "line",
                yMin: 1500000,
                yMax: 1500000,
                borderColor: "#F56C6C",
                borderWidth: 2,
                borderDash: [10, 5],
                label: {
                  display: true,
                  content: "年度目标线",
                  position: "end",
                },
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function (value) {
                return (value / 1000000).toFixed(1) + "M"
              },
            },
          },
        },
      },
      drillDown: true,
      comparative: true,
      forecast: true,
    }

    cy.mountComponent("AdvancedChart", enterpriseChart)

    // Test drill-down functionality
    cy.get("canvas").click(200, 150)
    cy.get(".drill-down-modal").should("be.visible")
    cy.get(".drill-down-chart").should("exist")

    // Test comparative analysis
    cy.get(".comparative-toggle").click()
    cy.get(".comparative-panel").should("be.visible")
    cy.get(".variance-indicators").should("exist")

    // Test forecast extension
    cy.get(".forecast-toggle").click()
    cy.window().then((win) => {
      const chartInstance = win.chartInstance
      const forecastDataset = chartInstance.data.datasets.find((ds) => ds.label.includes("预测"))
      expect(forecastDataset).to.exist
    })

    // Test KPI dashboard integration
    cy.get(".kpi-summary").should("be.visible")
    cy.get(".kpi-card").should("have.length.greaterThan", 0)

    // Test advanced filtering
    cy.get(".advanced-filter-button").click()
    cy.get(".filter-panel").should("be.visible")

    cy.get(".department-filter").select("技术部")
    cy.get(".time-range-filter").select("last-12-months")
    cy.get(".apply-filters").click()

    // Verify filtered chart update
    cy.window().its("lastFilterApplied").should("exist")
  })

  it("should handle real-time collaboration features", () => {
    cy.mountComponent("AdvancedChart", {
      ...mockLineChartData,
      collaborative: true,
      roomId: "chart-room-123",
    })

    // Test real-time cursor sharing
    cy.get("canvas").trigger("mousemove", { x: 250, y: 180 })

    // Simulate another user's cursor
    cy.window().then((win) => {
      win.simulateRemoteCursor({ x: 300, y: 200, user: "User2" })
    })

    cy.get(".remote-cursor").should("be.visible")
    cy.get(".remote-cursor-label").should("contain", "User2")

    // Test collaborative annotations
    cy.get("canvas").rightclick(200, 150)
    cy.get(".annotation-menu").should("be.visible")
    cy.get(".add-annotation-button").click()

    cy.get(".annotation-editor").should("be.visible")
    cy.get(".annotation-text").type("关键数据点")
    cy.get(".save-annotation").click()

    // Verify annotation is shared
    cy.window().its("sharedAnnotations").should("have.length.greaterThan", 0)

    // Test live chat integration
    cy.get(".chart-chat-toggle").click()
    cy.get(".chart-chat-panel").should("be.visible")
    cy.get(".chat-input").type("这个数据趋势很有趣{enter}")

    cy.get(".chat-messages").should("contain", "这个数据趋势很有趣")
  })
})
