<template>
  <div class="circuit-breaker-config">
    <el-form-item label="失败率阈值">
      <el-slider
        v-model="localConfig.failureThreshold"
        :min="0"
        :max="1"
        :step="0.05"
        :format-tooltip="formatPercentage"
        show-input
      />
      <span class="help-text">当失败率超过此阈值时，断路器将打开</span>
    </el-form-item>

    <el-form-item label="采样时间窗口(ms)">
      <el-input-number
        v-model="localConfig.samplingDurationMs"
        :min="1000"
        :max="60000"
        :step="1000"
      />
      <span class="help-text">统计失败率的时间窗口</span>
    </el-form-item>

    <el-form-item label="最小吞吐量">
      <el-input-number
        v-model="localConfig.minimumThroughput"
        :min="1"
        :max="1000"
        :step="1"
      />
      <span class="help-text">触发断路器的最小请求数</span>
    </el-form-item>

    <el-form-item label="熔断持续时间(ms)">
      <el-input-number
        v-model="localConfig.breakDurationMs"
        :min="1000"
        :max="300000"
        :step="1000"
      />
      <span class="help-text">断路器打开后保持打开状态的时间</span>
    </el-form-item>

    <el-form-item label="半开状态试探次数">
      <el-input-number
        v-model="localConfig.halfOpenMaxAttempts"
        :min="1"
        :max="10"
        :step="1"
      />
      <span class="help-text">半开状态下允许通过的测试请求数</span>
    </el-form-item>

    <!-- 断路器状态图 -->
    <el-card class="state-diagram" shadow="never">
      <template #header>
        <span>断路器状态机</span>
      </template>
      <div class="state-flow">
        <div class="state closed">关闭状态<br/>(Closed)</div>
        <div class="arrow">→</div>
        <div class="state open">打开状态<br/>(Open)</div>
        <div class="arrow">→</div>
        <div class="state half-open">半开状态<br/>(Half-Open)</div>
      </div>
      <div class="state-desc">
        <p><strong>关闭:</strong> 正常处理请求，统计失败率</p>
        <p><strong>打开:</strong> 拒绝所有请求，快速失败</p>
        <p><strong>半开:</strong> 允许部分请求通过，测试服务恢复</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface CircuitBreakerConfig {
  enabled: boolean
  failureThreshold: number
  samplingDurationMs: number
  minimumThroughput: number
  breakDurationMs: number
  halfOpenMaxAttempts: number
}

const props = defineProps<{
  modelValue: CircuitBreakerConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: CircuitBreakerConfig): void
}>()

const localConfig = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formatPercentage = (value: number) => {
  return `${(value * 100).toFixed(0)}%`
}
</script>

<style scoped>
.circuit-breaker-config {
  padding: 10px 0;
}

.help-text {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.state-diagram {
  margin-top: 20px;
}

.state-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.state {
  padding: 15px 25px;
  border: 2px solid #409eff;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  background-color: #ecf5ff;
}

.state.closed {
  border-color: #67c23a;
  background-color: #f0f9ff;
}

.state.open {
  border-color: #f56c6c;
  background-color: #fef0f0;
}

.state.half-open {
  border-color: #e6a23c;
  background-color: #fdf6ec;
}

.arrow {
  margin: 0 15px;
  font-size: 24px;
  color: #606266;
}

.state-desc {
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.state-desc p {
  margin: 5px 0;
  font-size: 13px;
  line-height: 1.6;
}
</style>

