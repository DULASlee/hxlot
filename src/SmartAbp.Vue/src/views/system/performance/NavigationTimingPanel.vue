<template>
  <div class="navigation-timing-panel">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <i class="fas fa-clock" />
          <span>页面导航时间分解</span>
        </div>
      </template>

      <div class="timing-visual">
        <div class="timeline">
          <div 
            v-for="(phase, index) in timingPhases" 
            :key="index"
            class="timeline-phase"
            :style="{ width: `${getPhaseWidth(phase.duration)}%`, background: phase.color }"
          >
            <div class="phase-label">
              {{ phase.label }}
            </div>
            <div class="phase-value">
              {{ phase.duration }}ms
            </div>
          </div>
        </div>
        <div class="timeline-total">
          总计: {{ totalLoadTime }}ms ({{ (totalLoadTime / 1000).toFixed(2) }}s)
        </div>
      </div>

      <el-row
        :gutter="16"
        class="timing-details"
      >
        <el-col
          :xs="24"
          :sm="12"
          :md="8"
        >
          <div class="timing-item">
            <div
              class="timing-icon"
              style="background: #409EFF"
            >
              <i class="fas fa-network-wired" />
            </div>
            <div class="timing-content">
              <div class="timing-label">
                DNS查询
              </div>
              <div class="timing-value">
                {{ metrics.dnsLookup || 0 }}ms
              </div>
              <div class="timing-desc">
                域名解析时间
              </div>
            </div>
          </div>
        </el-col>

        <el-col
          :xs="24"
          :sm="12"
          :md="8"
        >
          <div class="timing-item">
            <div
              class="timing-icon"
              style="background: #67C23A"
            >
              <i class="fas fa-plug" />
            </div>
            <div class="timing-content">
              <div class="timing-label">
                TCP连接
              </div>
              <div class="timing-value">
                {{ metrics.tcpConnection || 0 }}ms
              </div>
              <div class="timing-desc">
                建立连接时间
              </div>
            </div>
          </div>
        </el-col>

        <el-col
          :xs="24"
          :sm="12"
          :md="8"
        >
          <div class="timing-item">
            <div
              class="timing-icon"
              style="background: #E6A23C"
            >
              <i class="fas fa-lock" />
            </div>
            <div class="timing-content">
              <div class="timing-label">
                TLS握手
              </div>
              <div class="timing-value">
                {{ metrics.tlsHandshake || 0 }}ms
              </div>
              <div class="timing-desc">
                SSL/TLS协商
              </div>
            </div>
          </div>
        </el-col>

        <el-col
          :xs="24"
          :sm="12"
          :md="8"
        >
          <div class="timing-item">
            <div
              class="timing-icon"
              style="background: #F56C6C"
            >
              <i class="fas fa-exchange-alt" />
            </div>
            <div class="timing-content">
              <div class="timing-label">
                请求响应
              </div>
              <div class="timing-value">
                {{ metrics.requestTime || 0 }}ms
              </div>
              <div class="timing-desc">
                服务器处理时间
              </div>
            </div>
          </div>
        </el-col>

        <el-col
          :xs="24"
          :sm="12"
          :md="8"
        >
          <div class="timing-item">
            <div
              class="timing-icon"
              style="background: #909399"
            >
              <i class="fas fa-code" />
            </div>
            <div class="timing-content">
              <div class="timing-label">
                DOM加载
              </div>
              <div class="timing-value">
                {{ metrics.domContentLoaded || 0 }}ms
              </div>
              <div class="timing-desc">
                DOM解析完成
              </div>
            </div>
          </div>
        </el-col>

        <el-col
          :xs="24"
          :sm="12"
          :md="8"
        >
          <div class="timing-item">
            <div
              class="timing-icon"
              style="background: #C0C4CC"
            >
              <i class="fas fa-check-circle" />
            </div>
            <div class="timing-content">
              <div class="timing-label">
                页面完成
              </div>
              <div class="timing-value">
                {{ metrics.loadComplete || 0 }}ms
              </div>
              <div class="timing-desc">
                所有资源加载完成
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'

interface PerformanceMetrics {
  dnsLookup?: number
  tcpConnection?: number
  tlsHandshake?: number
  requestTime?: number
  domContentLoaded?: number
  loadComplete?: number
}

const props = defineProps<{
  metrics: PerformanceMetrics
}>()

// 计算总加载时间
const totalLoadTime = computed(() => {
  return props.metrics.loadComplete || 0
})

// 时间阶段数据
const timingPhases = computed(() => {
  return [
    {
      label: 'DNS',
      duration: props.metrics.dnsLookup || 0,
      color: '#409EFF'
    },
    {
      label: 'TCP',
      duration: props.metrics.tcpConnection || 0,
      color: '#67C23A'
    },
    {
      label: 'TLS',
      duration: props.metrics.tlsHandshake || 0,
      color: '#E6A23C'
    },
    {
      label: '请求',
      duration: props.metrics.requestTime || 0,
      color: '#F56C6C'
    },
    {
      label: 'DOM',
      duration: (props.metrics.domContentLoaded || 0) - (props.metrics.requestTime || 0),
      color: '#909399'
    }
  ].filter(phase => phase.duration > 0)
})

// 计算阶段宽度百分比
const getPhaseWidth = (duration: number) => {
  if (totalLoadTime.value === 0) return 0
  return (duration / totalLoadTime.value) * 100
}
</script>

<style scoped lang="scss">
.navigation-timing-panel {
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;

    i {
      color: #409EFF;
    }
  }

  .timing-visual {
    margin-bottom: 24px;

    .timeline {
      display: flex;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 12px;

      .timeline-phase {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.3s;
        cursor: pointer;

        &:hover {
          filter: brightness(1.1);
          transform: scaleY(1.05);
        }

        .phase-label {
          margin-bottom: 4px;
        }

        .phase-value {
          font-size: 14px;
          font-weight: 600;
        }
      }
    }

    .timeline-total {
      text-align: center;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .timing-details {
    .timing-item {
      display: flex;
      gap: 12px;
      padding: var(--spacing-4);
      background: #F5F7FA;
      border-radius: 8px;
      margin-bottom: 16px;
      transition: all 0.3s;

      &:hover {
        background: #ECF5FF;
        transform: translateX(4px);
      }

      .timing-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        flex-shrink: 0;
      }

      .timing-content {
        flex: 1;

        .timing-label {
          font-size: 14px;
          font-weight: 500;
          color: #606266;
          margin-bottom: 4px;
        }

        .timing-value {
          font-size: 20px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 2px;
        }

        .timing-desc {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}
</style>
