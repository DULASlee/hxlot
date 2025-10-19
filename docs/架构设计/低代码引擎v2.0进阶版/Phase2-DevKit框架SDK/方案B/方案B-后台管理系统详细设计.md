# SmartAbp低代码引擎 - 后台管理系统详细设计

**文档版本**: v1.0
**创建日期**: 2025-10-19
**技术栈**: ABP vNext + Hangfire + MassTransit + Vue 3 + ECharts
**核心目标**: 完善的日志追踪、性能监控、告警管理、定时任务、消息队列

---

## 📋 文档说明

```yaml
文档定位:
  ✅ 后台管理系统完整技术设计
  ✅ 5大模块详细功能规划
  ✅ 数据库表设计
  ✅ API接口设计
  ✅ 前端界面设计

系统定位:
  ✅ 日志管理和查询
  ✅ 性能监控和分析
  ✅ 告警管理和通知
  ✅ 定时任务调度
  ✅ 消息队列监控

阅读对象:
  ✅ 架构师（理解整体设计）
  ✅ 后端开发（实现后台服务）
  ✅ 前端开发（实现管理界面）
  ✅ 运维人员（使用和运维）
```

---

## 🏗️ 第一部分：系统架构设计

### 1.1 系统总体架构

```yaml
后台管理系统架构（3层）:

Layer 1 - 数据采集层:
  ✅ DevKit日志采集（DevKitLogger）
  ✅ 性能指标采集（PerformanceProfiler）
  ✅ API调用追踪（API Middleware）
  ✅ SQL查询追踪（EF Core Interceptor）
  ✅ 系统指标采集（CPU/内存/磁盘）

Layer 2 - 数据存储层:
  ✅ SQL Server（结构化数据）
    - 日志表（GenerationLogs）
    - 性能指标表（PerformanceMetrics）
    - 告警记录表（Alerts）
    - 定时任务表（ScheduledJobs）
  ✅ Redis（缓存和实时数据）
    - 实时性能指标
    - 在线用户信息
    - 任务队列
  ✅ ElasticSearch（可选，日志全文搜索）
    - 海量日志存储
    - 全文搜索
    - 聚合分析

Layer 3 - 数据展示层:
  ✅ 后台管理API（ABP vNext）
  ✅ 管理界面（Vue 3 + Element Plus + ECharts）
  ✅ 实时推送（SignalR）
  ✅ 报表导出（Excel/PDF）

集成服务:
  ✅ Hangfire（定时任务调度）
  ✅ MassTransit + RabbitMQ（消息队列）
  ✅ Application Insights（可选，Azure监控）
```

### 1.2 技术选型

```yaml
后端技术:
  框架: ABP vNext 9.0
  数据库: SQL Server 2022
  缓存: Redis 7.0
  搜索: ElasticSearch 8.0（可选）
  任务调度: Hangfire 1.8
  消息队列: MassTransit 8.0 + RabbitMQ 3.12
  实时通信: SignalR
  监控: Application Insights（可选）

前端技术:
  框架: Vue 3.4 + TypeScript
  UI库: Element Plus 2.5
  图表: ECharts 5.4
  状态: Pinia 2.1
  路由: Vue Router 4.2
  HTTP: Axios 1.6

开发工具:
  IDE: Visual Studio 2022 / VS Code
  API测试: Swagger / Postman
  数据库: SQL Server Management Studio
  消息队列: RabbitMQ Management Console
  容器: Docker Desktop
```

---

## 📊 第二部分：模块1 - 日志管理系统

### 2.1 数据库表设计

```sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 表1: 代码生成日志表（GenerationLogs）
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE [dbo].[GenerationLogs] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [RequestId] NVARCHAR(100) NOT NULL,          -- 请求唯一标识
    [ModuleName] NVARCHAR(100) NOT NULL,         -- 模块名称
    [Layer] NVARCHAR(50) NOT NULL,               -- 层级（Layer1/Layer2/Layer3/Microservice）
    [Operation] NVARCHAR(50) NOT NULL,           -- 操作类型（Generate/Upgrade/Validate）
    [Status] NVARCHAR(50) NOT NULL,              -- 状态（Started/Running/Completed/Failed）
    [UserId] UNIQUEIDENTIFIER NULL,              -- 用户ID
    [StartTime] DATETIME2 NOT NULL,              -- 开始时间
    [EndTime] DATETIME2 NULL,                    -- 结束时间
    [Duration] INT NULL,                         -- 持续时间（毫秒）
    [FilesGenerated] INT NULL,                   -- 生成文件数
    [LinesGenerated] INT NULL,                   -- 生成代码行数
    [ErrorMessage] NVARCHAR(MAX) NULL,           -- 错误消息
    [StackTrace] NVARCHAR(MAX) NULL,             -- 堆栈追踪
    [Metrics] NVARCHAR(MAX) NULL,                -- 性能指标（JSON）
    [CreatedTime] DATETIME2 NOT NULL DEFAULT GETDATE(),

    INDEX [IX_RequestId] ([RequestId]),
    INDEX [IX_ModuleName] ([ModuleName]),
    INDEX [IX_Layer] ([Layer]),
    INDEX [IX_Status] ([Status]),
    INDEX [IX_StartTime] ([StartTime] DESC),
    INDEX [IX_UserId] ([UserId])
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 表2: 详细日志表（DetailedLogs）
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE [dbo].[DetailedLogs] (
    [Id] BIGINT PRIMARY KEY IDENTITY(1,1),
    [RequestId] NVARCHAR(100) NOT NULL,          -- 关联请求ID
    [Level] NVARCHAR(20) NOT NULL,               -- 日志级别（Trace/Debug/Info/Warning/Error/Critical）
    [Timestamp] DATETIME2 NOT NULL,              -- 时间戳
    [Logger] NVARCHAR(200) NOT NULL,             -- 日志记录器名称
    [Message] NVARCHAR(MAX) NOT NULL,            -- 日志消息
    [Exception] NVARCHAR(MAX) NULL,              -- 异常信息
    [Properties] NVARCHAR(MAX) NULL,             -- 额外属性（JSON）
    [MethodName] NVARCHAR(200) NULL,             -- 方法名
    [FilePath] NVARCHAR(500) NULL,               -- 文件路径
    [LineNumber] INT NULL,                       -- 行号

    INDEX [IX_RequestId] ([RequestId]),
    INDEX [IX_Level] ([Level]),
    INDEX [IX_Timestamp] ([Timestamp] DESC),
    INDEX [IX_Logger] ([Logger])
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 表3: API调用日志表（ApiCallLogs）
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE [dbo].[ApiCallLogs] (
    [Id] BIGINT PRIMARY KEY IDENTITY(1,1),
    [RequestId] NVARCHAR(100) NOT NULL,          -- 关联请求ID
    [ApiName] NVARCHAR(200) NOT NULL,            -- API名称
    [Method] NVARCHAR(10) NOT NULL,              -- HTTP方法（GET/POST/PUT/DELETE）
    [Url] NVARCHAR(500) NOT NULL,                -- 请求URL
    [RequestBody] NVARCHAR(MAX) NULL,            -- 请求体
    [ResponseBody] NVARCHAR(MAX) NULL,           -- 响应体
    [StatusCode] INT NOT NULL,                   -- HTTP状态码
    [Duration] INT NOT NULL,                     -- 耗时（毫秒）
    [Success] BIT NOT NULL,                      -- 是否成功
    [ErrorMessage] NVARCHAR(MAX) NULL,           -- 错误消息
    [Timestamp] DATETIME2 NOT NULL DEFAULT GETDATE(),

    INDEX [IX_RequestId] ([RequestId]),
    INDEX [IX_ApiName] ([ApiName]),
    INDEX [IX_Duration] ([Duration] DESC),
    INDEX [IX_Timestamp] ([Timestamp] DESC)
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 表4: SQL查询日志表（SqlQueryLogs）
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE [dbo].[SqlQueryLogs] (
    [Id] BIGINT PRIMARY KEY IDENTITY(1,1),
    [RequestId] NVARCHAR(100) NOT NULL,          -- 关联请求ID
    [Sql] NVARCHAR(MAX) NOT NULL,                -- SQL语句
    [Parameters] NVARCHAR(MAX) NULL,             -- 参数（JSON）
    [Duration] INT NOT NULL,                     -- 耗时（毫秒）
    [RowCount] INT NULL,                         -- 返回行数
    [DatabaseName] NVARCHAR(100) NULL,           -- 数据库名称
    [Timestamp] DATETIME2 NOT NULL DEFAULT GETDATE(),

    INDEX [IX_RequestId] ([RequestId]),
    INDEX [IX_Duration] ([Duration] DESC),
    INDEX [IX_Timestamp] ([Timestamp] DESC)
);
```

