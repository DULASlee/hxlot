# Phase 2: Dashboard生成器开发方案

**项目**: SmartAbp低代码引擎平台扩展
**阶段**: Phase 2 - 数字大屏代码生成器开发
**工期**: 2周（10个工作日）
**负责人**: 前端架构师 + 2名前端开发
**依赖**: Phase 1（核心架构重构）已完成
**文档版本**: v1.0
**更新日期**: 2025-10-21

---

## 📋 一、项目背景和目标

### 1.1 业务场景

**目标项目**：
- MES（制造执行系统）数字大屏
- 智慧工地数字大屏

**核心需求**：
- **MES大屏**：实时PLC数据展示、产线生产数据监控、设备状态监控
- **智慧工地大屏**：实时视频监控、塔吊数据、升降机数据、扬尘监测

### 1.2 技术挑战

**数字大屏 vs 传统Web系统差异**：

| 维度 | 传统Web CRUD | 数字大屏 | 差异程度 |
|------|-------------|---------|---------|
| **UI模式** | 表单+表格+对话框 | 大屏布局+图表+KPI卡片 | ⭐⭐⭐⭐⭐ 极高 |
| **数据流** | HTTP请求（CRUD） | WebSocket实时推送 | ⭐⭐⭐⭐⭐ 极高 |
| **业务逻辑** | 增删改查 | 实时监控+数据聚合+告警 | ⭐⭐⭐⭐⭐ 极高 |
| **组件库** | Element Plus | ECharts + 自定义大屏组件 | ⭐⭐⭐⭐⭐ 极高 |
| **布局** | 响应式栅格 | 固定分辨率大屏（1920×1080） | ⭐⭐⭐⭐ 高 |
| **交互** | 点击、表单输入 | 观看、自动刷新 | ⭐⭐⭐ 中 |

### 1.3 Phase 2目标

**核心目标**：
1. ✅ 开发DashboardGenerator（继承BaseFrontendGenerator）
2. ✅ 创建数字大屏模板库（通用模板 + 行业模板）
3. ✅ 支持实时数据流（WebSocket客户端生成）
4. ✅ 支持MES和智慧工地两类行业模板

**成功标准**：
- 生成的大屏代码质量≥95分
- 实时数据对接成功（WebSocket）
- 支持自定义大屏布局
- 为实际项目（MES/智慧工地）提供可用代码

---

## 🏗️ 二、技术架构设计

### 2.1 DashboardGenerator架构

```
DashboardGenerator（继承BaseFrontendGenerator）
├── GenerateDashboardLayoutAsync()      ← 生成大屏布局
├── GenerateKPICardAsync()              ← 生成KPI指标卡片
├── GenerateRealtimeChartAsync()        ← 生成实时图表
├── GenerateWebSocketClientAsync()      ← 生成WebSocket客户端
├── GenerateRealtimeStoreAsync()        ← 生成实时数据Store
└── GenerateDataAggregatorAsync()       ← 生成数据聚合器
```

### 2.2 模板结构

**通用模板**（适用所有大屏）：
```
templates/dashboard/
├── layout.hbs                    ← 大屏布局（全屏、网格）
├── kpi-card.hbs                  ← KPI指标卡片
├── realtime-chart.hbs            ← 实时图表（ECharts）
├── websocket-client.hbs          ← WebSocket客户端
├── realtime-store.hbs            ← 实时数据Store
└── data-aggregator.hbs           ← 数据聚合器
```

**行业模板**（特定行业）：
```
templates/dashboard/industries/
├── mes/
│   ├── plc-monitor.hbs           ← PLC数据监控
│   ├── production-line.hbs       ← 产线监控
│   └── equipment-status.hbs      ← 设备状态
└── smart-construction/
    ├── video-surveillance.hbs    ← 视频监控
    ├── tower-crane.hbs           ← 塔吊数据
    ├── elevator.hbs              ← 升降机数据
    └── dust-monitoring.hbs       ← 扬尘监测
```

### 2.3 数据流架构

```
[后端SignalR Hub] → WebSocket → [前端WebSocket Client]
                                        ↓
                            [Realtime Store（Pinia）]
                                        ↓
                        ┌───────────────┴───────────────┐
                        ↓                               ↓
                  [KPI Card]                    [Realtime Chart]
                    实时更新                        实时更新
```

---

## 💻 三、核心组件实现

### 3.1 DashboardGenerator.cs

