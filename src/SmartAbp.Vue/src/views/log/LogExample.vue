<template>
  <div class="log-example">
    <el-card class="example-card">
      <template #header>
        <div class="card-header">
          <span>日志系统使用示例</span>
          <el-button
            type="primary"
            size="small"
            @click="logStore.toggleLogViewer()"
          >
            {{ logStore.isLogViewerVisible ? '隐藏' : '显示' }}日志面板
          </el-button>
        </div>
      </template>

      <div class="example-content">
        <!-- 日志记录示例 -->
        <div class="example-section">
          <h4>基础日志记录</h4>
          <div class="button-group">
            <el-button @click="logDebugExample">调试日志</el-button>
            <el-button type="info" @click="logInfoExample">信息日志</el-button>
            <el-button type="warning" @click="logWarnExample">警告日志</el-button>
            <el-button type="danger" @click="logErrorExample">错误日志</el-button>
            <el-button type="success" @click="logSuccessExample">成功日志</el-button>
          </div>
        </div>

        <!-- 分类日志示例 -->
        <div class="example-section">
          <h4>分类日志记录</h4>
          <div class="button-group">
            <el-button @click="logUserAction">用户操作</el-button>
            <el-button @click="logApiCall">API 调用</el-button>
            <el-button @click="logSystemEvent">系统事件</el-button>
            <el-button @click="logPerformanceTest">性能测试</el-button>
          </div>
        </div>

        <!-- 日志统计 -->
        <div class="example-section">
          <h4>日志统计</h4>
          <div class="stats-grid">
            <el-statistic title="总日志数" :value="logStore.logStats.total" />
            <el-statistic title="错误数" :value="logStore.errorCount" />
            <el-statistic title="警告数" :value="logStore.warningCount" />
            <el-statistic title="成功数" :value="logStore.logStats.success" />
          </div>
        </div>

        <!-- 日志操作 -->
        <div class="example-section">
          <h4>日志操作</h4>
          <div class="button-group">
            <el-button @click="exportLogs">导出日志</el-button>
            <el-button @click="clearLogs" type="danger">清空日志</el-button>
            <el-button @click="filterErrorLogs">只看错误</el-button>
            <el-button @click="clearFilters">清除过滤</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 日志查看器 -->
    <el-drawer
      v-model="logStore.isLogViewerVisible"
      title="系统日志"
      direction="rtl"
      size="60%"
    >
      <LogViewer />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLogStore } from '@/stores/logs'
import { logger, LogLevel } from '@/utils/logger'
import LogViewer from './LogViewer.vue'

const logStore = useLogStore()

// 基础日志示例
const logDebugExample = () => {
  logStore.logDebug('这是一个调试信息', {
    timestamp: new Date(),
    userAgent: navigator.userAgent,
    category: 'example'
  })
}

const logInfoExample = () => {
  logStore.logInfo('用户访问了示例页面', {
    page: '/log-example',
    referrer: document.referrer,
    category: 'example'
  })
}

const logWarnExample = () => {
  logStore.logWarn('检测到潜在的性能问题', {
    loadTime: 1500,
    threshold: 1000,
    category: 'example'
  })
}

const logErrorExample = () => {
  logStore.logError('模拟的错误信息', {
    errorCode: 'EXAMPLE_ERROR',
    stack: 'Error: 这是一个示例错误\n    at logErrorExample',
    category: 'example'
  })
}

const logSuccessExample = () => {
  logStore.logSuccess('操作成功完成', {
    operation: 'log-example',
    duration: 250,
    category: 'example'
  })
}

// 分类日志示例
const logUserAction = () => {
  logStore.logUserAction('点击了日志示例按钮', {
    buttonType: 'user-action',
    timestamp: Date.now()
  })
}

const logApiCall = () => {
  // 模拟 API 调用日志
  logStore.logApiRequest('GET', '/api/example/data', { page: 1, size: 10 })

  setTimeout(() => {
    logStore.logApiResponse('GET', '/api/example/data', 200, {
      data: { items: [], total: 0 },
      duration: 150
    })
  }, 100)
}

const logSystemEvent = () => {
  logStore.logSystemEvent('主题切换', {
    from: 'light',
    to: 'dark',
    automatic: false
  })
}

const logPerformanceTest = () => {
  const start = performance.now()

  // 模拟一些操作
  setTimeout(() => {
    const duration = performance.now() - start
    logStore.logPerformance('模拟操作', Math.round(duration), {
      operation: 'example-task',
      complexity: 'medium'
    })
  }, Math.random() * 1000 + 500)
}

// 日志操作
const exportLogs = () => {
  try {
    const content = logger.export('json')
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    logStore.logSuccess('日志导出成功', { category: 'system' })
    ElMessage.success('日志已导出')
  } catch (error) {
    logStore.logError('日志导出失败', { error, category: 'system' })
    ElMessage.error('导出失败')
  }
}

const clearLogs = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有日志吗？此操作不可恢复。',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    logStore.clearAllLogs()
    ElMessage.success('日志已清空')
  } catch {
    // 用户取消
  }
}

const filterErrorLogs = () => {
  logStore.setLogFilter({ level: LogLevel.ERROR })
  logStore.logInfo('已过滤显示错误日志', { category: 'system' })
}

const clearFilters = () => {
  logStore.clearLogFilters()
  logStore.logInfo('已清除所有过滤条件', { category: 'system' })
}
</script>

<style scoped>
.log-example {
  padding: 20px;
}

.example-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.example-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.example-section {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 16px;
}

.example-section h4 {
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
  font-size: 16px;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

@media (max-width: 768px) {
  .log-example {
    padding: 10px;
  }

  .card-header {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .button-group {
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