### 2.2 后端API设计

```csharp
namespace SmartAbp.LogManagement.Application
{
    /// <summary>
    /// 日志管理应用服务
    /// </summary>
    public interface ILogManagementAppService : IApplicationService
    {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 代码生成日志查询
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 分页查询代码生成日志
        /// </summary>
        Task<PagedResultDto<GenerationLogDto>> GetGenerationLogsAsync(
            GetGenerationLogsInput input
        );

        /// <summary>
        /// 获取代码生成日志详情
        /// </summary>
        Task<GenerationLogDetailDto> GetGenerationLogDetailAsync(Guid id);

        /// <summary>
        /// 获取代码生成日志的完整追踪（所有关联日志）
        /// </summary>
        Task<GenerationLogTraceDto> GetGenerationLogTraceAsync(string requestId);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 详细日志查询
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 分页查询详细日志
        /// </summary>
        Task<PagedResultDto<DetailedLogDto>> GetDetailedLogsAsync(
            GetDetailedLogsInput input
        );

        /// <summary>
        /// 根据RequestId获取所有详细日志
        /// </summary>
        Task<List<DetailedLogDto>> GetDetailedLogsByRequestIdAsync(
            string requestId
        );

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // API调用日志查询
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 分页查询API调用日志
        /// </summary>
        Task<PagedResultDto<ApiCallLogDto>> GetApiCallLogsAsync(
            GetApiCallLogsInput input
        );

        /// <summary>
        /// 获取TOP 10慢API
        /// </summary>
        Task<List<SlowApiDto>> GetTop10SlowApisAsync(
            DateTime startTime,
            DateTime endTime
        );

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // SQL查询日志查询
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 分页查询SQL日志
        /// </summary>
        Task<PagedResultDto<SqlQueryLogDto>> GetSqlQueryLogsAsync(
            GetSqlQueryLogsInput input
        );

        /// <summary>
        /// 获取TOP 10慢查询
        /// </summary>
        Task<List<SlowSqlDto>> GetTop10SlowSqlsAsync(
            DateTime startTime,
            DateTime endTime
        );

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 日志统计
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 获取日志统计（按时间）
        /// </summary>
        Task<LogStatisticsByTimeDto> GetLogStatisticsByTimeAsync(
            DateTime startTime,
            DateTime endTime,
            TimeGranularity granularity // Hour/Day/Week/Month
        );

        /// <summary>
        /// 获取日志统计（按级别）
        /// </summary>
        Task<LogStatisticsByLevelDto> GetLogStatisticsByLevelAsync(
            DateTime startTime,
            DateTime endTime
        );

        /// <summary>
        /// 获取日志统计（按模块）
        /// </summary>
        Task<LogStatisticsByModuleDto> GetLogStatisticsByModuleAsync(
            DateTime startTime,
            DateTime endTime
        );

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 日志导出
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 导出日志到Excel
        /// </summary>
        Task<byte[]> ExportLogsToExcelAsync(GetGenerationLogsInput input);

        /// <summary>
        /// 导出日志到CSV
        /// </summary>
        Task<byte[]> ExportLogsToCsvAsync(GetGenerationLogsInput input);
    }

    /// <summary>
    /// 查询输入DTO
    /// </summary>
    public class GetGenerationLogsInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }              // 关键词搜索
        public string RequestId { get; set; }           // 请求ID
        public string ModuleName { get; set; }          // 模块名称
        public string Layer { get; set; }               // 层级筛选
        public string Operation { get; set; }           // 操作类型筛选
        public string Status { get; set; }              // 状态筛选
        public Guid? UserId { get; set; }               // 用户ID筛选
        public DateTime? StartTime { get; set; }        // 开始时间
        public DateTime? EndTime { get; set; }          // 结束时间
        public int? MinDuration { get; set; }           // 最小耗时（慢操作筛选）
    }
}
```

### 2.3 前端界面设计

#### 界面1: 代码生成日志列表

