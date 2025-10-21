# 方案B - 优先级2：Portal前端开发详细开发计划

**版本**: v1.0
**日期**: 2025-10-21
**目标**: 构建三层入口Portal页面，提供统一的低代码开发入口

---

## 第1章：项目概述

### 1.1 功能目标

**Portal页面核心功能**：
- 三层入口卡片（Layer1/Layer2/Layer3）
- 最近访问项目列表（最近5个）
- 使用统计数据展示
- 快速跳转到对应开发环境

**用户价值**：
- 新手用户：快速找到Layer1 UltraSimpleStudio
- 中级用户：便捷访问Layer2 SmartStudio Lite
- 高级用户：快速进入Layer3 Studio Pro
- 提升用户体验：一键回到最近项目

### 1.2 技术栈

**前端框架**：
- Vue 3 Composition API
- TypeScript 严格模式
- Element Plus UI组件库

**状态管理**：
- Pinia Store（复用现有ModuleStore）

**API调用**：
- 复用现有`moduleApi`
- 新增三个API方法（增量添加）

---

## 第2章：Portal入口页面开发

### 2.1 开发任务

**任务2.1.1**: 重构LowCodeStudioWelcome.vue
- 保留现有欢迎文案
- 添加三层入口卡片区域
- 添加最近项目区域
- 添加统计数据区域

**任务2.1.2**: 设计页面布局
- 顶部：欢迎横幅
- 中部：三层入口卡片（3列网格）
- 底部：最近项目 + 统计数据（2列布局）

### 2.2 实施步骤

**步骤1**: 分析现有LowCodeStudioWelcome.vue

文件路径：`src/SmartAbp.Vue/src/views/lowcode/LowCodeStudioWelcome.vue`

当前结构：
```vue
<template>
  <div class="welcome-container">
    <el-card>
      <h1>欢迎使用SmartAbp低代码平台</h1>
      <p>功能说明...</p>
    </el-card>
  </div>
</template>
```

**步骤2**: 重构为三区域布局

```vue
<template>
  <div class="portal-container">
    <!-- 区域1：欢迎横幅 -->
    <section class="portal-header">
      <el-card shadow="never">
        <h1>🚀 欢迎使用SmartAbp低代码平台</h1>
        <p class="subtitle">选择适合您的开发模式，快速构建企业级应用</p>
      </el-card>
    </section>

    <!-- 区域2：三层入口卡片 -->
    <section class="portal-entries">
      <el-row :gutter="24">
        <!-- Layer1 卡片 -->
        <el-col :span="8">
          <EntryCard
            title="Layer1: UltraSimple Studio"
            description="零代码配置，5分钟搭建CRUD"
            icon="MagicStick"
            color="#67C23A"
            @click="handleLayerChoice('layer1')"
          />
        </el-col>

        <!-- Layer2 卡片 -->
        <el-col :span="8">
          <EntryCard
            title="Layer2: SmartStudio Lite"
            description="可视化设计，灵活配置字段"
            icon="Setting"
            color="#409EFF"
            @click="handleLayerChoice('layer2')"
          />
        </el-col>

        <!-- Layer3 卡片 -->
        <el-col :span="8">
          <EntryCard
            title="Layer3: Studio Pro"
            description="专家模式，完全自定义"
            icon="Tools"
            color="#E6A23C"
            @click="handleLayerChoice('layer3')"
          />
        </el-col>
      </el-row>
    </section>

    <!-- 区域3：最近项目 + 统计数据 -->
    <section class="portal-info">
      <el-row :gutter="24">
        <!-- 最近项目列表 -->
        <el-col :span="16">
          <RecentProjects :projects="recentProjects" />
        </el-col>

        <!-- 统计数据 -->
        <el-col :span="8">
          <UsageStatistics :stats="statistics" />
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { moduleApi } from '@/api/lowcode/module'
import { ElMessage } from 'element-plus'
import EntryCard from './components/EntryCard.vue'
import RecentProjects from './components/RecentProjects.vue'
import UsageStatistics from './components/UsageStatistics.vue'
import type { ModuleDto, UserChoiceStatsDto } from '@/api/generated/models'

const router = useRouter()
const recentProjects = ref<ModuleDto[]>([])
const statistics = ref<UserChoiceStatsDto | null>(null)

// 获取最近项目
const loadRecentProjects = async () => {
  try {
    recentProjects.value = await moduleApi.getRecentModules(5)
  } catch (error) {
    console.error('加载最近项目失败', error)
  }
}

// 获取统计数据
const loadStatistics = async () => {
  try {
    statistics.value = await moduleApi.getUserChoiceStatistics()
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

// 处理入口选择
const handleLayerChoice = async (choice: string) => {
  try {
    // 记录用户选择
    await moduleApi.recordUserChoice(choice)

    // 跳转到对应页面
    if (choice === 'layer1') {
      router.push('/lowcode/ultra-simple-studio')
    } else if (choice === 'layer2') {
      router.push('/lowcode/smart-studio-lite')
    } else if (choice === 'layer3') {
      router.push('/lowcode/studio-pro')
    }

    ElMessage.success(`已进入${choice}开发模式`)
  } catch (error) {
    ElMessage.error('跳转失败')
  }
}

onMounted(() => {
  loadRecentProjects()
  loadStatistics()
})
</script>

<style scoped lang="scss">
.portal-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.portal-header {
  margin-bottom: 32px;

  h1 {
    font-size: 28px;
    color: #303133;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 14px;
    color: #909399;
  }
}

.portal-entries {
  margin-bottom: 32px;
}

.portal-info {
  margin-top: 32px;
}
</style>
```

