<template>
  <div class="core-web-vitals-panel">
    <el-row :gutter="20">
      <!-- FCP - First Contentful Paint -->
      <el-col
        :xs="24"
        :sm="12"
        :lg="6"
      >
        <div
          class="metric-card"
          :class="getMetricClass('fcp', cwv.fcp)"
        >
          <div class="metric-icon">
            <i class="fas fa-rocket" />
          </div>
          <div class="metric-content">
            <div class="metric-value">
              {{ formatValue(cwv.fcp) }}
            </div>
            <div class="metric-label">
              FCP - 首次内容绘制
            </div>
            <div class="metric-desc">
              用户看到内容的时间
            </div>
            <el-progress 
              :percentage="getProgress('fcp', cwv.fcp)" 
              :color="getProgressColor('fcp', cwv.fcp)"
              :show-text="false"
            />
            <div class="metric-threshold">
              <span>优秀: &lt;1.8s</span>
              <span>需改进: &lt;3s</span>
            </div>
          </div>
        </div>
      </el-col>

      <!-- LCP - Largest Contentful Paint -->
      <el-col
        :xs="24"
        :sm="12"
        :lg="6"
      >
        <div
          class="metric-card"
          :class="getMetricClass('lcp', cwv.lcp)"
        >
          <div class="metric-icon">
            <i class="fas fa-image" />
          </div>
          <div class="metric-content">
            <div class="metric-value">
              {{ formatValue(cwv.lcp) }}
            </div>
            <div class="metric-label">
              LCP - 最大内容绘制
            </div>
            <div class="metric-desc">
              主要内容加载时间
            </div>
            <el-progress 
              :percentage="getProgress('lcp', cwv.lcp)" 
              :color="getProgressColor('lcp', cwv.lcp)"
              :show-text="false"
            />
            <div class="metric-threshold">
              <span>优秀: &lt;2.5s</span>
              <span>需改进: &lt;4s</span>
            </div>
          </div>
        </div>
      </el-col>

      <!-- FID - First Input Delay -->
      <el-col
        :xs="24"
        :sm="12"
        :lg="6"
      >
        <div
          class="metric-card"
          :class="getMetricClass('fid', cwv.fid)"
        >
          <div class="metric-icon">
            <i class="fas fa-hand-pointer" />
          </div>
          <div class="metric-content">
            <div class="metric-value">
              {{ formatValue(cwv.fid) }}
            </div>
            <div class="metric-label">
              FID - 首次输入延迟
            </div>
            <div class="metric-desc">
              交互响应速度
            </div>
            <el-progress 
              :percentage="getProgress('fid', cwv.fid)" 
              :color="getProgressColor('fid', cwv.fid)"
              :show-text="false"
            />
            <div class="metric-threshold">
              <span>优秀: &lt;100ms</span>
              <span>需改进: &lt;300ms</span>
            </div>
          </div>
        </div>
      </el-col>

      <!-- CLS - Cumulative Layout Shift -->
      <el-col
        :xs="24"
        :sm="12"
        :lg="6"
      >
        <div
          class="metric-card"
          :class="getMetricClass('cls', cwv.cls)"
        >
          <div class="metric-icon">
            <i class="fas fa-th" />
          </div>
          <div class="metric-content">
            <div class="metric-value">
              {{ cwv.cls?.toFixed(3) || '-' }}
            </div>
            <div class="metric-label">
              CLS - 累积布局偏移
            </div>
            <div class="metric-desc">
              视觉稳定性
            </div>
            <el-progress 
              :percentage="getProgress('cls', cwv.cls)" 
              :color="getProgressColor('cls', cwv.cls)"
              :show-text="false"
            />
            <div class="metric-threshold">
              <span>优秀: &lt;0.1</span>
              <span>需改进: &lt;0.25</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 详细说明 -->
    <el-card
      class="info-card"
      shadow="never"
    >
      <template #header>
        <div class="info-header">
          <i class="fas fa-info-circle" />
          <span>Core Web Vitals 说明</span>
        </div>
      </template>
      <el-descriptions
        :column="2"
        border
      >
        <el-descriptions-item label="FCP (First Contentful Paint)">
          测量页面从开始加载到页面内容的任何部分在屏幕上完成渲染的时间
        </el-descriptions-item>
        <el-descriptions-item label="LCP (Largest Contentful Paint)">
          测量页面从开始加载到最大文本块或图像元素在屏幕上完成渲染的时间
        </el-descriptions-item>
        <el-descriptions-item label="FID (First Input Delay)">
          测量从用户第一次与页面交互到浏览器实际能够响应交互的时间
        </el-descriptions-item>
        <el-descriptions-item label="CLS (Cumulative Layout Shift)">
          测量整个页面生命周期内发生的所有意外布局偏移的总和
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface CoreWebVitals {
  fcp?: number
  lcp?: number
  fid?: number
  cls?: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

interface PerformanceMetrics {
  firstContentfulPaint?: number
  largestContentfulPaint?: number
  firstInputDelay?: number
  cumulativeLayoutShift?: number
}

defineProps<{
  metrics: PerformanceMetrics
  cwv: CoreWebVitals
}>()

// 格式化数值
const formatValue = (value: number | undefined) => {
  if (value === undefined) return '-'
  return value >= 1000 ? `${(value / 1000).toFixed(2)}s` : `${value.toFixed(0)}ms`
}

// 获取指标类别样式
const getMetricClass = (type: string, value: number | undefined) => {
  if (value === undefined) return 'metric-unknown'

  const thresholds: Record<string, { good: number; needsImprovement: number }> = {
    fcp: { good: 1800, needsImprovement: 3000 },
    lcp: { good: 2500, needsImprovement: 4000 },
    fid: { good: 100, needsImprovement: 300 },
    cls: { good: 0.1, needsImprovement: 0.25 }
  }

  const threshold = thresholds[type]
  if (!threshold) return 'metric-poor'
  if (value < threshold.good) return 'metric-good'
  if (value < threshold.needsImprovement) return 'metric-warning'
  return 'metric-poor'
}

// 获取进度百分比
const getProgress = (type: string, value: number | undefined) => {
  if (value === undefined) return 0

  const maxValues: Record<string, number> = {
    fcp: 5000,
    lcp: 6000,
    fid: 500,
    cls: 0.5
  }

  const max = maxValues[type]
  if (!max) return 0
  return Math.min((value / max) * 100, 100)
}

// 获取进度条颜色
const getProgressColor = (type: string, value: number | undefined) => {
  const className = getMetricClass(type, value)
  if (className === 'metric-good') return '#67C23A'
  if (className === 'metric-warning') return '#E6A23C'
  return '#F56C6C'
}
</script>

<style scoped lang="scss">
.core-web-vitals-panel {
  .metric-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    transition: all 0.3s;
    border: 2px solid transparent;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    &.metric-good {
      border-color: #67C23A;
      .metric-icon {
        background: linear-gradient(135deg, #67C23A, #85CE61);
      }
    }

    &.metric-warning {
      border-color: #E6A23C;
      .metric-icon {
        background: linear-gradient(135deg, #E6A23C, #EEBE77);
      }
    }

    &.metric-poor {
      border-color: #F56C6C;
      .metric-icon {
        background: linear-gradient(135deg, #F56C6C, #F78989);
      }
    }

    .metric-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      color: white;
      font-size: 28px;
    }

    .metric-content {
      text-align: center;

      .metric-value {
        font-size: 32px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 8px;
      }

      .metric-label {
        font-size: 14px;
        font-weight: 500;
        color: #606266;
        margin-bottom: 4px;
      }

      .metric-desc {
        font-size: 12px;
        color: #909399;
        margin-bottom: 12px;
      }

      :deep(.el-progress) {
        margin-bottom: 12px;

        .el-progress-bar__outer {
          height: 8px !important;
        }
      }

      .metric-threshold {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #C0C4CC;

        span {
          padding: 2px 8px;
          background: #F5F7FA;
          border-radius: 4px;
        }
      }
    }
  }

  .info-card {
    margin-top: 20px;

    .info-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;

      i {
        color: #409EFF;
      }
    }

    :deep(.el-descriptions) {
      .el-descriptions__label {
        font-weight: 500;
        width: 30%;
      }

      .el-descriptions__content {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}
</style>