```vue
<template>
  <div class="log-management-container">
    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <!-- 关键词搜索 -->
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.filter"
            placeholder="搜索RequestId、模块名称等"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 层级筛选 -->
        <el-form-item label="层级">
          <el-select v-model="searchForm.layer" clearable placeholder="全部">
            <el-option label="Layer 1" value="Layer1" />
            <el-option label="Layer 2" value="Layer2" />
            <el-option label="Layer 3" value="Layer3" />
            <el-option label="微服务" value="Microservice" />
          </el-select>
        </el-form-item>

        <!-- 操作类型筛选 -->
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.operation" clearable placeholder="全部">
            <el-option label="生成" value="Generate" />
            <el-option label="升级" value="Upgrade" />
            <el-option label="验证" value="Validate" />
          </el-select>
        </el-form-item>

        <!-- 状态筛选 -->
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" clearable placeholder="全部">
            <el-option label="已完成" value="Completed" />
            <el-option label="失败" value="Failed" />
            <el-option label="运行中" value="Running" />
          </el-select>
        </el-form-item>

        <!-- 时间范围 -->
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <!-- 慢操作筛选 -->
        <el-form-item>
          <el-checkbox v-model="searchForm.onlySlowOps">
            只显示慢操作（>30秒）
          </el-checkbox>
        </el-form-item>

        <!-- 按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button type="success" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 日志列表 -->
    <el-card class="table-card">
      <el-table
        :data="dataList"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column type="index" label="#" width="50" />

        <el-table-column prop="requestId" label="请求ID" width="180">
          <template #default="{ row }">
            <el-link type="primary" @click.stop="viewTrace(row.requestId)">
              {{ row.requestId }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column prop="moduleName" label="模块名称" width="150" />

        <el-table-column prop="layer" label="层级" width="100">
          <template #default="{ row }">
            <el-tag :type="getLayerType(row.layer)">
              {{ row.layer }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="operation" label="操作" width="100" />

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="startTime" label="开始时间" width="180" />

        <el-table-column prop="duration" label="耗时" width="100">
          <template #default="{ row }">
            <span :class="{ 'slow-operation': row.duration > 30000 }">
              {{ formatDuration(row.duration) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="filesGenerated" label="生成文件" width="100" />
        <el-table-column prop="linesGenerated" label="生成代码" width="100">
          <template #default="{ row }">
            {{ row.linesGenerated }} 行
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click.stop="viewDetail(row)"
            >
              详情
            </el-button>
            <el-button
              type="success"
              size="small"
              link
              @click.stop="viewTrace(row.requestId)"
            >
              追踪
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { logManagementApi } from '@/api/log-management'
import { ElMessage } from 'element-plus'
import type { GenerationLogDto } from '@/types/log-management'

// 搜索表单
const searchForm = reactive({
  filter: '',
  layer: '',
  operation: '',
  status: '',
  onlySlowOps: false
})

const dateRange = ref<[string, string]>([])

// 数据列表
const dataList = ref<GenerationLogDto[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const result = await logManagementApi.getGenerationLogs({
      ...searchForm,
      startTime: dateRange.value?.[0],
      endTime: dateRange.value?.[1],
      minDuration: searchForm.onlySlowOps ? 30000 : undefined,
      skipCount: (pagination.current - 1) * pagination.pageSize,
      maxResultCount: pagination.pageSize
    })

    dataList.value = result.items
    pagination.total = result.totalCount
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    filter: '',
    layer: '',
    operation: '',
    status: '',
    onlySlowOps: false
  })
  dateRange.value = []
  handleSearch()
}

// 导出
const handleExport = async () => {
  try {
    const data = await logManagementApi.exportLogsToExcel({
      ...searchForm,
      startTime: dateRange.value?.[0],
      endTime: dateRange.value?.[1]
    })

    // 下载文件
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `代码生成日志_${new Date().getTime()}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 查看详情
const viewDetail = (row: GenerationLogDto) => {
  // 打开详情弹窗
  // 实现略
}

// 查看追踪
const viewTrace = (requestId: string) => {
  // 打开追踪弹窗，显示完整的调用链
  // 实现略
}

// 格式化耗时
const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  return `${(ms / 60000).toFixed(2)}min`
}

