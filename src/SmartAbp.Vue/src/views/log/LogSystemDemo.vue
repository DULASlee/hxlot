<template>
  <div class="log-system-demo">
    <div class="demo-header">
      <h1>日志记录系统演示</h1>
      <p>这个页面展示了完整的日志记录系统功能，包括日志记录、分析、搜索和导出。</p>
    </div>

    <!-- 操作演示区域 -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <h3>日志记录演示</h3>
      </template>

      <div class="demo-actions">
        <el-button-group>
          <el-button @click="generateInfoLog">生成信息日志</el-button>
          <el-button @click="generateSuccessLog" type="success">生成成功日志</el-button>
          <el-button @click="generateWarningLog" type="warning">生成警告日志</el-button>
          <el-button @click="generateErrorLog" type="danger">生成错误日志</el-button>
        </el-button-group>

        <el-divider direction="vertical" />

        <el-button-group>
          <el-button @click="simulateApiCall">模拟 API 调用</el-button>
          <el-button @click="simulatePerformanceTest">性能测试</el-button>
          <el-button @click="simulateErrorScenario">错误场景</el-button>
        </el-button-group>

        <el-divider direction="vertical" />

        <el-button @click="generateBatchLogs">批量生成日志</el-button>
      </div>
    </el-card>

    <!-- 日志仪表板 -->
    <LogDashboard />

    <!-- 使用说明 -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <h3>使用说明</h3>
      </template>

      <el-collapse>
        <el-collapse-item title="基本日志记录" name="basic">
          <div class="usage-content">
            <h4>在组件中使用日志记录：</h4>
            <pre><code>import { logger } from '@/utils/logger'

// 记录不同级别的日志
logger.info('用户登录成功', 'auth', { userId: 123 })
logger.warn('API 响应时间较长', 'performance', { duration: 2000 })
logger.error('网络请求失败', 'api', error)
logger.success('数据保存成功', 'data')
logger.debug('调试信息', 'debug', debugData)</code></pre>
          </div>
        </el-collapse-item>

        <el-collapse-item title="性能跟踪" name="performance">
          <div class="usage-content">
            <h4>使用性能跟踪功能：</h4>
            <pre><code>import { logManager, trackPerformance } from '@/utils/logManager'

// 方法1：手动跟踪
const trackingId = logManager.startPerformanceTracking('数据加载', 'api')
// ... 执行操作
logManager.endPerformanceTracking(trackingId.id)

// 方法2：装饰器方式
const optimizedFunction = trackPerformance(myFunction, '函数名', '分类')

// 方法3：Promise 自动跟踪
const trackedApiCall = trackPerformance(apiCall, 'API调用', 'network')</code></pre>
          </div>
        </el-collapse-item>

        <el-collapse-item title="日志分析" name="analysis">
          <div class="usage-content">
            <h4>使用日志分析功能：</h4>
            <pre><code>import { logAnalyzer, analyzeCurrentLogs } from '@/utils/logAnalyzer'

// 获取分析结果
const analysis = analyzeCurrentLogs()
console.log('错误数量:', analysis.summary.levelDistribution.ERROR)
console.log('健康评分:', analysis.insights.healthScore)

// 配置分析参数
logAnalyzer.setConfig({
  timeRange: TimeRange.LAST_HOUR,
  includeDebug: false,
  minSeverity: LogLevel.WARN
})</code></pre>
          </div>
        </el-collapse-item>

        <el-collapse-item title="日志导出" name="export">
          <div class="usage-content">
            <h4>导出日志数据：</h4>
            <pre><code>import { logExporter, ExportFormat } from '@/utils/logExporter'

// 导出为 HTML 报告
logExporter.downloadLogs({
  format: ExportFormat.HTML,
  includeAnalysis: true,
  includePerformance: true,
  maxEntries: 1000
})

