<template>
  <div class="rate-limit-config">
    <el-form-item label="最大请求数">
      <el-input-number
        v-model="localConfig.maxRequests"
        :min="1"
        :max="10000"
        :step="10"
      />
      <span class="help-text">时间窗口内允许的最大请求数</span>
    </el-form-item>

    <el-form-item label="时间窗口(ms)">
      <el-input-number
        v-model="localConfig.windowSizeMs"
        :min="100"
        :max="60000"
        :step="100"
      />
      <span class="help-text">限流统计的时间窗口大小</span>
    </el-form-item>

    <!-- RPS计算和可视化 -->
    <el-card class="rate-limit-visualization" shadow="never">
      <template #header>
        <span>限流统计</span>
      </template>
      <div class="stats">
        <div class="stat-item">
          <div class="stat-label">每秒请求数（RPS）</div>
          <div class="stat-value">{{ calculateRPS() }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">时间窗口</div>
          <div class="stat-value">{{ (localConfig.windowSizeMs / 1000).toFixed(1) }}秒</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">每分钟请求数（RPM）</div>
          <div class="stat-value">{{ calculateRPM() }}</div>
        </div>
      </div>
      <div class="rate-limit-timeline">
        <div class="timeline-bar">
          <div
            class="timeline-fill"
            :style="{ width: '70%' }"
          >
            <span>已使用: 70%</span>
          </div>
        </div>
        <div class="timeline-label">
          <span>当前窗口</span>
          <span>{{ localConfig.maxRequests }}请求</span>
        </div>
      </div>
      <div class="rate-limit-desc">
        <p><strong>限流模式</strong>：防止系统过载，保护服务稳定性</p>
        <p>当请求超过限制时，新请求将被拒绝或进入等待队列</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface RateLimitConfig {
  enabled: boolean
  maxRequests: number
  windowSizeMs: number
}

const props = defineProps<{
  modelValue: RateLimitConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: RateLimitConfig): void
}>()

const localConfig = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 计算RPS（每秒请求数）
const calculateRPS = (): string => {
  const rps = (localConfig.value.maxRequests / (localConfig.value.windowSizeMs / 1000))
  return rps.toFixed(0)
}

// 计算RPM（每分钟请求数）
const calculateRPM = (): string => {
  const rpm = (localConfig.value.maxRequests / (localConfig.value.windowSizeMs / 1000)) * 60
  return rpm.toFixed(0)
}
</script>

<style scoped>
.rate-limit-config {
  padding: 10px 0;
}

.help-text {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.rate-limit-visualization {
  margin-top: 20px;
}

.stats {
  display: flex;
  gap: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.rate-limit-timeline {
  margin-top: 20px;
  padding: 15px;
}

.timeline-bar {
  height: 40px;
  background-color: #e9ecef;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
}

.timeline-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #66b1ff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  transition: width 0.3s ease;
}

.timeline-label {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #606266;
}

.rate-limit-desc {
  margin-top: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.rate-limit-desc p {
  margin: 5px 0;
  font-size: 13px;
  line-height: 1.6;
}
</style>