// 获取层级标签类型
const getLayerType = (layer: string) => {
  const types = {
    Layer1: 'info',
    Layer2: 'success',
    Layer3: 'warning',
    Microservice: 'danger'
  }
  return types[layer] || 'info'
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  const types = {
    Completed: 'success',
    Failed: 'danger',
    Running: 'warning'
  }
  return types[status] || 'info'
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.log-management-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.slow-operation {
  color: #f56c6c;
  font-weight: bold;
}
</style>
```

---

## 📈 第三部分：模块2 - 性能监控系统

### 3.1 数据库表设计

```sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 表1: 性能指标表（PerformanceMetrics）
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE [dbo].[PerformanceMetrics] (
    [Id] BIGINT PRIMARY KEY IDENTITY(1,1),
    [Timestamp] DATETIME2 NOT NULL,              -- 时间戳
    [MetricType] NVARCHAR(50) NOT NULL,          -- 指标类型（Cpu/Memory/Disk/Network/Request）
    [MetricName] NVARCHAR(100) NOT NULL,         -- 指标名称
    [Value] DECIMAL(18, 4) NOT NULL,             -- 指标值
    [Unit] NVARCHAR(20) NOT NULL,                -- 单位（%, MB, ms等）
    [ServerName] NVARCHAR(100) NULL,             -- 服务器名称
    [ServiceName] NVARCHAR(100) NULL,            -- 服务名称

    INDEX [IX_Timestamp] ([Timestamp] DESC),
    INDEX [IX_MetricType] ([MetricType]),
    INDEX [IX_MetricName] ([MetricName])
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 表2: API性能指标表（ApiPerformanceMetrics）
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE [dbo].[ApiPerformanceMetrics] (
    [Id] BIGINT PRIMARY KEY IDENTITY(1,1),
    [ApiName] NVARCHAR(200) NOT NULL,            -- API名称
    [CallCount] INT NOT NULL,                    -- 调用次数
    [SuccessCount] INT NOT NULL,                 -- 成功次数
    [FailureCount] INT NOT NULL,                 -- 失败次数
    [AvgDuration] INT NOT NULL,                  -- 平均耗时（毫秒）
    [MinDuration] INT NOT NULL,                  -- 最小耗时
    [MaxDuration] INT NOT NULL,                  -- 最大耗时
    [P50] INT NOT NULL,                          -- P50百分位
    [P95] INT NOT NULL,                          -- P95百分位
    [P99] INT NOT NULL,                          -- P99百分位
    [TimeWindow] DATETIME2 NOT NULL,             -- 时间窗口

    INDEX [IX_ApiName] ([ApiName]),
    INDEX [IX_TimeWindow] ([TimeWindow] DESC)
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 表3: SQL性能指标表（SqlPerformanceMetrics）
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE [dbo].[SqlPerformanceMetrics] (
    [Id] BIGINT PRIMARY KEY IDENTITY(1,1),
    [SqlHash] NVARCHAR(100) NOT NULL,            -- SQL哈希（用于分组）
    [SqlTemplate] NVARCHAR(MAX) NOT NULL,        -- SQL模板（参数化）
    [ExecutionCount] INT NOT NULL,               -- 执行次数
    [TotalDuration] BIGINT NOT NULL,             -- 总耗时（毫秒）
    [AvgDuration] INT NOT NULL,                  -- 平均耗时
    [MinDuration] INT NOT NULL,                  -- 最小耗时
    [MaxDuration] INT NOT NULL,                  -- 最大耗时
    [TotalRowCount] BIGINT NOT NULL,             -- 总行数
    [AvgRowCount] INT NOT NULL,                  -- 平均行数
    [TimeWindow] DATETIME2 NOT NULL,             -- 时间窗口

    INDEX [IX_SqlHash] ([SqlHash]),
    INDEX [IX_AvgDuration] ([AvgDuration] DESC),
    INDEX [IX_TimeWindow] ([TimeWindow] DESC)
);
```

### 3.2 实时监控数据采集

```csharp
namespace SmartAbp.Performance.Monitoring
{
    /// <summary>
    /// 实时性能监控服务
    /// </summary>
    public class RealTimePerformanceMonitor : BackgroundService
    {
        private readonly IMetricRepository _metricRepository;
        private readonly IDistributedCache<PerformanceSnapshot> _cache;
        private readonly IHubContext<PerformanceHub> _hubContext;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                // 每5秒采集一次性能指标
                await CollectAndBroadcastMetricsAsync();

                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }

        private async Task CollectAndBroadcastMetricsAsync()
        {
            // 采集系统指标
            var snapshot = new PerformanceSnapshot
            {
                Timestamp = DateTime.UtcNow,
                CpuUsage = GetCpuUsage(),
                MemoryUsage = GetMemoryUsage(),
                DiskIo = GetDiskIo(),
                NetworkIo = GetNetworkIo(),
                RequestQps = GetRequestQps(),
                AvgResponseTime = GetAvgResponseTime(),
                ErrorRate = GetErrorRate()
            };

            // 存储到Redis（实时数据）
            await _cache.SetAsync(
                "perf:realtime",
                snapshot,
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                }
            );

            // 存储到数据库（历史数据）
            await _metricRepository.InsertManyAsync(new[]
            {
                new PerformanceMetric { MetricType = "Cpu", Value = snapshot.CpuUsage },
                new PerformanceMetric { MetricType = "Memory", Value = snapshot.MemoryUsage },
                // ... 其他指标
            });

            // 通过SignalR实时推送给前端
            await _hubContext.Clients.All.SendAsync(
                "PerformanceSnapshot",
                snapshot
            );
        }

        private double GetCpuUsage()
        {
            // 使用System.Diagnostics.PerformanceCounter
            // 或 System.Diagnostics.Process
            return Process.GetCurrentProcess().TotalProcessorTime.TotalMilliseconds;
        }

        private double GetMemoryUsage()
        {
            return Process.GetCurrentProcess().WorkingSet64 / 1024.0 / 1024.0; // MB
        }
    }

    /// <summary>
    /// SignalR Hub（实时推送）
    /// </summary>
    public class PerformanceHub : Hub
    {
        public async Task SubscribeToRealTimeMetrics()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "RealTimeMetrics");
        }

        public async Task UnsubscribeFromRealTimeMetrics()
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "RealTimeMetrics");
        }
    }
}
```

### 3.3 前端实时监控界面

```vue
<template>
  <div class="performance-monitoring">
    <!-- 实时仪表盘 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <template #header>
            <span>CPU使用率</span>
          </template>
          <div ref="cpuChart" class="chart-container"></div>
          <div class="metric-value">
            {{ realTimeMetrics.cpuUsage.toFixed(2) }}%
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card>
          <template #header>
            <span>内存使用率</span>
          </template>
          <div ref="memoryChart" class="chart-container"></div>
          <div class="metric-value">
            {{ realTimeMetrics.memoryUsage.toFixed(2) }}%
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card>
          <template #header>
            <span>请求QPS</span>
          </template>
          <div ref="qpsChart" class="chart-container"></div>
          <div class="metric-value">
            {{ realTimeMetrics.requestQps }}
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card>
          <template #header>
            <span>平均响应时间</span>
          </template>
          <div ref="responseTimeChart" class="chart-container"></div>
          <div class="metric-value">
            {{ realTimeMetrics.avgResponseTime }}ms
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 性能趋势图 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <span>性能趋势（最近1小时）</span>
      </template>
      <div ref="trendChart" style="height: 400px;"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import * as signalR from '@microsoft/signalr'