// 导出为 JSON
const jsonData = logExporter.exportLogs({
  format: ExportFormat.JSON,
  levels: [LogLevel.ERROR, LogLevel.WARN]
})</code></pre>
          </div>
        </el-collapse-item>

        <el-collapse-item title="组件集成" name="components">
          <div class="usage-content">
            <h4>在 Vue 组件中集成日志系统：</h4>
            <pre><code>&lt;template&gt;
  &lt;div&gt;
    &lt;!-- 日志查看器 --&gt;
    &lt;LogViewer :logs="logs" show-search show-export /&gt;

    &lt;!-- 搜索过滤器 --&gt;
    &lt;LogSearchFilter :logs="logs" @filtered="handleFiltered" /&gt;

    &lt;!-- 完整仪表板 --&gt;
    &lt;LogDashboard /&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { ref } from 'vue'
import { logger } from '@/utils/logger'
import LogViewer from './LogViewer.vue'
import LogSearchFilter from './LogSearchFilter.vue'
import LogDashboard from '@/views/log/LogDashboard.vue'

const logs = ref(logger.getLogs())

const handleFiltered = (filteredLogs) => {
  console.log('过滤后的日志:', filteredLogs)
}
&lt;/script&gt;</code></pre>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 最佳实践 -->
    <el-card class="demo-section" shadow="never">
      <template #header>
        <h3>最佳实践建议</h3>
      </template>

      <div class="best-practices">
        <el-alert
          title="日志级别使用建议"
          type="info"
          :closable="false"
          show-icon
        >
          <ul>
            <li><strong>DEBUG</strong>: 详细的调试信息，仅在开发环境使用</li>
            <li><strong>INFO</strong>: 一般信息，记录正常的业务流程</li>
            <li><strong>SUCCESS</strong>: 成功操作，用户友好的成功反馈</li>
            <li><strong>WARN</strong>: 警告信息，可能的问题但不影响功能</li>
            <li><strong>ERROR</strong>: 错误信息，需要立即关注的问题</li>
          </ul>
        </el-alert>

        <el-alert
          title="性能监控建议"
          type="warning"
          :closable="false"
          show-icon
          style="margin-top: 15px;"
        >
          <ul>
            <li>对关键业务流程进行性能跟踪</li>
            <li>设置合理的性能阈值（如 1 秒）</li>
            <li>定期分析性能数据，优化慢操作</li>
            <li>在生产环境中适度使用，避免影响性能</li>
          </ul>
        </el-alert>

        <el-alert
          title="日志管理建议"
          type="success"
          :closable="false"
          show-icon
          style="margin-top: 15px;"
        >
          <ul>
            <li>定期清理旧日志，避免内存占用过多</li>
            <li>使用分类和来源标识，便于日志过滤</li>
            <li>重要错误及时导出，便于问题排查</li>
            <li>配置合适的通知级别，避免信息过载</li>
          </ul>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { logger } from '@/utils/logger'
import { logManager } from '@/utils/logManager'
import LogDashboard from '@/views/log/LogDashboard.vue'

// 生成不同类型的日志
const generateInfoLog = () => {
  logger.info('这是一条信息日志', {
    timestamp: new Date(),
    user: 'demo-user',
    action: 'generate-info-log',
    category: 'demo'
  })
  ElMessage.info('已生成信息日志')
}

const generateSuccessLog = () => {
  logger.success('操作执行成功！', {
    operation: 'demo-success',
    duration: Math.random() * 1000,
    category: 'demo'
  })
  ElMessage.success('已生成成功日志')
}

const generateWarningLog = () => {
  logger.warn('检测到潜在问题', {
    issue: 'demo-warning',
    severity: 'medium',
    suggestion: '建议检查相关配置',
    category: 'demo'
  })
  ElMessage.warning('已生成警告日志')
}

const generateErrorLog = () => {
  const error = new Error('这是一个演示错误')
  logger.error('发生了一个错误', { error, category: 'demo' })
  ElMessage.error('已生成错误日志')
}

