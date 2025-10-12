<template>
  <div class="cost-dashboard">
    <!-- 顶部统计卡片 -->
    <el-row
      :gutter="20"
      class="stats-row"
    >
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon compute">
              <el-icon><Cpu /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">
                月度成本
              </div>
              <div class="stat-value">
                ${{ formatCurrency(monthlyCost) }}
              </div>
              <div
                class="stat-trend"
                :class="costTrend"
              >
                {{ costTrendText }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon savings">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">
                潜在节省
              </div>
              <div class="stat-value">
                ${{ formatCurrency(potentialSavings) }}
              </div>
              <div class="stat-subtitle">
                {{ savingsPercentage }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon forecast">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">
                年度预测
              </div>
              <div class="stat-value">
                ${{ formatCurrency(annualForecast) }}
              </div>
              <div class="stat-subtitle">
                基于当前趋势
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon optimization">
              <el-icon><Setting /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">
                优化建议
              </div>
              <div class="stat-value">
                {{ recommendationCount }}
              </div>
              <div class="stat-subtitle">
                待实施
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 成本趋势图 -->
    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <span>📈 成本趋势分析</span>
          <el-date-picker
            v-model="trendDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="loadCostTrend"
          />
        </div>
      </template>
      <div
        ref="trendChartRef"
        class="chart-container"
      />
    </el-card>

    <!-- 成本分解饼图 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>🥧 成本构成分析</span>
          </template>
          <div
            ref="breakdownChartRef"
            class="chart-container-small"
          />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>☁️ 多云成本对比</span>
          </template>
          <div
            ref="comparisonChartRef"
            class="chart-container-small"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 成本优化建议 -->
    <el-card class="recommendations-card">
      <template #header>
        <div class="card-header">
          <span>💡 成本优化建议</span>
          <el-button
            type="primary"
            size="small"
            @click="generateRecommendations"
          >
            重新分析
          </el-button>
        </div>
      </template>

      <el-table
        v-if="recommendations.length > 0"
        :data="recommendations"
        stripe
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="recommendation-detail">
              <p><strong>详细说明：</strong>{{ row.description }}</p>
              <p><strong>当前配置：</strong>{{ row.currentValue }}</p>
              <p><strong>推荐配置：</strong>{{ row.recommendedValue }}</p>
              <p><strong>影响：</strong>{{ row.impact }}</p>
              <p><strong>实施难度：</strong>{{ row.implementationEffort }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="优先级"
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">
              {{ row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="category"
          label="分类"
          width="120"
        />
        <el-table-column
          prop="title"
          label="优化项"
        />
        <el-table-column
          label="月节省"
          width="120"
        >
          <template #default="{ row }">
            <span class="savings-amount">
              ${{ formatCurrency(row.potentialMonthlySavings) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="年节省"
          width="120"
        >
          <template #default="{ row }">
            <span class="savings-amount">
              ${{ formatCurrency(row.potentialMonthlySavings * 12) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="150"
        >
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              @click="applyRecommendation(row)"
            >
              应用
            </el-button>
            <el-button
              size="small"
              @click="viewDetails(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-else
        description="暂无优化建议"
      />
    </el-card>

    <!-- 服务成本明细 -->
    <el-card class="service-costs-card">
      <template #header>
        <span>📋 服务成本明细</span>
      </template>
      <el-table
        :data="serviceCosts"
        stripe
        show-summary
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="cost-breakdown">
              <el-descriptions
                :column="2"
                border
              >
                <el-descriptions-item
                  v-for="item in row.costBreakdown"
                  :key="item.category"
                  :label="item.category"
                >
                  <div>
                    <div>{{ item.description }}</div>
                    <div class="breakdown-cost">
                      ${{ formatCurrency(item.monthlyCost) }}/月
                    </div>
                  </div>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="serviceName"
          label="服务名称"
        />
        <el-table-column
          label="月成本"
          width="150"
        >
          <template #default="{ row }">
            ${{ formatCurrency(row.monthlyCost) }}
          </template>
        </el-table-column>
        <el-table-column
          label="年成本"
          width="150"
        >
          <template #default="{ row }">
            ${{ formatCurrency(row.annualCost) }}
          </template>
        </el-table-column>
        <el-table-column
          label="成本占比"
          width="120"
        >
          <template #default="{ row }">
            {{ ((row.monthlyCost / totalMonthlyCost) * 100).toFixed(1) }}%
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Cpu, TrendCharts, Calendar, Setting } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 数据模型
const monthlyCost = ref(5280.50)
const potentialSavings = ref(1840.30)
const annualForecast = ref(63366.00)
const recommendationCount = ref(6)
const costTrend = ref('up')
const costTrendText = ref('↑ 较上月+12.5%')

const trendDateRange = ref<Date[]>([
  new Date(Date.now() - 30 * 24 * 3600 * 1000),
  new Date()
])

// 计算属性
const savingsPercentage = computed(() => {
  return ((potentialSavings.value / monthlyCost.value) * 100).toFixed(1)
})

const totalMonthlyCost = computed(() => {
  return serviceCosts.value.reduce((sum, s) => sum + s.monthlyCost, 0)
})

// 优化建议
const recommendations = ref([
  {
    category: '资源优化',
    priority: '高',
    title: 'CPU资源过度配置',
    description: '平均CPU使用率仅28.5%，建议降低CPU配置',
    currentValue: '500m / 2000m',
    recommendedValue: '350m / 1400m',
    potentialMonthlySavings: 420.50,
    impact: '低',
    implementationEffort: '简单'
  },
  {
    category: '实例优化',
    priority: '高',
    title: '使用Spot实例',
    description: '对于非关键工作负载，使用Spot实例可节省70%成本',
    currentValue: '按需实例',
    recommendedValue: 'Spot实例（带故障转移）',
    potentialMonthlySavings: 850.00,
    impact: '中',
    implementationEffort: '中等'
  },
  {
    category: '承诺折扣',
    priority: '高',
    title: '购买预留实例',
    description: '对于稳定工作负载，购买1年预留实例可节省40%成本',
    currentValue: '按需计费',
    recommendedValue: '1年预留实例',
    potentialMonthlySavings: 380.20,
    impact: '无',
    implementationEffort: '简单'
  },
  {
    category: '存储优化',
    priority: '中',
    title: '存储层级优化',
    description: '将冷数据迁移到低成本存储层',
    currentValue: '高性能SSD',
    recommendedValue: '分层存储（热数据SSD + 冷数据HDD）',
    potentialMonthlySavings: 120.60,
    impact: '低',
    implementationEffort: '复杂'
  },
  {
    category: '网络优化',
    priority: '低',
    title: 'CDN缓存优化',
    description: '使用CDN缓存静态资源，减少出站流量',
    currentValue: '直接传输',
    recommendedValue: 'CDN缓存 + 压缩',
    potentialMonthlySavings: 69.00,
    impact: '低',
    implementationEffort: '中等'
  }
])

// 服务成本明细
const serviceCosts = ref([
  {
    serviceName: 'api-gateway',
    monthlyCost: 1280.50,
    annualCost: 15366.00,
    costBreakdown: [
      { category: '计算资源', description: '2 vCPU x 3副本 x 730小时', monthlyCost: 700.80 },
      { category: '内存资源', description: '4 GB x 3副本 x 730小时', monthlyCost: 363.36 },
      { category: '存储资源', description: '50 GB SSD', monthlyCost: 9.00 },
      { category: '网络流量', description: '300 GB出站流量', monthlyCost: 207.34 }
    ]
  },
  {
    serviceName: 'auth-service',
    monthlyCost: 980.00,
    annualCost: 11760.00,
    costBreakdown: [
      { category: '计算资源', description: '1 vCPU x 2副本 x 730小时', monthlyCost: 467.20 },
      { category: '内存资源', description: '2 GB x 2副本 x 730小时', monthlyCost: 241.12 },
      { category: '存储资源', description: '20 GB SSD', monthlyCost: 3.60 },
      { category: '网络流量', description: '200 GB出站流量', monthlyCost: 268.08 }
    ]
  },
  {
    serviceName: 'user-service',
    monthlyCost: 1520.00,
    annualCost: 18240.00,
    costBreakdown: [
      { category: '计算资源', description: '2 vCPU x 3副本 x 730小时', monthlyCost: 700.80 },
      { category: '内存资源', description: '4 GB x 3副本 x 730小时', monthlyCost: 363.36 },
      { category: '存储资源', description: '100 GB SSD', monthlyCost: 18.00 },
      { category: '网络流量', description: '500 GB出站流量', monthlyCost: 437.84 }
    ]
  },
  {
    serviceName: 'order-service',
    monthlyCost: 1500.00,
    annualCost: 18000.00,
    costBreakdown: [
      { category: '计算资源', description: '2 vCPU x 3副本 x 730小时', monthlyCost: 700.80 },
      { category: '内存资源', description: '4 GB x 3副本 x 730小时', monthlyCost: 363.36 },
      { category: '存储资源', description: '80 GB SSD', monthlyCost: 14.40 },
      { category: '网络流量', description: '480 GB出站流量', monthlyCost: 421.44 }
    ]
  }
])

// ECharts图表引用
const trendChartRef = ref<HTMLElement>()
const breakdownChartRef = ref<HTMLElement>()
const comparisonChartRef = ref<HTMLElement>()

let trendChart: echarts.ECharts | null = null
let breakdownChart: echarts.ECharts | null = null
let comparisonChart: echarts.ECharts | null = null

onMounted(() => {
  initTrendChart()
  initBreakdownChart()
  initComparisonChart()
})

// 初始化成本趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)

  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return `${date.getMonth() + 1}/${date.getDate()}`
  })

  const actualCosts = Array.from({ length: 30 }, () => 
    150 + Math.random() * 50
  )

  const forecastCosts = Array.from({ length: 7 }, (_, i) => 
    actualCosts[actualCosts.length - 1] + i * 2 + Math.random() * 10
  )

  const option: echarts.EChartsOption = {
    title: {
      text: '近30天成本趋势及未来7天预测',
      left: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0]
        return `${data.name}<br/>成本: $${data.value.toFixed(2)}`
      }
    },
    legend: {
      data: ['实际成本', '预测成本'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: [...dates, ...Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() + i + 1)
        return `${date.getMonth() + 1}/${date.getDate()}`
      })]
    },
    yAxis: {
      type: 'value',
      name: '成本 (USD)',
      axisLabel: {
        formatter: '${value}'
      }
    },
    series: [
      {
        name: '实际成本',
        type: 'line',
        data: actualCosts,
        smooth: true,
        lineStyle: {
          color: '#409EFF',
          width: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        }
      },
      {
        name: '预测成本',
        type: 'line',
        data: [...Array(30).fill(null), ...forecastCosts],
        smooth: true,
        lineStyle: {
          color: '#e6a23c',
          width: 2,
          type: 'dashed'
        }
      }
    ]
  }

  // ECharts类型系统过于严格，使用类型断言
  trendChart.setOption(option as any)

  window.addEventListener('resize', () => {
    trendChart?.resize()
  })
}

// 初始化成本分解饼图
const initBreakdownChart = () => {
  if (!breakdownChartRef.value) return

  breakdownChart = echarts.init(breakdownChartRef.value)

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: ${c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        name: '成本构成',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 2569.60, name: '计算资源', itemStyle: { color: '#5470c6' } },
          { value: 1331.20, name: '内存资源', itemStyle: { color: '#91cc75' } },
          { value: 45.00, name: '存储资源', itemStyle: { color: '#fac858' } },
          { value: 1334.70, name: '网络流量', itemStyle: { color: '#ee6666' } }
        ]
      }
    ]
  }

  // ECharts类型系统过于严格，使用类型断言
  breakdownChart.setOption(option as any)

  window.addEventListener('resize', () => {
    breakdownChart?.resize()
  })
}