```csharp
// src/SmartAbp.DevKit.Core/Generators/DashboardGenerator.cs
namespace SmartAbp.DevKit.Core.Generators
{
    public class DashboardGenerator : BaseFrontendGenerator
    {
        public override string Name => "DashboardGenerator";
        public override string Description => "生成数字大屏代码（Vue3 + ECharts + WebSocket）";
        public override TargetPlatform Platform => TargetPlatform.Dashboard;
        
        public DashboardGenerator(
            UnifiedMetadataSDK metadataSDK,
            ITemplateEngine templateEngine,
            PlatformAdapter platformAdapter,
            ILogger<DashboardGenerator> logger)
            : base(metadataSDK, templateEngine, platformAdapter, logger)
        {
        }
        
        public override async Task<GenerationResult> GenerateAsync(
            GenerationContext context,
            CancellationToken cancellationToken = default)
        {
            Logger.LogInformation("开始生成Dashboard代码，实体：{EntityName}", context.EntityName);
            
            var result = new GenerationResult();
            var metadata = await MetadataSDK.GetEntityMetadataAsync(context.EntityName);
            
            // 1. 生成大屏布局
            result.GeneratedFiles.Add(await GenerateDashboardLayoutAsync(metadata));
            
            // 2. 生成KPI卡片组件
            result.GeneratedFiles.Add(await GenerateKPICardAsync(metadata));
            
            // 3. 生成实时图表组件
            result.GeneratedFiles.Add(await GenerateRealtimeChartAsync(metadata));
            
            // 4. 生成WebSocket客户端
            result.GeneratedFiles.Add(await GenerateWebSocketClientAsync(metadata));
            
            // 5. 生成实时数据Store
            result.GeneratedFiles.Add(await GenerateRealtimeStoreAsync(metadata));
            
            // 6. 生成数据聚合器（可选）
            if (context.Options.ContainsKey("EnableDataAggregator"))
            {
                result.GeneratedFiles.Add(await GenerateDataAggregatorAsync(metadata));
            }
            
            Logger.LogInformation("完成Dashboard代码生成，文件数：{FileCount}",
                result.GeneratedFiles.Count);
            
            return result;
        }
        
        /// <summary>
        /// 生成大屏布局（覆盖基类方法）
        /// </summary>
        protected override async Task<GeneratedFile> GenerateListPageAsync(EntityMetadata metadata)
        {
            return await GenerateDashboardLayoutAsync(metadata);
        }
        
        /// <summary>
        /// 大屏不需要API客户端（使用WebSocket）
        /// </summary>
        protected override Task<GeneratedFile> GenerateApiClientAsync(EntityMetadata metadata)
        {
            return GenerateWebSocketClientAsync(metadata);
        }
        
        /// <summary>
        /// 生成实时数据Store（覆盖基类方法）
        /// </summary>
        protected override Task<GeneratedFile> GenerateStoreAsync(EntityMetadata metadata)
        {
            return GenerateRealtimeStoreAsync(metadata);
        }
        
        /// <summary>
        /// 大屏不需要表单对话框
        /// </summary>
        protected override bool ShouldGenerateFormDialog(EntityMetadata metadata) => false;
        
        /// <summary>
        /// 大屏不需要详情对话框
        /// </summary>
        protected override bool ShouldGenerateDetailDialog(EntityMetadata metadata) => false;
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Dashboard特有生成方法
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        
        private async Task<GeneratedFile> GenerateDashboardLayoutAsync(EntityMetadata metadata)
        {
            var content = await PlatformAdapter.GenerateFrontendCodeAsync(
                Platform,
                metadata,
                "DashboardLayout"
            );
            
            return new GeneratedFile
            {
                Path = $"dashboards/{metadata.NameKebab}-dashboard.vue",
                Content = content,
                FileType = FileType.DashboardVue,
                Description = "数字大屏布局组件"
            };
        }
        
        private async Task<GeneratedFile> GenerateKPICardAsync(EntityMetadata metadata)
        {
            var content = await PlatformAdapter.GenerateFrontendCodeAsync(
                Platform,
                metadata,
                "KPICard"
            );
            
            return new GeneratedFile
            {
                Path = $"dashboards/components/{metadata.NameKebab}-kpi-card.vue",
                Content = content,
                FileType = FileType.Vue,
                Description = "KPI指标卡片组件"
            };
        }
        
        private async Task<GeneratedFile> GenerateRealtimeChartAsync(EntityMetadata metadata)
        {
            var content = await PlatformAdapter.GenerateFrontendCodeAsync(
                Platform,
                metadata,
                "RealtimeChart"
            );
            
            return new GeneratedFile
            {
                Path = $"dashboards/components/{metadata.NameKebab}-chart.vue",
                Content = content,
                FileType = FileType.Vue,
                Description = "实时图表组件"
            };
        }
        
        private async Task<GeneratedFile> GenerateWebSocketClientAsync(EntityMetadata metadata)
        {
            var content = await PlatformAdapter.GenerateFrontendCodeAsync(
                Platform,
                metadata,
                "WebSocketClient"
            );
            
            return new GeneratedFile
            {
                Path = $"composables/use-{metadata.NameKebab}-websocket.ts",
                Content = content,
                FileType = FileType.TypeScript,
                Description = "WebSocket客户端"
            };
        }
        
        private async Task<GeneratedFile> GenerateRealtimeStoreAsync(EntityMetadata metadata)
        {
            var content = await PlatformAdapter.GenerateFrontendCodeAsync(
                Platform,
                metadata,
                "RealtimeStore"
            );
            
            return new GeneratedFile
            {
                Path = $"stores/{metadata.NameKebab}-realtime-store.ts",
                Content = content,
                FileType = FileType.TypeScript,
                Description = "实时数据Store"
            };
        }
        
        private async Task<GeneratedFile> GenerateDataAggregatorAsync(EntityMetadata metadata)
        {
            var content = await TemplateEngine.RenderAsync(
                "templates/dashboard/data-aggregator.hbs",
                metadata
            );
            
            return new GeneratedFile
            {
                Path = $"utils/{metadata.NameKebab}-aggregator.ts",
                Content = content,
                FileType = FileType.TypeScript,
                Description = "数据聚合器"
            };
        }
    }
}
```

