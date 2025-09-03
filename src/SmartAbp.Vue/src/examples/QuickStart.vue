<template>
  <div class="quick-start">
    <h2>日志系统快速开始</h2>

    <div class="demo-section">
      <h3>基础日志记录</h3>
      <div class="button-group">
        <button @click="logInfo" class="btn-info">信息日志</button>
        <button @click="logWarning" class="btn-warning">警告日志</button>
        <button @click="logError" class="btn-error">错误日志</button>
      </div>
    </div>

    <div class="demo-section">
      <h3>性能追踪</h3>
      <div class="button-group">
        <button @click="trackPerformance" class="btn-primary">开始性能测试</button>
        <button @click="simulateApiCall" class="btn-secondary">模拟API调用</button>
      </div>
    </div>

    <div class="demo-section">
      <h3>实时日志查看器</h3>
      <LogViewer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { logger } from '@/utils/logger'
import { logManager } from '@/utils/logManager'
import LogViewer from '@/components/LogViewer.vue'

// 基础日志记录示例
const logInfo = () => {
  logger.info('用户操作：点击了信息按钮', {
    component: 'QuickStart',
    action: 'click_info_button',
    timestamp: new Date().toISOString(),
    userId: 'demo-user-123'
  })
}

const logWarning = () => {
  logger.warn('系统警告：检测到潜在问题', {
    component: 'QuickStart',
    issue: '内存使用率较高',
    threshold: '85%',
    current: '92%'
  })
}

const logError = () => {
  logger.error('系统错误：操作失败', {
    component: 'QuickStart',
    error: '网络连接超时',
    code: 'NETWORK_TIMEOUT',
    details: '请求超过30秒未响应'
  })
}

// 性能追踪示例
const trackPerformance = async () => {
  const tracker = logManager.startPerformanceTracking('user-interaction')

  // 模拟一些处理时间
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500))

  tracker.end({
    operation: '用户交互处理',
    success: true,
    itemsProcessed: Math.floor(Math.random() * 100) + 1
  })
}

const simulateApiCall = async () => {
  const tracker = logManager.startPerformanceTracking('api-request')

  try {
    // 模拟API调用
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.2 ? resolve('success') : reject(new Error('API错误'))
      }, Math.random() * 3000 + 1000)
    })

    tracker.end({
      endpoint: '/api/users',
      method: 'GET',
      status: 200,
      dataSize: '2.5KB'
    })

    logger.info('API调用成功', {
      endpoint: '/api/users',
      responseTime: tracker.duration + 'ms'
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    tracker.end({
      endpoint: '/api/users',
      method: 'GET',
      status: 500,
      error: errorMessage
    })

    logger.error('API调用失败', {
      endpoint: '/api/users',
      error: errorMessage
    })
  }
}
</script>

<style scoped>
.quick-start {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.demo-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
}

.demo-section h3 {
  margin-top: 0;
  color: #333;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #138496;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
}

.btn-error {
  background: #dc3545;
  color: white;
}

.btn-error:hover {
  background: #c82333;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}
</style>