import type { ECOption } from 'echarts'

// 实时指标
const realTimeMetrics = reactive({
  cpuUsage: 0,
  memoryUsage: 0,
  requestQps: 0,
  avgResponseTime: 0
})

// SignalR连接
let connection: signalR.HubConnection

// ECharts实例
let cpuChart: echarts.ECharts
let memoryChart: echarts.ECharts
let qpsChart: echarts.ECharts
let responseTimeChart: echarts.ECharts
let trendChart: echarts.ECharts

// 趋势数据
const trendData = reactive({
  timestamps: [] as string[],
  cpuData: [] as number[],
  memoryData: [] as number[],
  qpsData: [] as number[],
  responseTimeData: [] as number[]
})

// 初始化SignalR
const initSignalR = async () => {
  connection = new signalR.HubConnectionBuilder()
    .withUrl('/hubs/performance')
    .withAutomaticReconnect()
    .build()

  connection.on('PerformanceSnapshot', (snapshot) => {
    // 更新实时指标
    Object.assign(realTimeMetrics, snapshot)

    // 更新趋势数据
    const time = new Date(snapshot.timestamp).toLocaleTimeString()
    trendData.timestamps.push(time)
    trendData.cpuData.push(snapshot.cpuUsage)
    trendData.memoryData.push(snapshot.memoryUsage)
    trendData.qpsData.push(snapshot.requestQps)
    trendData.responseTimeData.push(snapshot.avgResponseTime)

    // 只保留最近1小时的数据（720个数据点，每5秒一个）
    if (trendData.timestamps.length > 720) {
      trendData.timestamps.shift()
      trendData.cpuData.shift()
      trendData.memoryData.shift()
      trendData.qpsData.shift()
      trendData.responseTimeData.shift()
    }

    // 更新图表
    updateCharts()
  })

  await connection.start()
  await connection.invoke('SubscribeToRealTimeMetrics')
}

