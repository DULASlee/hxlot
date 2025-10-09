<template>
  <div class="fallback-config">
    <el-form-item label="回退类型">
      <el-radio-group v-model="localConfig.fallbackType">
        <el-radio label="Default">
          默认值
        </el-radio>
        <el-radio label="Cache">
          缓存
        </el-radio>
        <el-radio label="AlternativeService">
          备用服务
        </el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 默认值配置 -->
    <template v-if="localConfig.fallbackType === 'Default'">
      <el-form-item label="默认返回值">
        <el-input
          v-model="localConfig.fallbackValue"
          type="textarea"
          :rows="3"
          placeholder="请输入JSON格式的默认返回值"
        />
        <span class="help-text">服务失败时返回的默认数据</span>
      </el-form-item>
    </template>

    <!-- 备用服务配置 -->
    <template v-if="localConfig.fallbackType === 'AlternativeService'">
      <el-form-item label="备用服务URL">
        <el-input
          v-model="localConfig.alternativeServiceUrl"
          placeholder="https://backup-service.example.com/api"
          clearable
        />
        <span class="help-text">主服务失败时切换到的备用服务地址</span>
      </el-form-item>
    </template>

    <!-- 缓存配置 -->
    <template v-if="localConfig.fallbackType === 'Cache'">
      <el-form-item label="启用缓存">
        <el-switch v-model="localConfig.enableCache" />
      </el-form-item>
      <el-form-item
        v-if="localConfig.enableCache"
        label="缓存时长(ms)"
      >
        <el-input-number
          v-model="localConfig.cacheDurationMs"
          :min="1000"
          :max="3600000"
          :step="1000"
        />
        <span class="help-text">缓存数据的有效期（毫秒）</span>
      </el-form-item>
    </template>

    <!-- 回退策略可视化 -->
    <el-card
      class="fallback-visualization"
      shadow="never"
    >
      <template #header>
        <span>回退策略流程</span>
      </template>
      <div class="fallback-flow">
        <div class="flow-step">
          <div class="step-box primary">
            主服务
          </div>
          <div class="step-arrow">
            失败 →
          </div>
        </div>
        <div class="flow-step">
          <div
            class="step-box"
            :class="{
              'success': localConfig.fallbackType === 'Default',
              'warning': localConfig.fallbackType === 'Cache',
              'info': localConfig.fallbackType === 'AlternativeService'
            }"
          >
            <template v-if="localConfig.fallbackType === 'Default'">
              返回默认值
            </template>
            <template v-else-if="localConfig.fallbackType === 'Cache'">
              使用缓存数据
            </template>
            <template v-else>
              切换备用服务
            </template>
          </div>
        </div>
      </div>
      <div class="fallback-desc">
        <p><strong>回退策略</strong>：当主服务失败时的降级处理方案</p>
        <p>
          <template v-if="localConfig.fallbackType === 'Default'">
            <strong>默认值</strong>：返回预设的静态数据，保证基本功能可用
          </template>
          <template v-else-if="localConfig.fallbackType === 'Cache'">
            <strong>缓存</strong>：使用之前成功的缓存数据，提供降级服务
          </template>
          <template v-else>
            <strong>备用服务</strong>：切换到备用服务地址，保持服务连续性
          </template>
        </p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface FallbackConfig {
  enabled: boolean
  fallbackType: string
  fallbackValue: string
  alternativeServiceUrl: string
  enableCache: boolean
  cacheDurationMs: number
}

const props = defineProps<{
  modelValue: FallbackConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FallbackConfig): void
}>()

const localConfig = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<style scoped>
.fallback-config {
  padding: 10px 0;
}

.help-text {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.fallback-visualization {
  margin-top: 20px;
}

.fallback-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  gap: 20px;
}

.flow-step {
  display: flex;
  align-items: center;
  gap: 15px;
}

.step-box {
  padding: 20px 30px;
  border: 2px solid;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
  min-width: 150px;
}

.step-box.primary {
  border-color: #409eff;
  background-color: #ecf5ff;
  color: #409eff;
}

.step-box.success {
  border-color: #67c23a;
  background-color: #f0f9ff;
  color: #67c23a;
}

.step-box.warning {
  border-color: #e6a23c;
  background-color: #fdf6ec;
  color: #e6a23c;
}

.step-box.info {
  border-color: #909399;
  background-color: #f5f7fa;
  color: #606266;
}

.step-arrow {
  font-size: 18px;
  color: #f56c6c;
  font-weight: bold;
}

.fallback-desc {
  margin-top: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.fallback-desc p {
  margin: 5px 0;
  font-size: 13px;
  line-height: 1.6;
}
</style>