### 3.2 模板示例

#### 3.2.1 大屏布局模板（layout.hbs）

```handlebars
{{!-- templates/dashboard/layout.hbs --}}
<template>
  <div class="dashboard-container" :style="containerStyle">
    <!-- 标题栏 -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">{{DisplayName}}实时监控大屏</h1>
      <div class="dashboard-time">{{ currentTime }}</div>
    </div>
    
    <!-- KPI指标区 -->
    <div class="kpi-section">
      <div class="kpi-grid">
        {{#each KPIFields}}
        <{{../EntityName}}KPICard
          :title="'{{DisplayName}}'"
          :value="realtimeData.{{Name}}"
          :unit="'{{Unit}}'"
          :trend="trendData.{{Name}}"
        />
        {{/each}}
      </div>
    </div>
    
    <!-- 图表区 -->
    <div class="chart-section">
      <el-row :gutter="20">
        {{#each ChartFields}}
        <el-col :span="{{Span}}">
          <div class="chart-panel">
            <h3 class="chart-title">{{DisplayName}}</h3>
            <{{../EntityName}}Chart
              chart-id="{{Name}}-chart"
              :chart-data="realtimeData.{{Name}}History"
              :update-interval="1000"
            />
          </div>
        </el-col>
        {{/each}}
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { use{{EntityName}}RealtimeStore } from '@/stores/{{EntityNameKebab}}-realtime-store'
import { use{{EntityName}}WebSocket } from '@/composables/use-{{EntityNameKebab}}-websocket'
import {{EntityName}}KPICard from './components/{{EntityNameKebab}}-kpi-card.vue'
import {{EntityName}}Chart from './components/{{EntityNameKebab}}-chart.vue'

// 实时数据Store
const store = use{{EntityName}}RealtimeStore()

// WebSocket连接
const { connect, disconnect, on } = use{{EntityName}}WebSocket()

// 当前时间
const currentTime = ref('')
const updateTime = () => {
  currentTime.value = new Date().toLocaleString('zh-CN')
}

// 容器样式（固定1920×1080）
const containerStyle = computed(() => ({
  width: '1920px',
  height: '1080px',
  transform: `scale(${Math.min(window.innerWidth / 1920, window.innerHeight / 1080)})`,
  transformOrigin: 'top left'
}))

// 实时数据
const realtimeData = computed(() => store.realtimeData)
const trendData = computed(() => store.trendData)

onMounted(async () => {
  // 加载初始数据
  await store.loadInitialData()
  
  // 连接WebSocket
  connect()
  
  // 监听实时数据更新
  on('{{EntityNameKebab}}-update', (data) => {
    store.updateRealtimeData(data)
  })
  
  // 启动时间更新
  const timer = setInterval(updateTime, 1000)
  onUnmounted(() => clearInterval(timer))
})

onUnmounted(() => {
  disconnect()
})

updateTime()
</script>

<style scoped>
.dashboard-container {
  background: linear-gradient(135deg, #0c1e35 0%, #1a3a52 100%);
  color: #fff;
  font-family: 'Microsoft YaHei', sans-serif;
  overflow: hidden;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid #00d4ff;
}

.dashboard-title {
  font-size: 36px;
  font-weight: bold;
  background: linear-gradient(90deg, #00d4ff, #00ffc8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dashboard-time {
  font-size: 24px;
  color: #00d4ff;
}

.kpi-section {
  padding: 20px 40px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.chart-section {
  padding: 20px 40px;
}

.chart-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #00d4ff;
  border-radius: 8px;
  padding: 20px;
  height: 400px;
}

.chart-title {
  font-size: 20px;
  color: #00d4ff;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
  padding-bottom: 10px;
}
</style>
```

