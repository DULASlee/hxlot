<template>
  <div class="fault-injection-config">
    <el-form-item label="注入比例(%)">
      <el-slider
        v-model="localConfig.injectionPercentage"
        :min="0"
        :max="100"
        :step="5"
        show-input
      />
      <span class="help-text">故障注入影响的流量百分比</span>
    </el-form-item>

    <el-form-item label="目标端点">
      <el-input
        v-model="localConfig.targetEndpoint"
        placeholder="/api/v1/users"
        clearable
      />
      <span class="help-text">可选，留空则影响所有端点</span>
    </el-form-item>

    <!-- 延迟故障 -->
    <el-card
      shadow="never"
      class="fault-type-card"
    >
      <template #header>
        <el-checkbox v-model="localConfig.delay.enabled">
          <span class="fault-title">延迟故障 (Delay)</span>
        </el-checkbox>
      </template>

      <template v-if="localConfig.delay.enabled">
        <el-form-item label="延迟时间(ms)">
          <el-input-number
            v-model="localConfig.delay.fixedDelayMs"
            :min="0"
            :max="300000"
            :step="1000"
          />
          <span class="help-text">固定延迟时间</span>
        </el-form-item>

        <el-form-item label="延迟比例(%)">
          <el-slider
            v-model="localConfig.delay.percentage"
            :min="0"
            :max="100"
            :step="10"
            show-input
          />
        </el-form-item>

        <div class="fault-preview">
          <div class="preview-label">
            延迟效果预览:
          </div>
          <div class="preview-content">
            <div class="timeline">
              <div class="timeline-normal">
                正常响应
              </div>
              <div
                class="timeline-delay"
                :style="{ width: `${Math.min(localConfig.delay.fixedDelayMs / 50, 300)}px` }"
              >
                +{{ localConfig.delay.fixedDelayMs }}ms
              </div>
            </div>
            <div class="preview-stats">
              受影响请求: {{ localConfig.delay.percentage }}%
            </div>
          </div>
        </div>
      </template>
    </el-card>

    <!-- 中止故障 -->
    <el-card
      shadow="never"
      class="fault-type-card"
    >
      <template #header>
        <el-checkbox v-model="localConfig.abort.enabled">
          <span class="fault-title">中止故障 (Abort)</span>
        </el-checkbox>
      </template>

      <template v-if="localConfig.abort.enabled">
        <el-form-item label="HTTP状态码">
          <el-select
            v-model="localConfig.abort.httpStatusCode"
            placeholder="选择状态码"
          >
            <el-option
              label="400 Bad Request"
              :value="400"
            />
            <el-option
              label="403 Forbidden"
              :value="403"
            />
            <el-option
              label="404 Not Found"
              :value="404"
            />
            <el-option
              label="500 Internal Server Error"
              :value="500"
            />
            <el-option
              label="502 Bad Gateway"
              :value="502"
            />
            <el-option
              label="503 Service Unavailable"
              :value="503"
            />
            <el-option
              label="504 Gateway Timeout"
              :value="504"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="中止比例(%)">
          <el-slider
            v-model="localConfig.abort.percentage"
            :min="0"
            :max="100"
            :step="10"
            show-input
          />
        </el-form-item>

        <div class="fault-preview">
          <div class="preview-label">
            中止效果预览:
          </div>
          <div class="preview-content">
            <div class="abort-demo">
              <div class="request-flow">
                <div class="flow-box">
                  Client
                </div>
                <div class="flow-arrow">
                  →
                </div>
                <div class="flow-box error">
                  {{ localConfig.abort.httpStatusCode }}
                </div>
                <div class="flow-arrow blocked">
                  ✗
                </div>
                <div class="flow-box disabled">
                  Service
                </div>
              </div>
            </div>
            <div class="preview-stats error">
              失败请求: {{ localConfig.abort.percentage }}%
            </div>
          </div>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface FaultInjectionConfig {
  delay: {
    enabled: boolean
    fixedDelayMs: number
    percentage: number
  }
  abort: {
    enabled: boolean
    httpStatusCode: number
    percentage: number
  }
  targetEndpoint: string
  injectionPercentage: number
}

const props = defineProps<{
  modelValue: FaultInjectionConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FaultInjectionConfig): void
}>()

const localConfig = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<style scoped>
.fault-injection-config {
  padding: 10px 0;
}

.help-text {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.fault-type-card {
  margin-bottom: 20px;
  border: 2px solid #e4e7ed;
}

.fault-title {
  font-weight: bold;
  font-size: 14px;
}

.fault-preview {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.preview-label {
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 10px;
  color: #606266;
}

.preview-content {
  margin-top: 10px;
}

.timeline {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.timeline-normal {
  padding: 8px 15px;
  background-color: #67c23a;
  color: white;
  border-radius: 4px;
  font-size: 12px;
}

.timeline-delay {
  padding: 8px 15px;
  background-color: #e6a23c;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  transition: width 0.3s ease;
  white-space: nowrap;
}

.preview-stats {
  font-size: 12px;
  color: #606266;
  text-align: center;
}

.preview-stats.error {
  color: #f56c6c;
  font-weight: bold;
}

.abort-demo {
  padding: 10px;
}

.request-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.flow-box {
  padding: 10px 20px;
  border: 2px solid #409eff;
  border-radius: 4px;
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: bold;
  font-size: 13px;
}

.flow-box.error {
  border-color: #f56c6c;
  background-color: #fef0f0;
  color: #f56c6c;
}

.flow-box.disabled {
  border-color: #dcdfe6;
  background-color: #f5f7fa;
  color: #c0c4cc;
}

.flow-arrow {
  font-size: 20px;
  color: #606266;
}

.flow-arrow.blocked {
  color: #f56c6c;
  font-size: 24px;
}
</style>

