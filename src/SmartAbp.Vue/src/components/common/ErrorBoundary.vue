<template>
  <div class="error-boundary">
    <slot v-if="!hasError" />
    <div
      v-else
      class="error-fallback"
    >
      <el-result
        icon="error"
        title="组件加载失败"
        :sub-title="errorInfo?.message"
      >
        <template #extra>
          <el-button @click="retry">
            重试
          </el-button>
          <el-button
            type="primary"
            @click="reset"
          >
            重置
          </el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { ElResult, ElButton } from 'element-plus'

const hasError = ref(false)
const errorInfo = ref<Error | null>(null)

const emit = defineEmits<{
  (e: 'error', error: Error, instance: any): void
}>()

onErrorCaptured((err, instance) => {
  hasError.value = true
  errorInfo.value = err
  emit('error', err, instance)

  // 阻止错误向上传播
  return false
})

const retry = () => {
  hasError.value = false
  errorInfo.value = null
}

const reset = () => {
  window.location.reload()
}
</script>

<style scoped>
.error-fallback {
  padding: 20px;
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 4px;
}
</style>