#### 3.2.2 WebSocket客户端模板（websocket-client.hbs）

```handlebars
{{!-- templates/dashboard/websocket-client.hbs --}}
// composables/use-{{EntityNameKebab}}-websocket.ts
import { ref, onUnmounted } from 'vue'
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr'

export function use{{EntityName}}WebSocket() {
  const connection = ref<HubConnection | null>(null)
  const isConnected = ref(false)
  const error = ref<string | null>(null)
  
  const connect = async () => {
    try {
      connection.value = new HubConnectionBuilder()
        .withUrl('/hubs/{{EntityNameKebab}}')
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build()
      
      await connection.value.start()
      isConnected.value = true
      
      console.log('[WebSocket] 连接成功：{{EntityName}}')
      
      // 订阅实时数据
      connection.value.on('{{EntityNameKebab}}-update', (data) => {
        console.log('[WebSocket] 收到数据更新', data)
      })
      
      // 连接断开处理
      connection.value.onreconnecting(() => {
        console.warn('[WebSocket] 正在重连...')
        isConnected.value = false
      })
      
      connection.value.onreconnected(() => {
        console.log('[WebSocket] 重连成功')
        isConnected.value = true
      })
      
      connection.value.onclose((error) => {
        console.error('[WebSocket] 连接关闭', error)
        isConnected.value = false
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      console.error('[WebSocket] 连接失败', err)
    }
  }
  
  const disconnect = async () => {
    if (connection.value) {
      await connection.value.stop()
      isConnected.value = false
      console.log('[WebSocket] 连接已断开')
    }
  }
  
  const on = (eventName: string, callback: (data: any) => void) => {
    connection.value?.on(eventName, callback)
  }
  
  const off = (eventName: string) => {
    connection.value?.off(eventName)
  }
  
  const invoke = async (methodName: string, ...args: any[]) => {
    if (!connection.value || !isConnected.value) {
      throw new Error('WebSocket未连接')
    }
    return await connection.value.invoke(methodName, ...args)
  }
  
  onUnmounted(() => {
    disconnect()
  })
  
  return {
    connect,
    disconnect,
    on,
    off,
    invoke,
    isConnected,
    error
  }
}
```

#### 3.2.3 实时数据Store模板（realtime-store.hbs）