**步骤3**: 新增moduleApi方法

文件路径：`src/SmartAbp.Vue/src/api/lowcode/module.ts`

```typescript
// 增量添加以下三个方法

/**
 * 获取最近访问的模块
 * @param count 返回数量，默认5个
 */
export async function getRecentModules(count: number = 5): Promise<ModuleDto[]> {
  const response = await request.get<ModuleDto[]>(`/api/lowcode/modules/recent`, {
    params: { count }
  })
  return response.data
}

/**
 * 记录用户入口选择
 * @param choice layer1/layer2/layer3
 */
export async function recordUserChoice(choice: string): Promise<void> {
  await request.post('/api/lowcode/modules/record-choice', { choice })
}

/**
 * 获取用户选择统计
 */
export async function getUserChoiceStatistics(): Promise<UserChoiceStatsDto> {
  const response = await request.get<UserChoiceStatsDto>('/api/lowcode/modules/statistics')
  return response.data
}
```

### 2.3 验收清单

- [ ] LowCodeStudioWelcome.vue重构完成
- [ ] 页面布局符合设计稿
- [ ] 三个新API方法添加完成
- [ ] TypeScript类型定义完整
- [ ] ESLint检查通过，0错误0警告

---

## 第3章：三层入口卡片实现

### 3.1 开发任务

**任务3.1.1**: 创建EntryCard.vue组件
- 接收props：title、description、icon、color
- 支持点击事件
- 支持悬停动画效果

**任务3.1.2**: 设计卡片样式
- 卡片高度统一200px
- 图标尺寸64px
- 悬停时卡片上浮效果

### 3.2 实施步骤

**步骤1**: 创建组件文件

文件路径：`src/SmartAbp.Vue/src/views/lowcode/components/EntryCard.vue`

```vue
<template>
  <el-card
    class="entry-card"
    :class="{ 'is-hover': isHover }"
    shadow="hover"
    @click="handleClick"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <div class="card-content">
      <!-- 图标 -->
      <div class="icon-wrapper" :style="{ backgroundColor: color }">
        <el-icon :size="64" color="#fff">
          <component :is="icon" />
        </el-icon>
      </div>

      <!-- 标题 -->
      <h3 class="card-title">{{ title }}</h3>

      <!-- 描述 -->
      <p class="card-description">{{ description }}</p>

      <!-- 进入按钮 -->
      <el-button
        type="primary"
        :color="color"
        size="large"
        round
        class="enter-button"
      >
        立即进入
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title: string
  description: string
  icon: string
  color: string
}>()

const emit = defineEmits<{
  click: []
}>()

const isHover = ref(false)

const handleClick = () => {
  emit('click')
}
</script>

<style scoped lang="scss">
.entry-card {
  height: 280px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &.is-hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }

  .card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 20px;
  }

  .icon-wrapper {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 12px 0 8px;
    text-align: center;
  }

  .card-description {
    font-size: 14px;
    color: #909399;
    text-align: center;
    flex: 1;
    margin-bottom: 16px;
  }

  .enter-button {
    width: 100%;
  }
}
</style>
```

