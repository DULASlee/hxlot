<template>
  <div
    ref="chartRef"
    class="trend-chart"
  >
    <canvas ref="canvasRef" />
    <div
      v-if="loading"
      class="chart-loading"
    >
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { Loading } from '@element-plus/icons-vue'

interface TrendData {
  date: string
  permissions: number
  risks: number
}

interface Props {
  data: TrendData[]
}

const props = defineProps<Props>()

const chartRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()
const loading = ref(false)

// Simple chart drawing using Canvas API
const drawChart = () => {
  if (!canvasRef.value || !chartRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const container = chartRef.value
  canvas.width = container.clientWidth
  canvas.height = container.clientHeight

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Simple line chart implementation
  const data = props.data
  if (!data || data.length === 0) return

  const padding = 40
  const chartWidth = canvas.width - padding * 2
  const chartHeight = canvas.height - padding * 2

  // Calculate scales
  const maxPermissions = Math.max(...data.map(d => d.permissions))
  const maxRisks = Math.max(...data.map(d => d.risks))

  // Draw axes
  ctx.strokeStyle = '#e4e7ed'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, canvas.height - padding)
  ctx.lineTo(canvas.width - padding, canvas.height - padding)
  ctx.stroke()

  // Draw permission line
  ctx.strokeStyle = '#409eff'
  ctx.lineWidth = 2
  ctx.beginPath()

  data.forEach((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth
    const y = padding + ((maxPermissions - point.permissions) / maxPermissions) * chartHeight

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()

  // Draw risk line
  ctx.strokeStyle = '#f56c6c'
  ctx.beginPath()

  data.forEach((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth
    const y = padding + ((maxRisks - point.risks) / maxRisks) * chartHeight

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()

  // Draw legend
  ctx.fillStyle = '#409eff'
  ctx.fillRect(canvas.width - 120, 20, 12, 12)
  ctx.fillStyle = '#303133'
  ctx.font = '12px Arial'
  ctx.fillText('权限变更', canvas.width - 100, 30)

  ctx.fillStyle = '#f56c6c'
  ctx.fillRect(canvas.width - 120, 40, 12, 12)
  ctx.fillStyle = '#303133'
  ctx.fillText('风险事件', canvas.width - 100, 50)
}

onMounted(async () => {
  await nextTick()
  drawChart()
})

watch(() => props.data, () => {
  drawChart()
}, { deep: true })

// Handle resize
const resizeObserver = new ResizeObserver(() => {
  drawChart()
})

onMounted(() => {
  if (chartRef.value) {
    resizeObserver.observe(chartRef.value)
  }
})
</script>

<style scoped lang="scss">
.trend-chart {
  position: relative;
  width: 100%;
  height: 300px;
  background: #fff;
  border-radius: 4px;
}

canvas {
  width: 100%;
  height: 100%;
}

.chart-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #909399;

  .el-icon {
    font-size: 24px;
  }
}
</style>
