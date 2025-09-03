# SmartAbp 日志记录系统使用指南

## 概述

SmartAbp 日志记录系统是一个功能完整的前端日志管理解决方案，提供日志记录、分析、搜索、导出和可视化功能。

## 核心功能

### 1. 日志记录 (Logger)
- 支持多种日志级别：DEBUG、INFO、SUCCESS、WARN、ERROR
- 支持分类和来源标识
- 支持结构化数据记录
- 自动时间戳和唯一ID生成

### 2. 性能跟踪 (Performance Tracking)
- 自动性能监控
- 方法执行时间跟踪
- 性能统计和分析
- 性能阈值告警

### 3. 日志分析 (Log Analysis)
- 实时日志分析
- 趋势分析和预测
- 健康评分计算
- 热点问题识别

### 4. 日志导出 (Log Export)
- 多种导出格式：JSON、CSV、HTML、TXT
- 自定义导出配置
- 分析报告生成
- 批量导出功能

### 5. 可视化组件
- 日志查看器 (LogViewer)
- 搜索过滤器 (LogSearchFilter)
- 高级日志查看器 (AdvancedLogViewer)
- 日志仪表板 (LogDashboard)

## 快速开始

### 基本使用

```typescript
import { logger } from '@/utils/logger'

// 记录不同级别的日志
logger.info('用户登录成功', 'auth', { userId: 123 })
logger.success('数据保存成功', 'data')
logger.warn('API 响应时间较长', 'performance', { duration: 2000 })
logger.error('网络请求失败', 'api', error)
logger.debug('调试信息', 'debug', debugData)
```

### 性能跟踪

```typescript
import { logManager, trackPerformance } from '@/utils/logManager'

// 方法1：手动跟踪
const trackingId = logManager.startPerformanceTracking('数据加载', 'api')
// ... 执行操作
logManager.endPerformanceTracking(trackingId)

// 方法2：装饰器方式
const optimizedFunction = trackPerformance(myFunction, '函数名', '分类')
```

### 在 Vue 组件中使用

```vue
<template>
  <div>
    <!-- 日志查看器 -->
    <LogViewer :logs="logs" show-search show-export />
    
    <!-- 搜索过滤器 -->
    <LogSearchFilter :logs="logs" @filtered="handleFiltered" />
    
    <!-- 完整仪表板 -->
    <LogDashboard />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { logger } from '@/utils/logger'
import LogViewer from '@/components/LogViewer.vue'
import LogSearchFilter from '@/components/LogSearchFilter.vue'
import LogDashboard from '@/components/LogDashboard.vue'

const logs = ref(logger.getLogs())
</script>
```

## 组件详解

### LogViewer 日志查看器
基础的日志显示组件，支持表格和列表两种视图模式。

### LogSearchFilter 搜索过滤器
提供强大的日志搜索和过滤功能。

### LogDashboard 日志仪表板
完整的日志管理仪表板，集成所有功能。

## 最佳实践

### 日志级别使用建议
- **DEBUG**: 详细的调试信息，仅在开发环境使用
- **INFO**: 一般信息，记录正常的业务流程
- **SUCCESS**: 成功操作，用户友好的成功反馈
- **WARN**: 警告信息，可能的问题但不影响功能
- **ERROR**: 错误信息，需要立即关注的问题

### 性能监控建议
- 对关键业务流程进行性能跟踪
- 设置合理的性能阈值（如 1 秒）
- 定期分析性能数据，优化慢操作
- 在生产环境中适度使用，避免影响性能

### 日志管理建议
- 定期清理旧日志，避免内存占用过多
- 使用分类和来源标识，便于日志过滤
- 重要错误及时导出，便于问题排查
- 配置合适的通知级别，避免信息过载

## 演示页面

访问 `/demo/logs` 查看完整的日志系统演示，包括：
- 各种日志记录示例
- 性能跟踪演示
- 错误场景模拟
- 批量日志生成
- 实时仪表板展示

## 文件结构

```
src/
├── utils/
│   ├── logger.ts          # 核心日志记录器
│   ├── logManager.ts      # 日志管理器
│   ├── logAnalyzer.ts     # 日志分析器
│   ├── logExporter.ts     # 日志导出器
│   └── index.ts           # 统一导出
├── components/
│   ├── LogViewer.vue      # 基础日志查看器
│   ├── LogSearchFilter.vue # 搜索过滤器
│   ├── AdvancedLogViewer.vue # 高级日志查看器
│   └── LogDashboard.vue   # 日志仪表板
├── stores/
│   └── logs.ts            # 日志状态管理
└── views/
    └── LogSystemDemo.vue  # 演示页面
```

## 技术栈

- Vue 3 + TypeScript
- Element Plus UI 组件库
- Pinia 状态管理
- ECharts 图表库
- Day.js 时间处理
- Cypress 端到端测试

## 测试

日志系统包含完整的测试覆盖：
- 单元测试：测试核心功能
- 组件测试：测试 Vue 组件
- 端到端测试：测试完整流程

运行测试：
```bash
# 单元测试
npm run test:unit

# 端到端测试
npm run test:e2e