**步骤2**: 注册Element Plus图标

```typescript
// src/SmartAbp.Vue/src/main.ts
import { MagicStick, Setting, Tools } from '@element-plus/icons-vue'

app.component('MagicStick', MagicStick)
app.component('Setting', Setting)
app.component('Tools', Tools)
```

### 3.3 验收清单

- [ ] EntryCard.vue组件创建完成
- [ ] Props类型定义正确
- [ ] 点击事件触发正常
- [ ] 悬停动画效果流畅
- [ ] 样式符合设计规范

---

## 第4章：最近项目功能

### 4.1 开发任务

**任务4.1.1**: 创建RecentProjects.vue组件
- 接收props：projects数组
- 显示项目名称、实体数量、最后修改时间
- 支持点击跳转到项目详情

**任务4.1.2**: 实现空状态提示
- 无最近项目时显示空状态插画
- 引导用户创建新项目

### 4.2 实施步骤

**步骤1**: 创建组件文件

文件路径：`src/SmartAbp.Vue/src/views/lowcode/components/RecentProjects.vue`

```vue
<template>
  <el-card class="recent-projects" shadow="never">
    <template #header>
      <div class="card-header">
        <span class="title">📋 最近访问的项目</span>
        <el-link type="primary" :underline="false" @click="viewAll">
          查看全部 →
        </el-link>
      </div>
    </template>

    <!-- 项目列表 -->
    <el-table
      v-if="projects.length > 0"
      :data="projects"
      style="width: 100%"
      @row-click="handleRowClick"
    >
      <el-table-column prop="name" label="项目名称" width="200">
        <template #default="{ row }">
          <div class="project-name">
            <el-icon><Document /></el-icon>
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="description" label="描述" show-overflow-tooltip />

      <el-table-column label="实体数量" width="100">
        <template #default="{ row }">
          <el-tag size="small">{{ getEntityCount(row) }} 个</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="lastModificationTime" label="最后访问" width="180">
        <template #default="{ row }">
          {{ formatTime(row.lastModificationTime) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            link
            @click.stop="openProject(row)"
          >
            打开项目
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <el-empty
      v-else
      description="暂无最近访问的项目"
      :image-size="120"
    >
      <el-button type="primary" @click="createNewProject">
        创建新项目
      </el-button>
    </el-empty>
  </el-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Document } from '@element-plus/icons-vue'
import type { ModuleDto } from '@/api/generated/models'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

defineProps<{
  projects: ModuleDto[]
}>()

const router = useRouter()

const getEntityCount = (module: ModuleDto) => {
  return module.entities?.length ?? 0
}

const formatTime = (time: string | Date) => {
  return formatDistanceToNow(new Date(time), {
    addSuffix: true,
    locale: zhCN
  })
}

const handleRowClick = (row: ModuleDto) => {
  openProject(row)
}

const openProject = (module: ModuleDto) => {
  router.push(`/lowcode/modules/${module.id}`)
}

const viewAll = () => {
  router.push('/lowcode/modules')
}

const createNewProject = () => {
  router.push('/lowcode/modules/create')
}
</script>

<style scoped lang="scss">
.recent-projects {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .project-name {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon {
      color: #409EFF;
    }
  }

  :deep(.el-table__row) {
    cursor: pointer;

    &:hover {
      background-color: #f5f7fa;
    }
  }
}
</style>
```

**步骤2**: 安装date-fns依赖

```bash
cd src/SmartAbp.Vue
pnpm add date-fns
```

### 4.3 验收清单

- [ ] RecentProjects.vue组件创建完成
- [ ] 项目列表正常显示
- [ ] 时间格式化正确（相对时间）
- [ ] 点击跳转功能正常
- [ ] 空状态显示正确

---