```handlebars
{{!-- templates/dashboard/realtime-store.hbs --}}
// stores/{{EntityNameKebab}}-realtime-store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { {{EntityName}}RealtimeData } from '@/types/{{EntityNameKebab}}.types'

export const use{{EntityName}}RealtimeStore = defineStore('{{EntityNameKebab}}-realtime', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 状态
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const realtimeData = ref<{{EntityName}}RealtimeData>({
    {{#each Fields}}
    {{Name}}: {{DefaultValue}},
    {{Name}}History: [],
    {{/each}}
  })
  
  const trendData = ref<Record<string, 'up' | 'down' | 'stable'>>({})
  
  const lastUpdateTime = ref<Date | null>(null)
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 计算属性
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const isDataFresh = computed(() => {
    if (!lastUpdateTime.value) return false
    const now = new Date()
    const diff = now.getTime() - lastUpdateTime.value.getTime()
    return diff < 5000 // 5秒内的数据认为是新鲜的
  })
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 操作
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 加载初始数据
   */
  const loadInitialData = async () => {
    try {
      // TODO: 从后端API加载初始数据
      // const response = await get{{EntityName}}RealtimeData()
      // realtimeData.value = response.data
    } catch (error) {
      console.error('加载初始数据失败', error)
    }
  }
  
  /**
   * 更新实时数据（WebSocket推送）
   */
  const updateRealtimeData = (newData: Partial<{{EntityName}}RealtimeData>) => {
    {{#each Fields}}
    if (newData.{{Name}} !== undefined) {
      // 计算趋势
      const oldValue = realtimeData.value.{{Name}}
      const newValue = newData.{{Name}}
      
      if (newValue > oldValue) {
        trendData.value.{{Name}} = 'up'
      } else if (newValue < oldValue) {
        trendData.value.{{Name}} = 'down'
      } else {
        trendData.value.{{Name}} = 'stable'
      }
      
      // 更新值
      realtimeData.value.{{Name}} = newValue
      
      // 更新历史数据（保留最近100个点）
      realtimeData.value.{{Name}}History.push({
        time: new Date(),
        value: newValue
      })
      
      if (realtimeData.value.{{Name}}History.length > 100) {
        realtimeData.value.{{Name}}History.shift()
      }
    }
    {{/each}}
    
    lastUpdateTime.value = new Date()
  }
  
  /**
   * 重置数据
   */
  const reset = () => {
    realtimeData.value = {
      {{#each Fields}}
      {{Name}}: {{DefaultValue}},
      {{Name}}History: [],
      {{/each}}
    }
    trendData.value = {}
    lastUpdateTime.value = null
  }
  
  return {
    // 状态
    realtimeData,
    trendData,
    lastUpdateTime,
    
    // 计算属性
    isDataFresh,
    
    // 操作
    loadInitialData,
    updateRealtimeData,
    reset
  }
})
```

---

## 📝 四、开发步骤（10天详细计划）

### Week 1：核心生成器开发

#### Day 1-2：DashboardGenerator开发（2天）

**任务清单**：
1. 创建DashboardGenerator.cs（继承BaseFrontendGenerator）
2. 实现所有抽象方法
3. 添加Dashboard特有生成方法
4. 单元测试

**验收标准**：
- ✅ 代码质量≥95分
- ✅ 单元测试覆盖率≥85%
- ✅ 日志记录完整

#### Day 3-4：通用模板开发（2天）

**任务清单**：
1. 创建layout.hbs（大屏布局）
2. 创建kpi-card.hbs（KPI卡片）
3. 创建realtime-chart.hbs（实时图表）
4. 创建websocket-client.hbs（WebSocket客户端）
5. 创建realtime-store.hbs（实时数据Store）

**验收标准**：
- ✅ 模板可正常渲染
- ✅ 生成的代码可编译
- ✅ 生成的代码可运行

#### Day 5：集成测试（1天）

**测试场景**：
1. 生成ProductionLine实体的Dashboard代码
2. 验证生成的代码可编译
3. 验证WebSocket连接正常
4. 验证实时数据更新正常

**验收标准**：
- ✅ TypeScript编译0错误
- ✅ ESLint检查0警告
- ✅ 功能测试通过

---

### Week 2：行业模板开发

#### Day 6-7：MES行业模板（2天）

**任务清单**：
1. 创建plc-monitor.hbs（PLC监控）
2. 创建production-line.hbs（产线监控）
3. 创建equipment-status.hbs（设备状态）
4. 集成ECharts仪表盘、折线图、柱状图

**验收标准**：
- ✅ MES大屏可正常展示
- ✅ PLC数据实时更新
- ✅ 图表渲染正常

#### Day 8-9：智慧工地行业模板（2天）

**任务清单**：
1. 创建video-surveillance.hbs（视频监控）
2. 创建tower-crane.hbs（塔吊数据）
3. 创建elevator.hbs（升降机数据）
4. 创建dust-monitoring.hbs（扬尘监测）

**验收标准**：
- ✅ 智慧工地大屏可正常展示
- ✅ 视频监控集成正常
- ✅ 实时数据更新正常

#### Day 10：完整测试和文档（1天）

**任务清单**：
1. 完整集成测试
2. 性能测试
3. 文档更新
4. 部署指南

**验收标准**：
- ✅ 所有测试通过
- ✅ 文档完整
- ✅ 部署成功

---

## ✅ 五、验收标准

### 5.1 功能验收

