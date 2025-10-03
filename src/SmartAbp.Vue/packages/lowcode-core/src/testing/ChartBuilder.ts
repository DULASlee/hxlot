/**
 * 🔥 图表构建器
 * 
 * 功能：
 * 1. 生成性能图表数据
 * 2. 支持多种图表类型
 * 3. 生成Chart.js配置
 * 4. 响应时间趋势图
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import { getGlobalLogger } from '@smartabp/lowcode-shared'

const logger = getGlobalLogger()

/**
 * 图表类型
 */
export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'radar'

/**
 * 图表数据点
 */
export interface ChartDataPoint {
  x: number | string
  y: number
}

/**
 * 图表数据集
 */
export interface ChartDataset {
  label: string
  data: ChartDataPoint[] | number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
  fill?: boolean
  tension?: number
}

/**
 * Chart.js配置
 */
export interface ChartConfig {
  type: ChartType
  data: {
    labels: string[]
    datasets: ChartDataset[]
  }
  options: {
    responsive: boolean
    plugins: {
      title: {
        display: boolean
        text: string
      }
      legend: {
        display: boolean
      }
    }
    scales?: any
  }
}

/**
 * 图表构建器
 */
export class ChartBuilder {
  private readonly colors = {
    primary: 'rgba(54, 162, 235, 0.8)',
    success: 'rgba(75, 192, 192, 0.8)',
    warning: 'rgba(255, 206, 86, 0.8)',
    danger: 'rgba(255, 99, 132, 0.8)',
    info: 'rgba(153, 102, 255, 0.8)',
    secondary: 'rgba(201, 203, 207, 0.8)'
  }

  /**
   * 构建响应时间趋势图
   */
  buildResponseTimeTrendChart(
    labels: string[],
    avgTimes: number[],
    p95Times: number[],
    p99Times: number[]
  ): ChartConfig {
    return {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '平均响应时间',
            data: avgTimes,
            borderColor: this.colors.primary,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'P95响应时间',
            data: p95Times,
            borderColor: this.colors.warning,
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'P99响应时间',
            data: p99Times,
            borderColor: this.colors.danger,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '响应时间趋势'
          },
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: '响应时间 (ms)'
            }
          }
        }
      }
    }
  }

  /**
   * 构建吞吐量对比图
   */
  buildThroughputComparisonChart(
    labels: string[],
    throughputs: number[]
  ): ChartConfig {
    return {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: '吞吐量 (请求/秒)',
            data: throughputs,
            backgroundColor: this.colors.success,
            borderColor: this.colors.success,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '吞吐量对比'
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: '请求/秒'
            }
          }
        }
      }
    }
  }

  /**
   * 构建成功率饼图
   */
  buildSuccessRatePieChart(
    successCount: number,
    failureCount: number
  ): ChartConfig {
    return {
      type: 'pie',
      data: {
        labels: ['成功', '失败'],
        datasets: [
          {
            label: '请求分布',
            data: [successCount, failureCount],
            backgroundColor: [this.colors.success, this.colors.danger],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '请求成功率'
          },
          legend: {
            display: true
          }
        }
      }
    }
  }

  /**
   * 构建并发性能雷达图
   */
  buildConcurrencyRadarChart(
    avgResponseTime: number,
    p95ResponseTime: number,
    throughput: number,
    successRate: number,
    concurrency: number
  ): ChartConfig {
    // 归一化数据到0-100范围
    const normalizedData = [
      this.normalizeValue(avgResponseTime, 0, 1000, true), // 响应时间越低越好
      this.normalizeValue(p95ResponseTime, 0, 2000, true),
      this.normalizeValue(throughput, 0, 1000, false), // 吞吐量越高越好
      this.normalizeValue(successRate, 0, 100, false),
      this.normalizeValue(concurrency, 0, 1000, false)
    ]

    return {
      type: 'radar',
      data: {
        labels: ['平均响应时间', 'P95响应时间', '吞吐量', '成功率', '并发能力'],
        datasets: [
          {
            label: '性能指标',
            data: normalizedData,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: this.colors.primary,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '综合性能雷达图'
          },
          legend: {
            display: false
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    }
  }

  /**
   * 构建响应时间分布柱状图
   */
  buildResponseTimeDistributionChart(
    buckets: Array<{ range: string; count: number }>
  ): ChartConfig {
    const labels = buckets.map(b => b.range)
    const data = buckets.map(b => b.count)

    return {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: '请求数量',
            data,
            backgroundColor: this.colors.info,
            borderColor: this.colors.info,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '响应时间分布'
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: '请求数量'
            }
          },
          x: {
            title: {
              display: true,
              text: '响应时间范围 (ms)'
            }
          }
        }
      }
    }
  }

  /**
   * 构建错误类型分布图
   */
  buildErrorDistributionChart(
    errorDistribution: Record<string, number>
  ): ChartConfig {
    const labels = Object.keys(errorDistribution)
    const data = Object.values(errorDistribution)
    const colors = this.generateColors(labels.length)

    return {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            label: '错误数量',
            data,
            backgroundColor: colors,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '错误类型分布'
          },
          legend: {
            display: true
          }
        }
      }
    }
  }

  /**
   * 归一化值到指定范围
   * @param value 原始值
   * @param min 最小值
   * @param max 最大值
   * @param inverse 是否反转（越小越好）
   */
  private normalizeValue(
    value: number,
    min: number,
    max: number,
    inverse: boolean = false
  ): number {
    const normalized = Math.min(Math.max((value - min) / (max - min), 0), 1) * 100
    return inverse ? 100 - normalized : normalized
  }

  /**
   * 生成颜色数组
   */
  private generateColors(count: number): string[] {
    const baseColors = Object.values(this.colors)
    const colors: string[] = []
    
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length])
    }
    
    return colors
  }

  /**
   * 将Chart.js配置转换为JSON字符串
   */
  toJson(config: ChartConfig): string {
    return JSON.stringify(config, null, 2)
  }

  /**
   * 生成Chart.js HTML嵌入代码
   */
  generateChartHtml(config: ChartConfig, canvasId: string): string {
    return `
<canvas id="${canvasId}"></canvas>
<script>
  const ctx${canvasId} = document.getElementById('${canvasId}').getContext('2d');
  new Chart(ctx${canvasId}, ${this.toJson(config)});
</script>
    `.trim()
  }
}