## 第5章：使用统计展示

### 5.1 开发任务

**任务5.1.1**: 创建UsageStatistics.vue组件
- 显示三层入口使用百分比（饼图）
- 显示总模块数、活跃模块数、今日新增

**任务5.1.2**: 集成ECharts图表库
- 安装echarts依赖
- 封装饼图组件

### 5.2 实施步骤

**步骤1**: 安装echarts

```bash
cd src/SmartAbp.Vue
pnpm add echarts
```

**步骤2**: 创建组件文件

文件路径：`src/SmartAbp.Vue/src/views/lowcode/components/UsageStatistics.vue`

```vue
<template>
  <el-card class="usage-statistics" shadow="never">
    <template #header>
      <span class="title">📊 使用统计</span>
    </template>

    <div v-if="stats" class="stats-content">
      <!-- 数据卡片 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalModules }}</div>
          <div class="stat-label">总模块数</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ stats.activeModules }}</div>
          <div class="stat-label">活跃模块</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ stats.todayNewModules }}</div>
          <div class="stat-label">今日新增</div>
        </div>
      </div>

      <!-- 饼图 -->
      <div class="chart-wrapper">
        <div ref="chartRef" class="chart" style="height: 200px;"></div>
      </div>
    </div>

    <el-empty v-else description="暂无统计数据" :image-size="80" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { UserChoiceStatsDto } from '@/api/generated/models'

const props = defineProps<{
  stats: UserChoiceStatsDto | null
}>()

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value || !props.stats) return

  chartInstance = echarts.init(chartRef.value)

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}% ({d}%)'
    },
    legend: {
      bottom: 0,
      left: 'center'
    },
    series: [
      {
        name: '入口使用统计',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: [
          {
            value: props.stats.layer1Percentage,
            name: 'Layer1',
            itemStyle: { color: '#67C23A' }
          },
          {
            value: props.stats.layer2Percentage,
            name: 'Layer2',
            itemStyle: { color: '#409EFF' }
          },
          {
            value: props.stats.layer3Percentage,
            name: 'Layer3',
            itemStyle: { color: '#E6A23C' }
          }
        ]
      }
    ]
  }

  chartInstance.setOption(option)
}

onMounted(() => {
  initChart()
})

watch(() => props.stats, () => {
  initChart()
}, { deep: true })
</script>

<style scoped lang="scss">
.usage-statistics {
  height: 100%;

  .title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .stats-content {
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 24px;

      .stat-card {
        text-align: center;
        padding: 16px;
        background: #f5f7fa;
        border-radius: 8px;

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #409EFF;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .chart-wrapper {
      margin-top: 16px;
    }
  }
}
</style>
```

### 5.3 验收清单

- [ ] UsageStatistics.vue组件创建完成
- [ ] 数据卡片正常显示
- [ ] 饼图渲染正常
- [ ] 图表交互效果流畅
- [ ] 空状态显示正确

---

## 第6章：总验收清单

### 6.1 功能验收

- [ ] Portal页面三区域布局正确
- [ ] 三层入口卡片点击跳转正常
- [ ] 最近项目列表数据加载正常
- [ ] 统计数据饼图显示正常
- [ ] 所有路由跳转功能正常

### 6.2 API验收

- [ ] getRecentModules API调用成功
- [ ] recordUserChoice API调用成功
- [ ] getUserChoiceStatistics API调用成功
- [ ] 后端接口返回数据格式正确

### 6.3 UI/UX验收

- [ ] 页面布局美观，间距合理
- [ ] 卡片悬停动画流畅
- [ ] 响应式布局适配（1920px/1440px/1280px）
- [ ] 空状态提示友好
- [ ] 加载状态处理完善

### 6.4 代码质量验收

- [ ] TypeScript类型定义完整，0 any
- [ ] ESLint检查通过，0错误0警告
- [ ] 组件复用性良好
- [ ] 代码注释完整
- [ ] 无console.log遗留

### 6.5 性能验收

- [ ] 页面首次加载<2s
- [ ] 图表渲染性能良好
- [ ] 无内存泄漏
- [ ] API请求优化（并发加载）

---

**文档结束 | 总行数：约750行**