// 初始化多云成本对比图
const initComparisonChart = () => {
  if (!comparisonChartRef.value) return

  comparisonChart = echarts.init(comparisonChartRef.value)

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const data = params[0]
        return `${data.name}<br/>月成本: $${data.value.toFixed(2)}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['Aliyun', 'GCP', 'AWS', 'Azure']
    },
    yAxis: {
      type: 'value',
      name: '月成本 (USD)',
      axisLabel: {
        formatter: '${value}'
      }
    },
    series: [
      {
        name: '月成本',
        type: 'bar',
        data: [
          { value: 3850.20, itemStyle: { color: '#67c23a' } }, // Aliyun - 最便宜
          { value: 4120.80, itemStyle: { color: '#91cc75' } }, // GCP
          { value: 4680.50, itemStyle: { color: '#e6a23c' } }, // AWS
          { value: 5280.50, itemStyle: { color: '#f56c6c' } }  // Azure - 最贵
        ],
        label: {
          show: true,
          position: 'top',
          formatter: '${c}'
        },
        barWidth: '60%'
      }
    ]
  }

  // ECharts类型系统过于严格，使用类型断言
  comparisonChart.setOption(option as any)

  window.addEventListener('resize', () => {
    comparisonChart?.resize()
  })
}

// 加载成本趋势
const loadCostTrend = () => {
  ElMessage.info('正在加载成本趋势数据...')
  // TODO: 调用后端API加载数据
  setTimeout(() => {
    initTrendChart()
    ElMessage.success('成本趋势数据加载成功')
  }, 500)
}

// 生成优化建议
const generateRecommendations = () => {
  ElMessage.info('正在分析成本优化建议...')
  // TODO: 调用后端API生成建议
  setTimeout(() => {
    ElMessage.success('优化建议生成完成')
  }, 1000)
}

// 应用优化建议
const applyRecommendation = (recommendation: any) => {
  ElMessage.success(`正在应用优化建议: ${recommendation.title}`)
  // TODO: 实现优化建议应用逻辑
}

// 查看详情
const viewDetails = (recommendation: any) => {
  ElMessage.info(`查看详情: ${recommendation.title}`)
  // TODO: 显示详情对话框
}

// 格式化货币
const formatCurrency = (value: number) => {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取优先级类型
const getPriorityType = (priority: string) => {
  const types: Record<string, any> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return types[priority] || 'info'
}
</script>

<style scoped lang="scss">
.cost-dashboard {
  padding: 20px;

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      height: 120px;

      .stat-content {
        display: flex;
        align-items: center;
        gap: 15px;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: white;

          &.compute {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          &.savings {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          &.forecast {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }

          &.optimization {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          }
        }

        .stat-info {
          flex: 1;

          .stat-label {
            font-size: 12px;
            color: #909399;
            margin-bottom: 5px;
          }

          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: #303133;
            line-height: 1.2;
          }

          .stat-subtitle,
          .stat-trend {
            font-size: 12px;
            color: #67c23a;
            margin-top: 5px;
          }

          .stat-trend.up {
            color: #f56c6c;
          }

          .stat-trend.down {
            color: #67c23a;
          }
        }
      }
    }
  }

  .chart-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-container {
      height: 400px;
      width: 100%;
    }

    .chart-container-small {
      height: 300px;
      width: 100%;
    }
  }

  .recommendations-card {
    margin-bottom: 20px;

    .recommendation-detail {
      padding: 15px;
      background: #f5f7fa;
      border-radius: 4px;

      p {
        margin: 10px 0;
        font-size: 14px;
        line-height: 1.6;

        strong {
          color: #303133;
        }
      }
    }

    .savings-amount {
      color: #67c23a;
      font-weight: 600;
    }
  }

  .service-costs-card {
    .cost-breakdown {
      padding: 15px;

      .breakdown-cost {
        color: #409EFF;
        font-weight: 600;
        margin-top: 5px;
      }
    }
  }
}
</style>