| 验收项 | 验收标准 | 验收方式 |
|--------|---------|---------|
| DashboardGenerator | 继承BaseFrontendGenerator，实现所有抽象方法 | 代码审查 |
| 通用模板 | 支持大屏布局、KPI卡片、实时图表、WebSocket | 模板测试 |
| MES模板 | 支持PLC监控、产线监控、设备状态 | 功能测试 |
| 智慧工地模板 | 支持视频监控、塔吊、升降机、扬尘监测 | 功能测试 |
| WebSocket连接 | 实时数据推送正常 | 集成测试 |

### 5.2 质量验收

| 质量指标 | 目标值 | 验收方式 |
|---------|-------|---------|
| 代码质量 | ≥95分 | SonarQube |
| 单元测试覆盖率 | ≥85% | Coverage报告 |
| TypeScript编译 | 0错误 | tsc --noEmit |
| ESLint检查 | 0警告 | eslint --fix |
| 实时数据延迟 | <100ms | 性能测试 |

### 5.3 性能验收

| 性能指标 | 目标值 | 验收方式 |
|---------|-------|---------|
| 大屏首屏加载 | <2秒 | Chrome DevTools |
| WebSocket连接 | <500ms | Network Monitor |
| 实时数据更新 | 60FPS | Performance Monitor |
| 内存占用 | <300MB | Memory Profiler |

---

## 🧪 六、测试方案

### 6.1 单元测试

```csharp
[Fact]
public async Task DashboardGenerator_GenerateDashboardLayout_Success()
{
    // Arrange
    var generator = new DashboardGenerator(_metadataSDK, _templateEngine, 
        _platformAdapter, _logger);
    var context = CreateTestContext();
    
    // Act
    var result = await generator.GenerateAsync(context);
    
    // Assert
    Assert.NotNull(result);
    Assert.True(result.GeneratedFiles.Count >= 5);
    Assert.Contains(result.GeneratedFiles, f => f.Path.Contains("dashboard.vue"));
}
```

### 6.2 集成测试

**测试步骤**：
```bash
# 1. 生成Dashboard代码
dotnet devkit generate -e ProductionLine -p Dashboard

# 2. 编译检查
cd src/SmartAbp.Vue && npm run type-check

# 3. 启动开发服务器
npm run dev

# 4. 启动后端SignalR Hub
cd src/SmartAbp.HttpApi.Host && dotnet run

# 5. 测试WebSocket连接
# 浏览器打开 http://localhost:5173/dashboards/production-line
```

### 6.3 性能测试

**测试指标**：
- 大屏首屏加载时间
- WebSocket连接时间
- 实时数据更新帧率
- 内存占用

---

## 📦 七、交付清单

### 7.1 代码交付

| 文件路径 | 说明 | 状态 |
|---------|------|------|
| `src/SmartAbp.DevKit.Core/Generators/DashboardGenerator.cs` | Dashboard生成器 | ✅ 新增 |
| `templates/dashboard/layout.hbs` | 大屏布局模板 | ✅ 新增 |
| `templates/dashboard/kpi-card.hbs` | KPI卡片模板 | ✅ 新增 |
| `templates/dashboard/realtime-chart.hbs` | 实时图表模板 | ✅ 新增 |
| `templates/dashboard/websocket-client.hbs` | WebSocket客户端模板 | ✅ 新增 |
| `templates/dashboard/realtime-store.hbs` | 实时数据Store模板 | ✅ 新增 |
| `templates/dashboard/industries/mes/*.hbs` | MES行业模板 | ✅ 新增 |
| `templates/dashboard/industries/smart-construction/*.hbs` | 智慧工地模板 | ✅ 新增 |

### 7.2 文档交付

| 文件路径 | 说明 | 状态 |
|---------|------|------|
| `docs/开发方案/Phase2-Dashboard生成器开发方案.md` | 本文档 | ✅ 完成 |
| `docs/使用指南/Dashboard代码生成指南.md` | 使用指南 | ✅ 新增 |
| `docs/模板开发/Dashboard模板开发指南.md` | 模板开发指南 | ✅ 新增 |

---

## 🎯 八、成功指标

- ✅ Dashboard代码生成器完整实现
- ✅ 支持MES和智慧工地两类行业模板
- ✅ WebSocket实时数据推送正常
- ✅ 代码质量≥95分
- ✅ 为实际项目提供可用代码

**Phase 2 完成标志**：
- ✅ 所有代码合并到主分支
- ✅ 所有测试通过
- ✅ 文档完整
- ✅ MES和智慧工地大屏可正常运行

**下一步**：Phase 3 - UniApp生成器开发

