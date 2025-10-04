<template>
  <div class="resilience-policy-designer">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>弹性策略配置器</span>
          <el-button type="primary" @click="handleGenerate">生成代码</el-button>
        </div>
      </template>

      <el-form :model="policyConfig" label-width="120px">
        <el-form-item label="服务名称">
          <el-input
            v-model="policyConfig.serviceName"
            placeholder="请输入服务名称"
            clearable
          />
        </el-form-item>

        <el-divider content-position="left">弹性策略选择</el-divider>

        <el-form-item label="启用的策略">
          <el-checkbox-group v-model="enabledPolicies">
            <el-checkbox label="retry">重试策略</el-checkbox>
            <el-checkbox label="circuitBreaker">断路器</el-checkbox>
            <el-checkbox label="timeout">超时控制</el-checkbox>
            <el-checkbox label="bulkhead">舱壁隔离</el-checkbox>
            <el-checkbox label="rateLimit">限流策略</el-checkbox>
            <el-checkbox label="fallback">回退策略</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <!-- 重试策略配置 -->
        <template v-if="enabledPolicies.includes('retry')">
          <el-divider content-position="left">
            <el-icon><Refresh /></el-icon>
            重试策略
          </el-divider>
          <retry-policy-config v-model="policyConfig.retry" />
        </template>

        <!-- 断路器配置 -->
        <template v-if="enabledPolicies.includes('circuitBreaker')">
          <el-divider content-position="left">
            <el-icon><Lightning /></el-icon>
            断路器
          </el-divider>
          <circuit-breaker-config v-model="policyConfig.circuitBreaker" />
        </template>

        <!-- 超时控制配置 -->
        <template v-if="enabledPolicies.includes('timeout')">
          <el-divider content-position="left">
            <el-icon><Timer /></el-icon>
            超时控制
          </el-divider>
          <el-form-item label="超时时间(ms)">
            <el-input-number
              v-model="policyConfig.timeout.timeoutMs"
              :min="100"
              :max="300000"
              :step="1000"
            />
          </el-form-item>
          <el-form-item label="超时抛出异常">
            <el-switch v-model="policyConfig.timeout.throwOnTimeout" />
          </el-form-item>
        </template>
      </el-form>

      <!-- 代码预览 -->
      <el-divider content-position="left">代码预览</el-divider>
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="Polly C#代码" name="polly">
          <el-input
            v-model="generatedCode.polly"
            type="textarea"
            :rows="15"
            readonly
            class="code-preview"
          />
        </el-tab-pane>
        <el-tab-pane label="Istio YAML" name="istio">
          <el-input
            v-model="generatedCode.istio"
            type="textarea"
            :rows="15"
            readonly
            class="code-preview"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Lightning, Timer } from '@element-plus/icons-vue'
import CircuitBreakerConfig from './CircuitBreakerConfig.vue'
import RetryPolicyConfig from './RetryPolicyConfig.vue'

// 策略配置数据模型
interface PolicyConfig {
  serviceName: string
  retry: {
    enabled: boolean
    maxAttempts: number
    backoffStrategy: string
    initialDelayMs: number
    maxDelayMs: number
  }
  circuitBreaker: {
    enabled: boolean
    failureThreshold: number
    samplingDurationMs: number
    minimumThroughput: number
    breakDurationMs: number
    halfOpenMaxAttempts: number
  }
  timeout: {
    enabled: boolean
    timeoutMs: number
    throwOnTimeout: boolean
  }
  bulkhead: {
    enabled: boolean
    maxParallelization: number
    maxQueuingActions: number
  }
  rateLimit: {
    enabled: boolean
    maxRequests: number
    windowSizeMs: number
  }
  fallback: {
    enabled: boolean
    fallbackType: string
    fallbackValue: string
  }
}

// 启用的策略列表
const enabledPolicies = ref<string[]>(['retry', 'circuitBreaker'])

// 策略配置
const policyConfig = reactive<PolicyConfig>({
  serviceName: 'my-service',
  retry: {
    enabled: true,
    maxAttempts: 3,
    backoffStrategy: 'Exponential',
    initialDelayMs: 100,
    maxDelayMs: 5000
  },
  circuitBreaker: {
    enabled: true,
    failureThreshold: 0.5,
    samplingDurationMs: 10000,
    minimumThroughput: 10,
    breakDurationMs: 30000,
    halfOpenMaxAttempts: 3
  },
  timeout: {
    enabled: false,
    timeoutMs: 5000,
    throwOnTimeout: true
  },
  bulkhead: {
    enabled: false,
    maxParallelization: 10,
    maxQueuingActions: 5
  },
  rateLimit: {
    enabled: false,
    maxRequests: 100,
    windowSizeMs: 1000
  },
  fallback: {
    enabled: false,
    fallbackType: 'Default',
    fallbackValue: '{}'
  }
})

// 生成的代码
const generatedCode = reactive({
  polly: '// Polly代码将在点击"生成代码"后显示',
  istio: '# Istio YAML将在点击"生成代码"后显示'
})

// 当前激活的Tab
const activeTab = ref('polly')

// 监听启用策略变化，更新enabled状态
watch(enabledPolicies, (newPolicies) => {
  policyConfig.retry.enabled = newPolicies.includes('retry')
  policyConfig.circuitBreaker.enabled = newPolicies.includes('circuitBreaker')
  policyConfig.timeout.enabled = newPolicies.includes('timeout')
  policyConfig.bulkhead.enabled = newPolicies.includes('bulkhead')
  policyConfig.rateLimit.enabled = newPolicies.includes('rateLimit')
  policyConfig.fallback.enabled = newPolicies.includes('fallback')
}, { deep: true })

// 生成代码
const handleGenerate = async () => {
  if (!policyConfig.serviceName) {
    ElMessage.warning('请输入服务名称')
    return
  }

  try {
    // TODO: 调用后端API生成代码
    // const response = await generateResiliencePolicy(policyConfig)
    
    // 模拟生成的代码
    generatedCode.polly = `// Polly弹性策略 - ${policyConfig.serviceName}\n\n` +
      `var retryPolicy = Policy.Handle<HttpRequestException>()\n` +
      `  .WaitAndRetryAsync(${policyConfig.retry.maxAttempts});\n\n` +
      `var circuitBreakerPolicy = Policy.Handle<HttpRequestException>()\n` +
      `  .CircuitBreakerAsync(${policyConfig.circuitBreaker.minimumThroughput}, ` +
      `TimeSpan.FromMilliseconds(${policyConfig.circuitBreaker.breakDurationMs}));`
    
    generatedCode.istio = `# Istio弹性配置 - ${policyConfig.serviceName}\n\n` +
      `apiVersion: networking.istio.io/v1beta1\n` +
      `kind: VirtualService\n` +
      `metadata:\n` +
      `  name: ${policyConfig.serviceName}-vs\n` +
      `spec:\n` +
      `  hosts:\n` +
      `    - ${policyConfig.serviceName}`

    ElMessage.success('代码生成成功')
  } catch (error) {
    ElMessage.error('代码生成失败')
    console.error(error)
  }
}
</script>

<style scoped>
.resilience-policy-designer {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.code-preview {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.code-preview :deep(textarea) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}
</style>

