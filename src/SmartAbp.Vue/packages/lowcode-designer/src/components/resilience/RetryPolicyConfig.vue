<template>
  <div class="retry-policy-config">
    <el-form-item label="重试次数">
      <el-input-number
        v-model="localConfig.maxAttempts"
        :min="1"
        :max="10"
        :step="1"
      />
      <span class="help-text">最大重试次数（建议3-5次）</span>
    </el-form-item>

    <el-form-item label="退避策略">
      <el-radio-group v-model="localConfig.backoffStrategy">
        <el-radio label="Exponential">指数退避</el-radio>
        <el-radio label="Linear">线性退避</el-radio>
        <el-radio label="Fixed">固定延迟</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="初始延迟(ms)">
      <el-input-number
        v-model="localConfig.initialDelayMs"
        :min="10"
        :max="10000"
        :step="10"
      />
      <span class="help-text">第一次重试前的延迟时间</span>
    </el-form-item>

    <el-form-item label="最大延迟(ms)">
      <el-input-number
        v-model="localConfig.maxDelayMs"
        :min="100"
        :max="60000"
        :step="1000"
      />
      <span class="help-text">重试延迟的上限值</span>
    </el-form-item>

    <!-- 退避策略可视化 -->
    <el-card class="backoff-visualization" shadow="never">
      <template #header>
        <span>退避策略示意（{{ localConfig.backoffStrategy }}）</span>
      </template>
      <div class="backoff-chart">
        <div
          v-for="(delay, index) in calculateBackoffDelays()"
          :key="index"
          class="backoff-bar"
        >
          <div
            class="bar-fill"
            :style="{ width: `${(delay / localConfig.maxDelayMs) * 100}%` }"
          >
            <span class="bar-label">第{{ index + 1 }}次: {{ delay }}ms</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface RetryPolicyConfig {
  enabled: boolean
  maxAttempts: number
  backoffStrategy: string
  initialDelayMs: number
  maxDelayMs: number
}

const props = defineProps<{
  modelValue: RetryPolicyConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: RetryPolicyConfig): void
}>()

const localConfig = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 计算退避延迟
const calculateBackoffDelays = (): number[] => {
  const delays: number[] = []
  const { maxAttempts, backoffStrategy, initialDelayMs, maxDelayMs } = localConfig.value

  for (let i = 1; i <= maxAttempts; i++) {
    let delay = 0
    switch (backoffStrategy) {
      case 'Exponential':
        delay = Math.min(initialDelayMs * Math.pow(2, i - 1), maxDelayMs)
        break
      case 'Linear':
        delay = Math.min(initialDelayMs * i, maxDelayMs)
        break
      case 'Fixed':
        delay = initialDelayMs
        break
    }
    delays.push(Math.round(delay))
  }

  return delays
}
</script>

<style scoped>
.retry-policy-config {
  padding: 10px 0;
}

.help-text {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.backoff-visualization {
  margin-top: 20px;
}

.backoff-chart {
  padding: 10px;
}

.backoff-bar {
  margin-bottom: 10px;
  height: 30px;
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #66b1ff);
  display: flex;
  align-items: center;
  padding: 0 10px;
  transition: width 0.3s ease;
  min-width: 100px;
}

.bar-label {
  color: white;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
}
</style>

