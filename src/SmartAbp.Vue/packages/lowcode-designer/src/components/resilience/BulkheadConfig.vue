<template>
  <div class="bulkhead-config">
    <el-form-item label="最大并发数">
      <el-input-number
        v-model="localConfig.maxParallelization"
        :min="1"
        :max="1000"
        :step="1"
      />
      <span class="help-text">同时处理的最大请求数</span>
    </el-form-item>

    <el-form-item label="队列大小">
      <el-input-number
        v-model="localConfig.maxQueuingActions"
        :min="0"
        :max="1000"
        :step="1"
      />
      <span class="help-text">等待处理的最大排队请求数</span>
    </el-form-item>

    <!-- 舱壁隔离示意图 -->
    <el-card class="bulkhead-visualization" shadow="never">
      <template #header>
        <span>舱壁隔离原理</span>
      </template>
      <div class="bulkhead-diagram">
        <div class="pool">
          <div class="pool-header">线程池（{{ localConfig.maxParallelization }}个并发）</div>
          <div class="threads">
            <div
              v-for="i in Math.min(localConfig.maxParallelization, 10)"
              :key="i"
              class="thread active"
            >
              {{ i }}
            </div>
            <div v-if="localConfig.maxParallelization > 10" class="thread-more">
              ...
            </div>
          </div>
        </div>
        <div class="queue" v-if="localConfig.maxQueuingActions > 0">
          <div class="queue-header">等待队列（{{ localConfig.maxQueuingActions }}个）</div>
          <div class="queue-items">
            <div
              v-for="i in Math.min(localConfig.maxQueuingActions, 5)"
              :key="i"
              class="queue-item"
            >
              等待
            </div>
            <div v-if="localConfig.maxQueuingActions > 5" class="queue-more">
              ...
            </div>
          </div>
        </div>
      </div>
      <div class="bulkhead-desc">
        <p><strong>舱壁隔离模式</strong>：限制资源使用，防止单个服务耗尽所有资源</p>
        <p>当并发达到上限时，新请求进入队列等待；队列满时拒绝新请求</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface BulkheadConfig {
  enabled: boolean
  maxParallelization: number
  maxQueuingActions: number
}

const props = defineProps<{
  modelValue: BulkheadConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: BulkheadConfig): void
}>()

const localConfig = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<style scoped>
.bulkhead-config {
  padding: 10px 0;
}

.help-text {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.bulkhead-visualization {
  margin-top: 20px;
}

.bulkhead-diagram {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pool, .queue {
  border: 2px solid #409eff;
  border-radius: 8px;
  padding: 15px;
  background-color: #ecf5ff;
}

.pool-header, .queue-header {
  font-weight: bold;
  margin-bottom: 10px;
  color: #409eff;
}

.threads, .queue-items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.thread {
  width: 50px;
  height: 50px;
  border: 2px solid #67c23a;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f9ff;
  font-weight: bold;
  color: #67c23a;
}

.thread.active {
  background-color: #67c23a;
  color: white;
}

.thread-more, .queue-more {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #909399;
}

.queue-item {
  padding: 8px 15px;
  border: 2px solid #e6a23c;
  border-radius: 4px;
  background-color: #fdf6ec;
  color: #e6a23c;
  font-size: 12px;
}

.bulkhead-desc {
  margin-top: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.bulkhead-desc p {
  margin: 5px 0;
  font-size: 13px;
  line-height: 1.6;
}
</style>