// 初始化ECharts
const initCharts = () => {
  cpuChart = echarts.init(cpuChartRef.value)
  memoryChart = echarts.init(memoryChartRef.value)
  qpsChart = echarts.init(qpsChartRef.value)
  responseTimeChart = echarts.init(responseTimeChartRef.value)
  trendChart = echarts.init(trendChartRef.value)

  // 仪表盘配置
  const gaugeOption = (value: number, max: number): ECOption => ({
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max,
      splitNumber: 4,
      axisLine: {
        lineStyle: {
          width: 6,
          color: [
            [0.25, '#7CFFB2'],
            [0.5, '#58D9F9'],
            [0.75, '#FDDD60'],
            [1, '#FF6E76']
          ]
        }
      },
      pointer: {
        icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
        length: '12%',
        width: 20,
        offsetCenter: [0, '-60%'],
        itemStyle: {
          color: 'auto'
        }
      },
      axisTick: {
        length: 12,
        lineStyle: {
          color: 'auto',
          width: 2
        }
      },
      splitLine: {
        length: 20,
        lineStyle: {
          color: 'auto',
          width: 5
        }
      },
      detail: {
        show: false
      },
      data: [{
        value
      }]
    }]
  })

  // 设置初始配置
  cpuChart.setOption(gaugeOption(0, 100))
  memoryChart.setOption(gaugeOption(0, 100))
  qpsChart.setOption(gaugeOption(0, 1000))
  responseTimeChart.setOption(gaugeOption(0, 5000))

  // 趋势图配置
  trendChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['CPU', '内存', 'QPS', '响应时间']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.timestamps
    },
    yAxis: [
      {
        type: 'value',
        name: 'CPU/内存(%)',
        position: 'left'
      },
      {
        type: 'value',
        name: 'QPS',
        position: 'right'
      },
      {
        type: 'value',
        name: '响应时间(ms)',
        position: 'right',
        offset: 80
      }
    ],
    series: [
      {
        name: 'CPU',
        type: 'line',
        data: trendData.cpuData
      },
      {
        name: '内存',
        type: 'line',
        data: trendData.memoryData
      },
      {
        name: 'QPS',
        type: 'line',
        yAxisIndex: 1,
        data: trendData.qpsData
      },
      {
        name: '响应时间',
        type: 'line',
        yAxisIndex: 2,
        data: trendData.responseTimeData
      }
    ]
  })
}

// 更新图表
const updateCharts = () => {
  cpuChart.setOption({
    series: [{
      data: [{ value: realTimeMetrics.cpuUsage }]
    }]
  })

  memoryChart.setOption({
    series: [{
      data: [{ value: realTimeMetrics.memoryUsage }]
    }]
  })

  qpsChart.setOption({
    series: [{
      data: [{ value: realTimeMetrics.requestQps }]
    }]
  })

  responseTimeChart.setOption({
    series: [{
      data: [{ value: realTimeMetrics.avgResponseTime }]
    }]
  })

  trendChart.setOption({
    xAxis: {
      data: trendData.timestamps
    },
    series: [
      { data: trendData.cpuData },
      { data: trendData.memoryData },
      { data: trendData.qpsData },
      { data: trendData.responseTimeData }
    ]
  })
}

onMounted(async () => {
  initCharts()
  await initSignalR()
})

onUnmounted(async () => {
  if (connection) {
    await connection.invoke('UnsubscribeFromRealTimeMetrics')
    await connection.stop()
  }

  cpuChart?.dispose()
  memoryChart?.dispose()
  qpsChart?.dispose()
  responseTimeChart?.dispose()
  trendChart?.dispose()
})
</script>
```

---

由于篇幅限制，后台管理系统设计文档还有第四部分（模块3-告警管理）、第五部分（模块4-定时任务）、第六部分（模块5-消息队列）和第七部分（实施计划）。

**立即继续编写后续内容，还是先更新TODO查看进度？**