// 模拟 API 调用
const simulateApiCall = async () => {
  const trackingId = logManager.startPerformanceTracking('模拟API调用', 'api')

  try {
    logger.info('开始API调用', { endpoint: '/api/demo', category: 'api' })

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500))

    if (Math.random() > 0.8) {
      throw new Error('API调用失败')
    }

    logger.success('API调用成功', {
      status: 200,
      data: { result: 'success' },
      category: 'api'
    })
    ElMessage.success('API调用模拟完成')

  } catch (error) {
    logger.error('API调用失败', { error, category: 'api' })
    ElMessage.error('API调用失败')
  } finally {
    logManager.endPerformanceTracking(trackingId.id)
  }
}

// 性能测试
const simulatePerformanceTest = () => {
  const operations = [
    { name: '数据库查询', category: 'database', duration: Math.random() * 1500 + 200 },
    { name: '文件处理', category: 'file', duration: Math.random() * 3000 + 500 },
    { name: '图片压缩', category: 'image', duration: Math.random() * 2000 + 800 },
    { name: '数据计算', category: 'compute', duration: Math.random() * 1000 + 100 }
  ]

  operations.forEach(op => {
    const trackingId = logManager.startPerformanceTracking(op.name, op.category)

    setTimeout(() => {
      logManager.endPerformanceTracking(trackingId.id)

      if (op.duration > 1500) {
        logger.warn(`${op.name}执行时间较长`, {
          duration: op.duration,
          threshold: 1500,
          category: 'performance'
        })
      } else {
        logger.info(`${op.name}执行完成`, {
          duration: op.duration,
          category: 'performance'
        })
      }
    }, op.duration)
  })

  ElMessage.info('性能测试已开始，请查看日志')
}

// 错误场景模拟
const simulateErrorScenario = () => {
  const scenarios = [
    { type: '网络错误', error: new Error('网络连接超时') },
    { type: '权限错误', error: new Error('用户权限不足') },
    { type: '数据错误', error: new Error('数据格式不正确') },
    { type: '系统错误', error: new Error('系统内部错误') }
  ]

  scenarios.forEach((scenario, index) => {
    setTimeout(() => {
      logger.error(`${scenario.type}发生`, { error: scenario.error, category: 'error-simulation' })
    }, index * 500)
  })

  ElMessage.warning('错误场景模拟已开始')
}

// 批量生成日志
const generateBatchLogs = () => {
  const logEntries = []

  for (let i = 0; i < 20; i++) {
    const levels = ['info', 'success', 'warn', 'error']
    const categories = ['user', 'system', 'api', 'database', 'ui']
    const level = levels[Math.floor(Math.random() * levels.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]

    logEntries.push({
      level: level as any,
      message: `批量日志 ${i + 1}: ${category} 操作`,
      category,
      data: { batchId: Date.now(), index: i },
      source: 'batch-generator'
    })
  }

  logManager.logBatch(logEntries)
  ElMessage.success(`已生成 ${logEntries.length} 条批量日志`)
}
</script>

<style scoped>
.log-system-demo {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 30px;
}

.demo-header h1 {
  color: #303133;
  margin-bottom: 10px;
}

.demo-header p {
  color: #606266;
  font-size: 16px;
}

.demo-section {
  margin-bottom: 30px;
}

.demo-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
}

.usage-content {
  padding: 15px 0;
}

.usage-content h4 {
  color: #303133;
  margin-bottom: 10px;
}

.usage-content pre {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
}

.usage-content code {
  color: #e96900;
}

.best-practices ul {
  margin: 10px 0;
  padding-left: 20px;
}

.best-practices li {
  margin: 5px 0;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .log-system-demo {
    padding: 10px;
  }

  .demo-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .demo-actions .el-button-group {
    width: 100%;
  }

  .demo-actions .el-button-group .el-button {
    flex: 1;
  }
}
</style>
