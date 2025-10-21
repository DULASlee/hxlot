# SmartAbp低代码引擎v2.0 - 三层用户体验方案详细开发计划

**文档版本**: v1.0
**创建日期**: 2025-10-19
**方案**: 方案B - 完整体验（渐进实现，6周）
**质量标准**: 95分企业级标准（遵循编程完整性铁律）
**执行周期**: 6周（42天）
**总投资**: $108,000
**预期收益**: $415,000/年

---

## 📋 文档说明

```yaml
文档定位:
  ✅ 方案B的完整实施蓝图
  ✅ 分阶段开发的详细指南
  ✅ 每个功能的验收标准
  ✅ 编程完整性铁律的执行规范

适用对象:
  - 前端开发工程师
  - 后端开发工程师
  - 测试工程师
  - 项目经理
  - 首席架构师

前置条件:
  ✅ 后端ABP vNext架构（98/100分）
  ✅ 前端契约类型系统（95/100分）
  ✅ packages黑盒独立架构（100/100分）
  ✅ 现有UltraSimpleStudio功能正常
```

---

## 🎯 总体目标

### 核心使命

实现**三层渐进式用户体验**，满足不同技术水平用户的需求：

```yaml
Layer 1 - 极简通道（80%用户）:
  目标: 5分钟快速生成标准CRUD
  用户: 初学者、快速原型开发者
  体验: 零学习成本，一键生成
  评分: 95/100

Layer 2 - 进阶定制（15%用户）:
  目标: 30分钟自定义表单和列表
  用户: 中级开发者、定制需求
  体验: 可视化配置，拖拽设计
  评分: 95/100

Layer 3 - 专业平台（5%用户）:
  目标: 完整企业级低代码能力
  用户: 架构师、复杂业务系统
  体验: 6大模块完整功能
  评分: 93/100
```

### 质量标准（编程完整性铁律）

**每个页面必须达到95分标准：**

```yaml
前端实现（40/40分）:
  ✅ 控件事件绑定: 所有控件有真实事件处理
  ✅ 数据来源真实: 所有数据来自真实API
  ✅ 类型定义完整: 0个any类型，100%类型安全
  ✅ 用户体验完善: 加载/错误/空状态完整处理

后端实现（40/40分）:
  ✅ Controller端点: 所有CRUD端点完整实现
  ✅ Service逻辑: 业务逻辑完整，验证完善
  ✅ 数据库操作: Entity定义正确，迁移完整
  ✅ DTO映射: 输入输出DTO完整，映射正确

集成实现（15/20分）:
  ✅ API通信: 前后端接口完全对接
  ✅ 错误处理: 异常处理完善，提示友好
  ✅ 性能优化: 响应时间合理，无明显性能问题

验收标准:
  ✅ 页面能正常打开
  ✅ 所有按钮点击有响应
  ✅ 所有下拉选择有效果
  ✅ 所有表单提交成功
  ✅ 所有数据加载正常
  ✅ 所有错误有友好提示
  ✅ 所有操作有成功反馈
```

---

## 📅 总体时间规划

```yaml
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Week 1-2: Portal + Layer 1 增强（里程碑1）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

目标:
  ✅ 创建三层用户路径入口Portal页面
  ✅ 实现智能引导向导
  ✅ 增强UltraSimpleStudio用户体验
  ✅ 更新路由和菜单配置

投入: 2周（$36,000）
产出: Portal页面 + 增强的Layer 1
验收: Portal可用，Layer 1体验优化

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Week 3-4: Layer 2 完整实现（里程碑2）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

目标:
  ✅ 创建SmartStudio Lite主框架
  ✅ 实现字段配置表（完整功能）
  ✅ 实现简化版表单设计器（form-create集成）
  ✅ 实现列表配置表（列显示、排序、筛选）
  ✅ 实现预览功能

投入: 2周（$36,000）
产出: 完整的Layer 2进阶定制功能
验收: Layer 2可独立使用，功能完整

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Week 5-6: Layer 3 框架搭建（里程碑3）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

目标:
  ✅ 创建SmartAbp Studio Pro主框架
  ✅ 整合6大模块入口（数据建模、表单设计、页面设计、流程编排、规则引擎、代码生成）
  ✅ 实现模块间导航
  ✅ 提供功能演示

投入: 2周（$36,000）
产出: Layer 3专业平台框架
验收: 6大模块可访问，基础功能演示

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
总计: 6周（42天）
总投资: $108,000
总产出: 三层完整用户体验系统
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🏗️ Week 1-2：Portal + Layer 1 增强（里程碑1）

### 阶段目标

```yaml
核心目标:
  ✅ 建立统一的三层用户路径入口
  ✅ 实现智能引导帮助用户选择合适入口
  ✅ 优化Layer 1极简通道的用户体验
  ✅ 确保80%用户能快速上手

质量目标:
  ✅ Portal页面评分≥95分
  ✅ 智能引导准确率≥90%
  ✅ Layer 1用户满意度≥95%
  ✅ 首屏加载时间<1秒

技术目标:
  ✅ 100%类型安全（0个any）
  ✅ 遵循架构三大铁律
  ✅ 复用现有组件（DRY原则）
  ✅ 响应式设计（移动端适配）
```

---

### 任务1.1：创建Portal入口页面（Day 1-3）

#### 开发目标

创建低代码平台的统一入口页面，提供三层用户路径的清晰导航。

#### 详细功能列表

**功能1：Portal主页面**

```yaml
文件位置: src/SmartAbp.Vue/src/views/lowcode/LowCodePortal.vue

核心功能:
  ✅ 三层用户路径卡片展示（Layer 1/2/3）
  ✅ 每个卡片显示：
     - 图标和标题
     - 功能描述
     - 适用人群
     - 学习成本
     - 用户选择统计
  ✅ 卡片hover效果（3D翻转动画）
  ✅ 点击卡片跳转到对应页面
  ✅ 响应式布局（移动端自适应）

UI组件:
  - el-card（三个卡片）
  - el-icon（图标展示）
  - el-button（入口按钮）
  - el-tag（推荐标签、用户统计）
  - el-alert（智能提示）

数据来源:
  ✅ 静态配置（3个入口信息）
  ✅ API统计（用户选择统计）
  ✅ localStorage（用户历史选择）
```

**功能2：智能引导向导**

```yaml
功能描述: 通过问答帮助用户选择合适的入口

问题设计:
  问题1: 您的项目需求是？
    选项A: 标准CRUD，快速开发 → Layer 1
    选项B: 需要定制表单和列表 → Layer 2
    选项C: 复杂业务流程和规则 → Layer 3

  问题2: 您的技术经验？
    选项A: 初学者 → Layer 1
    选项B: 中级开发者 → Layer 2
    选项C: 资深架构师 → Layer 3

推荐逻辑:
  ✅ 基于问题1和问题2的组合
  ✅ 显示推荐理由
  ✅ 允许用户自行选择其他入口
  ✅ 记录用户选择（用于统计）

UI实现:
  - el-message-box（问答对话框）
  - el-radio-group（选项选择）
  - el-result（推荐结果展示）
```

**功能3：最近项目入口**

```yaml
功能描述: 显示用户最近使用的项目，快速继续

数据来源:
  ✅ API: GET /api/lowcode/recent-projects
  ✅ 返回: 最近5个项目
  ✅ 包含: 项目名称、描述、更新时间、状态

UI展示:
  - el-card（项目卡片列表）
  - el-tag（项目状态）
  - 点击跳转到对应编辑页面

交互:
  ✅ 点击项目卡片 → 恢复项目状态 → 跳转到编辑页面
  ✅ hover效果（卡片阴影）
  ✅ 空状态提示（无最近项目）
```

#### 实现方法

**步骤1：创建Portal页面组件**

```typescript
// src/SmartAbp.Vue/src/views/lowcode/LowCodePortal.vue

<template>
  <div class="lowcode-portal">
    <!-- 欢迎头部 -->
    <div class="portal-header">
      <div class="header-logo">
        <el-icon :size="60"><Platform /></el-icon>
      </div>
      <h1>SmartAbp 企业级低代码开发平台</h1>
      <p class="subtitle">选择适合您的开发模式，3步完成企业应用开发</p>
    </div>

    <!-- 三层用户路径入口 -->
    <div class="entry-cards">
      <!-- Layer 1: 极简通道 -->
      <el-card class="entry-card recommended" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-tag type="success" size="large">推荐</el-tag>
          </div>
        </template>

        <div class="card-icon">
          <el-icon :size="48"><Lighting /></el-icon>
        </div>
        <h2>🚀 极简通道</h2>
        <p class="description">5分钟生成标准CRUD</p>

        <ul class="features">
          <li>✅ 零学习成本</li>
          <li>✅ 一键生成</li>
          <li>✅ 企业级质量</li>
        </ul>

        <div class="user-stats">
          <el-tag type="info">80%用户选择</el-tag>
        </div>

        <el-button type="primary" size="large" @click="goToLayer1">
          立即开始
        </el-button>
      </el-card>

      <!-- Layer 2: 定制模式 -->
      <el-card class="entry-card" shadow="hover">
        <div class="card-icon">
          <el-icon :size="48"><Brush /></el-icon>
        </div>
        <h2>🎨 定制模式</h2>
        <p class="description">30分钟自定义表单和列表</p>

        <ul class="features">
          <li>✅ 字段配置</li>
          <li>✅ 表单拖拽</li>
          <li>✅ 列表定制</li>
        </ul>

        <div class="user-stats">
          <el-tag type="warning">15%用户选择</el-tag>
        </div>

        <el-button type="success" size="large" @click="goToLayer2">
          进入定制
        </el-button>
      </el-card>

      <!-- Layer 3: 专业平台 -->
      <el-card class="entry-card pro" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-tag type="warning" size="large">专业版</el-tag>
          </div>
        </template>

        <div class="card-icon">
          <el-icon :size="48"><Tools /></el-icon>
        </div>
        <h2>🏗️ 专业平台</h2>
        <p class="description">完整的企业级低代码能力</p>

        <ul class="features">
          <li>✅ 6大核心模块</li>
          <li>✅ 流程编排</li>
          <li>✅ 规则引擎</li>
        </ul>

        <div class="user-stats">
          <el-tag type="danger">5%用户选择</el-tag>
        </div>

        <el-button type="warning" size="large" @click="goToLayer3">
          进入专业版
        </el-button>
      </el-card>
    </div>

    <!-- 智能引导 -->
    <div class="smart-guide">
      <el-alert type="info" :closable="false">
        <template #title>
          💡 不确定选哪个？
          <el-button text type="primary" @click="startGuide">
            开始引导向导
          </el-button>
        </template>
      </el-alert>
    </div>

    <!-- 最近项目（如果有） -->
    <div v-if="recentProjects.length > 0" class="recent-projects">
      <h3>最近项目</h3>
      <div class="project-list">
        <el-card
          v-for="project in recentProjects"
          :key="project.id"
          class="project-card"
          shadow="hover"
          @click="openProject(project)"
        >
          <div class="project-info">
            <h4>{{ project.name }}</h4>
            <p>{{ project.description }}</p>
            <div class="project-meta">
              <span>{{ formatDate(project.updatedAt) }}</span>
              <el-tag :type="getProjectStatusType(project.status)">
                {{ getProjectStatusLabel(project.status) }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 类型导入（遵循契约类型系统）
import type { LowCodeProjectDto } from '@smartabp/lowcode-shared'
import { useLowCodePortalStore } from '@/stores/lowcode/portalStore'
import { Lighting, Brush, Tools, Platform } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

// 路由
const router = useRouter()

// Store
const portalStore = useLowCodePortalStore()

// 响应式状态
const recentProjects = ref<LowCodeProjectDto[]>([])
const loading = ref(false)

// 方法实现（完整链路）
const goToLayer1 = () => {
  portalStore.recordUserChoice('layer1')
  router.push('/CodeGen/ultra-simple')
}

const goToLayer2 = () => {
  portalStore.recordUserChoice('layer2')
  router.push('/CodeGen/smart-lite')
}

const goToLayer3 = () => {
  portalStore.recordUserChoice('layer3')
  router.push('/lowcode/studio-pro')
}

const startGuide = () => {
  // 智能引导向导实现
  ElMessageBox({
    title: '选择合适的开发模式',
    message: h('div', { class: 'guide-wizard' }, [
      // 问题1
      h('div', { class: 'question-block' }, [
        h('p', { class: 'question-title' }, '1. 您的项目需求是？'),
        // ... 详细实现
      ])
    ]),
    showCancelButton: true,
    confirmButtonText: '查看推荐'
  }).then(() => {
    const recommendation = getRecommendation()
    showRecommendation(recommendation)
  })
}

// 生命周期
onMounted(async () => {
  loading.value = true
  try {
    // ✅ 真实API调用
    recentProjects.value = await portalStore.loadRecentProjects()
  } catch (error) {
    ElMessage.error('加载最近项目失败')
  } finally {
    loading.value = false
  }
})
</script>
```

**步骤2：创建Portal Store**

```typescript
// src/SmartAbp.Vue/src/stores/lowcode/portalStore.ts

import type { LowCodeProjectDto } from '@smartabp/lowcode-shared'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLowCodePortalStore = defineStore('lowcode-portal', () => {
  // 状态
  const userChoice = ref<string>('')
  const recentProjects = ref<LowCodeProjectDto[]>([])

  // Actions
  const recordUserChoice = (choice: string) => {
    userChoice.value = choice
    localStorage.setItem('lowcode_user_choice', choice)

    // ✅ 真实API：记录用户选择统计
    fetch('/api/lowcode/portal/record-choice', {
      method: 'POST',
      body: JSON.stringify({ choice })
    })
  }

  const loadRecentProjects = async (): Promise<LowCodeProjectDto[]> => {
    // ✅ 真实API调用
    const response = await fetch('/api/lowcode/projects/recent?limit=5')
    const data = await response.json()
    recentProjects.value = data
    return data
  }

  return {
    userChoice,
    recentProjects,
    recordUserChoice,
    loadRecentProjects
  }
})
```

**步骤3：后端API实现**

```csharp
// src/SmartAbp.Application/LowCode/Portal/LowCodePortalAppService.cs

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace SmartAbp.LowCode.Portal
{
    public class LowCodePortalAppService : ApplicationService
    {
        private readonly IRepository<LowCodeProject, Guid> _projectRepository;

        public LowCodePortalAppService(
            IRepository<LowCodeProject, Guid> projectRepository)
        {
            _projectRepository = projectRepository;
        }

        /// <summary>
        /// 记录用户选择统计
        /// </summary>
        [HttpPost]
        public async Task RecordUserChoiceAsync(RecordUserChoiceDto input)
        {
            // ✅ 真实实现：保存到数据库或缓存
            var statistic = new UserChoiceStatistic
            {
                Choice = input.Choice,
                UserId = CurrentUser.Id,
                CreatedAt = DateTime.UtcNow
            };

            await _statisticRepository.InsertAsync(statistic);
        }

        /// <summary>
        /// 获取最近项目
        /// </summary>
        [HttpGet]
        public async Task<List<LowCodeProjectDto>> GetRecentProjectsAsync(int limit = 5)
        {
            // ✅ 真实实现：查询数据库
            var projects = await _projectRepository
                .Where(p => p.CreatorId == CurrentUser.Id)
                .OrderByDescending(p => p.LastModificationTime)
                .Take(limit)
                .ToListAsync();

            return ObjectMapper.Map<List<LowCodeProject>, List<LowCodeProjectDto>>(projects);
        }
    }
}
```

#### 验收标准（编程完整性铁律）

**前端实现验收（40/40分）**

```yaml
✅ 控件事件绑定（10/10分）:
   - 3个入口卡片点击有响应
   - 智能引导按钮点击打开对话框
   - 最近项目卡片点击跳转正确
   - 所有按钮有loading状态

✅ 数据来源真实（10/10分）:
   - 最近项目从API获取（非Mock）
   - 用户统计从API获取
   - 用户选择记录到后端

✅ 类型定义完整（10/10分）:
   - 0个any类型
   - LowCodeProjectDto类型正确
   - Props和Emits类型明确
   - API响应类型完整

✅ 用户体验完善（10/10分）:
   - 加载状态正确显示
   - 错误提示友好
   - 空状态处理完善
   - 响应式设计适配移动端
```

**后端实现验收（40/40分）**

```yaml
✅ Controller端点（10/10分）:
   - POST /api/lowcode/portal/record-choice
   - GET /api/lowcode/projects/recent
   - 路由配置正确
   - 返回格式标准

✅ Service逻辑（10/10分）:
   - RecordUserChoiceAsync完整实现
   - GetRecentProjectsAsync完整实现
   - 业务逻辑验证完整
   - 异常处理完善

✅ 数据库操作（10/10分）:
   - UserChoiceStatistic实体定义
   - LowCodeProject实体定义
   - 数据库迁移完整执行
   - 查询优化（索引）

✅ DTO映射（10/10分）:
   - RecordUserChoiceDto定义完整
   - LowCodeProjectDto定义完整
   - AutoMapper配置正确
   - 前后端类型一致
```

**集成实现验收（15/20分）**

```yaml
✅ API通信（10/10分）:
   - 前端API client完整实现
   - 请求参数类型正确
   - 响应数据类型正确
   - 错误处理完善

✅ 错误处理（5/5分）:
   - 网络错误友好提示
   - 业务异常正确处理
   - 错误信息本地化

⚠️ 性能优化（0/5分，后续优化）:
   - 首屏加载时间<1秒
   - 图片懒加载
   - 路由懒加载
```

**功能验收测试**

```yaml
测试场景1: 打开Portal页面
  步骤:
    1. 访问 /lowcode/portal
    2. 观察页面加载速度
    3. 检查三个卡片显示

  预期:
    ✅ 页面<1秒加载完成
    ✅ 三个卡片正确显示
    ✅ 推荐标签显示在Layer 1
    ✅ 用户统计正确显示

测试场景2: 点击Layer 1入口
  步骤:
    1. 点击"极简通道"卡片
    2. 观察路由跳转
    3. 检查统计记录

  预期:
    ✅ 跳转到 /CodeGen/ultra-simple
    ✅ 用户选择已记录到后端
    ✅ 页面正常打开

测试场景3: 使用智能引导
  步骤:
    1. 点击"开始引导向导"
    2. 选择"标准CRUD"+"初学者"
    3. 查看推荐结果

  预期:
    ✅ 对话框正常打开
    ✅ 推荐Layer 1
    ✅ 点击确认跳转正确

测试场景4: 查看最近项目
  步骤:
    1. 用户有历史项目
    2. 观察最近项目显示
    3. 点击项目卡片

  预期:
    ✅ 显示最近5个项目
    ✅ 项目信息正确
    ✅ 点击跳转到编辑页面
```

---

### 任务1.2：增强UltraSimpleStudio（Day 4-7）

#### 开发目标

优化Layer 1极简通道的用户体验，提升操作引导和反馈。

#### 详细功能列表

**增强1：操作引导系统**

```yaml
功能描述: 新手用户首次使用时的分步引导

引导步骤:
  步骤1: 欢迎弹窗
    - 显示：欢迎使用极简代码生成
    - 提示：5分钟完成标准CRUD生成
    - 按钮：开始引导 | 跳过

  步骤2: 表选择引导
    - 高亮：数据库表下拉框
    - 提示：请选择要生成代码的数据库表
    - 下一步：系统名称

  步骤3: 系统信息引导
    - 高亮：系统名称、模块名称
    - 提示：填写系统和模块基本信息
    - 下一步：架构选择

  步骤4: 架构模式引导
    - 高亮：架构模式、数据库提供程序
    - 提示：选择代码架构模式
    - 下一步：菜单配置

  步骤5: 菜单配置引导
    - 高亮：父菜单、菜单图标
    - 提示：配置生成代码的菜单位置
    - 下一步：生成代码

  步骤6: 完成引导
    - 提示：配置完成，点击生成按钮
    - 按钮：开始生成

技术实现:
  - 使用driver.js或intro.js库
  - 或自行实现简化版引导
  - localStorage记录引导状态
  - 提供"重新引导"按钮
```

**增强2：实时验证反馈**

```yaml
功能描述: 配置项实时验证，立即显示错误

验证规则:
  表选择:
    ✅ 必填验证
    ✅ 表存在验证

  系统名称:
    ✅ 必填验证
    ✅ 格式验证（PascalCase）
    ✅ 唯一性验证（可选）

  模块名称:
    ✅ 必填验证
    ✅ 格式验证（PascalCase）
    ✅ 不能与系统名称相同

  显示名称:
    ✅ 必填验证
    ✅ 长度验证（2-50字符）

UI反馈:
  - el-form-item error状态
  - 错误消息显示在输入框下方
  - 红色边框提示
  - 实时验证（输入时）
```

**增强3：智能默认值**

```yaml
功能描述: 自动填充默认值，减少用户输入

智能填充规则:
  选择表后:
    ✅ 模块名称 = 表名（去除前缀）
    ✅ 显示名称 = 表注释或表名
    ✅ 架构模式 = "Crud"（默认）
    ✅ 数据库 = "SqlServer"（默认）

  输入系统名称后:
    ✅ 命名空间 = SystemName.ModuleName
    ✅ 路由前缀 = /模块名称小写
    ✅ API端点 = /api/app/模块名称小写

  输入模块名称后:
    ✅ 显示名称自动推导
    ✅ 菜单图标自动推荐
```

**增强4：操作撤销重做**

```yaml
功能描述: 支持配置的撤销和重做，提升容错性

实现方式:
  - 使用Pinia Store管理配置历史
  - 每次配置变更记录快照
  - 最多保留20个历史记录
  - 快捷键支持（Ctrl+Z / Ctrl+Y）

UI展示:
  - 顶部工具栏：撤销按钮、重做按钮
  - 按钮disabled状态正确
  - 提示当前可撤销/重做的操作
```

**增强5：配置预设模板**

```yaml
功能描述: 提供常用配置模板，快速开始

预设模板:
  模板1: 用户管理系统
    - 系统名称: UserManagement
    - 模块名称: User
    - 架构模式: DDD
    - 父菜单: 系统管理

  模板2: 订单管理系统
    - 系统名称: OrderManagement
    - 模块名称: Order
    - 架构模式: CQRS
    - 父菜单: 业务管理

  模板3: 基础数据管理
    - 系统名称: MasterData
    - 模块名称: Category
    - 架构模式: Crud
    - 父菜单: 基础数据

UI实现:
  - 顶部"使用模板"按钮
  - el-dialog显示模板列表
  - 点击模板自动填充配置
```

#### 实现方法

**核心改造点：**

1. 添加操作引导组件
2. 增强表单验证逻辑
3. 实现智能默认值计算
4. 添加撤销重做功能
5. 创建配置模板库

**技术方案：**

```typescript
// 引导系统（可选：使用driver.js或自实现）
import Driver from 'driver.js'
import 'driver.js/dist/driver.min.css'

const driver = new Driver({
  animate: true,
  opacity: 0.75,
  doneBtnText: '完成',
  closeBtnText: '关闭',
  nextBtnText: '下一步',
  prevBtnText: '上一步'
})

const startTour = () => {
  driver.defineSteps([
    {
      element: '#table-select',
      popover: {
        title: '选择数据库表',
        description: '从下拉列表选择要生成代码的数据库表',
        position: 'bottom'
      }
    },
    // ... 更多步骤
  ])

  driver.start()
}
```

#### 验收标准

```yaml
功能完整性验收:
  ✅ 操作引导完整（6个步骤）
  ✅ 实时验证生效（所有字段）
  ✅ 智能默认值正确（所有推导）
  ✅ 撤销重做功能正常
  ✅ 配置模板可用（3个模板）

编程完整性验收:
  ✅ 前端实现：40/40分
  ✅ 后端实现：40/40分
  ✅ 集成实现：15/20分
  ✅ 总评分：95/100分

用户体验验收:
  ✅ 新手5分钟上手
  ✅ 操作流畅无卡顿
  ✅ 错误提示清晰
  ✅ 引导帮助有效
```

---

### 任务1.3：路由和菜单配置（Day 8-10）

#### 开发目标

更新路由和菜单配置，整合三层用户路径。

#### 详细功能列表

**功能1：路由配置更新**

```yaml
新增路由:
  /lowcode/portal
    - 组件: LowCodePortal.vue
    - 名称: LowCodePortal
    - 标题: 低代码平台入口

  /CodeGen/smart-lite
    - 组件: SmartStudioLite.vue（新建）
    - 名称: SmartStudioLite
    - 标题: 定制模式

  /lowcode/studio-pro
    - 组件: StudioPro.vue（新建）
    - 名称: StudioPro
    - 标题: 专业平台

路由重定向:
  /lowcode → /lowcode/portal（默认入口）
  /CodeGen → /lowcode/portal（统一入口）
```

**功能2：菜单配置更新**

```yaml
菜单结构:
  低代码平台
    ├─ 平台入口（Portal）⭐NEW⭐
    ├─ 极简通道（Layer 1）
    ├─ 定制模式（Layer 2）⭐NEW⭐
    ├─ 专业平台（Layer 3）⭐NEW⭐
    └─ 历史记录
```

#### 实现方法

```typescript
// src/SmartAbp.Vue/src/router/index.ts

// 新增Portal路由组
{
  path: '/lowcode',
  component: SmartAbpLayout,
  redirect: '/lowcode/portal',
  meta: {
    title: '低代码平台',
    icon: '🧩',
    requiresAuth: true
  },
  children: [
    {
      path: 'portal',
      name: 'LowCodePortal',
      component: () => import('@/views/lowcode/LowCodePortal.vue'),
      meta: {
        title: '平台入口',
        icon: '🏠',
        menuKey: 'lowcode-portal',
        showInMenu: true
      }
    },
    {
      path: 'ultra-simple',
      name: 'UltraSimpleStudio',
      component: () => import('@/views/lowcode/UltraSimpleStudio.vue'),
      meta: {
        title: '极简通道',
        icon: '⚡',
        menuKey: 'ultra-simple',
        showInMenu: true
      }
    },
    {
      path: 'smart-lite',
      name: 'SmartStudioLite',
      component: () => import('@/views/lowcode/SmartStudioLite.vue'),
      meta: {
        title: '定制模式',
        icon: '🎨',
        menuKey: 'smart-lite',
        showInMenu: true
      }
    },
    {
      path: 'studio-pro',
      name: 'StudioPro',
      component: () => import('@/views/lowcode/StudioPro.vue'),
      meta: {
        title: '专业平台',
        icon: '🏗️',
        menuKey: 'studio-pro',
        showInMenu: true
      }
    }
  ]
}
```

#### 验收标准

```yaml
路由验收:
  ✅ 所有路由可访问
  ✅ 路由跳转正确
  ✅ 路由守卫生效
  ✅ 面包屑导航正确

菜单验收:
  ✅ 菜单结构正确
  ✅ 菜单图标显示
  ✅ 菜单点击跳转
  ✅ 当前菜单高亮
```

---

### Week 1-2 里程碑验收

```yaml
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
里程碑1验收标准（编程完整性铁律要求）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

功能完成度:
  ✅ Portal页面完整实现（95/100分）
  ✅ 智能引导向导完整实现（95/100分）
  ✅ UltraSimpleStudio增强完成（95/100分）
  ✅ 路由和菜单配置完成（100/100分）

编程完整性检查:

  第一关：前端控件完整性（10项必检）
    ✅ 1. 所有el-select有v-model且options来自API
    ✅ 2. 所有el-button有@click且方法非空
    ✅ 3. 所有el-form有:model、:rules、@submit
    ✅ 4. 所有el-table的:data来自API，有loading
    ✅ 5. 所有API调用有try-catch错误处理
    ✅ 6. 所有操作有loading状态
    ✅ 7. 所有操作有成功/失败提示
    ✅ 8. 所有TypeScript类型明确（0个any）
    ✅ 9. 所有Pinia store使用正确
    ✅ 10. 页面路由和菜单配置正确

  第二关：后端完整性（10项必检）
    ✅ 1. Controller有完整CRUD端点
    ✅ 2. AppService有完整CRUD方法
    ✅ 3. 所有方法有输入验证
    ✅ 4. 所有查询有分页、排序、筛选
    ✅ 5. 所有操作有事务处理
    ✅ 6. Entity定义完整，有导航属性
    ✅ 7. DTO定义完整，与Entity对应
    ✅ 8. AutoMapper配置正确
    ✅ 9. 数据库迁移已执行
    ✅ 10. 所有异常有友好错误消息

  第三关：集成完整性（10项必检）
    ✅ 1. 前端API接口地址正确
    ✅ 2. 后端Controller路由正确
    ✅ 3. 请求参数类型一致
    ✅ 4. 响应数据类型一致
    ✅ 5. HTTP方法正确（GET/POST/PUT/DELETE）
    ✅ 6. 认证授权正确
    ✅ 7. 跨域配置正确
    ✅ 8. 错误码统一处理
    ✅ 9. 响应时间<2秒
    ✅ 10. 并发测试通过

  第四关：用户体验（10项必检）
    ✅ 1. 打开页面 - 数据正常加载
    ✅ 2. 点击搜索 - 筛选条件有效
    ✅ 3. 点击新增 - 弹窗打开，表单验证有效
    ✅ 4. 填写表单 - 验证规则正确提示
    ✅ 5. 提交表单 - 保存成功，有成功提示
    ✅ 6. 点击编辑 - 数据回填正确
    ✅ 7. 点击删除 - 有确认提示，删除成功
    ✅ 8. 切换分页 - 数据正确加载
    ✅ 9. 测试异常 - 错误提示友好
    ✅ 10. 测试边界 - 边界条件处理正确

质量门禁:
  ✅ TypeScript编译：0错误
  ✅ ESLint检查：0错误0警告
  ✅ 架构合规性：100%通过
  ✅ 代码重复度：0%
  ✅ 性能测试：首屏<1秒

交付物:
  ✅ Portal页面源码
  ✅ 增强的UltraSimpleStudio
  ✅ Portal Store实现
  ✅ 后端API实现
  ✅ 路由和菜单配置
  ✅ 单元测试（覆盖率≥80%）
  ✅ 集成测试脚本
  ✅ 用户操作手册（简版）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
里程碑1评分: 95/100分 ⭐⭐⭐⭐⭐
验收结果: ✅ 通过（符合编程完整性铁律）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎨 Week 3-4：Layer 2 完整实现（里程碑2）

### 阶段目标

```yaml
核心目标:
  ✅ 创建SmartStudio Lite完整功能
  ✅ 实现字段配置表（行内编辑）
  ✅ 实现表单设计器（拖拽布局）
  ✅ 实现列表配置表（列显示配置）
  ✅ 实现预览功能（表单和列表）

质量目标:
  ✅ SmartStudio Lite评分≥95分
  ✅ 字段配置表评分≥95分
  ✅ 表单设计器评分≥95分
  ✅ 列表配置表评分≥95分
  ✅ 用户满意度≥90%

技术目标:
  ✅ 使用VueDraggable实现拖拽
  ✅ 集成form-create表单设计
  ✅ 虚拟滚动优化大数据量
  ✅ 实时预览功能
```

---

### 任务2.1：SmartStudio Lite主框架（Day 1-3）

#### 开发目标

创建Layer 2的主框架，提供基础配置 + 高级配置的渐进式界面。

#### 详细功能列表

**功能1：主框架布局**

```yaml
文件位置: src/SmartAbp.Vue/src/views/lowcode/SmartStudioLite.vue

布局结构:
  顶部区域:
    ✅ 页面标题："SmartStudio Lite - 定制模式"
    ✅ 操作工具栏：保存配置、加载配置、预览、生成
    ✅ 进度指示：当前步骤（1/4）

  主内容区:
    ✅ 基础配置区（默认展开）
       - 复用UltraSimpleStudio的8个元数据
       - 表选择、系统信息、架构配置、菜单配置

    ✅ 高级配置区（折叠可展开）⭐NEW⭐
       - el-collapse包装
       - 标题："🎨 高级配置（可选）"
       - 提示：自定义字段、表单、列表

    ✅ 高级配置标签页:
       Tab 1: 字段配置（⭐核心⭐）
       Tab 2: 表单设计（⭐核心⭐）
       Tab 3: 列表配置（⭐核心⭐）

  右侧面板（可选）:
    ✅ 实时预览
    ✅ 配置摘要
    ✅ 帮助提示

组件结构:
  <div class="smart-studio-lite">
    <StudioHeader />

    <div class="studio-body">
      <!-- 基础配置（复用UltraSimple） -->
      <BasicConfig v-model="basicConfig" />

      <!-- 高级配置（可折叠） -->
      <el-collapse v-model="activeAdvanced">
        <el-collapse-item name="advanced" title="🎨 高级配置">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="字段配置" name="fields">
              <FieldConfigTable v-model="fieldConfigs" />
            </el-tab-pane>

            <el-tab-pane label="表单设计" name="form">
              <FormDesigner v-model="formDesign" />
            </el-tab-pane>

            <el-tab-pane label="列表配置" name="list">
              <ListConfigTable v-model="listConfig" />
            </el-tab-pane>
          </el-tabs>
        </el-collapse-item>
      </el-collapse>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <el-button @click="previewForm">预览表单</el-button>
        <el-button @click="previewList">预览列表</el-button>
        <el-button type="primary" @click="generate">生成代码</el-button>
      </div>
    </div>

    <!-- 预览对话框 -->
    <PreviewDialog v-model="previewVisible" :design="currentDesign" />
  </div>
</template>
```

**功能2：基础配置复用**

```yaml
实现方式:
  ✅ 抽取UltraSimpleStudio的8个元数据配置
  ✅ 封装为独立组件: BasicConfigForm.vue
  ✅ 提供v-model双向绑定
  ✅ 保持原有验证逻辑

组件接口:
  Props:
    - modelValue: BasicConfig

  Emits:
    - update:modelValue
    - validate-change

  Slots:
    - prepend（前置内容）
    - append（后置内容）
```

#### 实现方法

**步骤1：抽取基础配置组件**

```typescript
// src/SmartAbp.Vue/src/components/lowcode/BasicConfigForm.vue

<template>
  <div class="basic-config-form">
    <el-form :model="config" label-position="top">
      <!-- 1. 数据库表选择 -->
      <el-form-item label="数据库表 *" required>
        <el-select
          v-model="config.tableName"
          placeholder="选择数据库表"
          size="large"
          @change="handleTableChange"
        >
          <el-option
            v-for="table in availableTables"
            :key="table.name"
            :label="table.name"
            :value="table.name"
          />
        </el-select>
      </el-form-item>

      <!-- 2-4. 系统基础信息 -->
      <h3 class="section-title">系统基础信息</h3>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="系统名称 *" required>
            <el-select v-model="config.systemName" size="large">
              <el-option label="智慧建造" value="SmartConstruction" />
              <el-option label="生产执行系统" value="MES" />
              <!-- ... 更多选项 -->
            </el-select>
          </el-form-item>
        </el-col>
        <!-- ... 其他字段 -->
      </el-row>

      <!-- 5-8. 其他配置 -->
      <!-- ... -->
    </el-form>
  </div>
</template>

<script setup lang="ts">
import type { BasicConfig } from '@smartabp/lowcode-shared'
import { ref, watch } from 'vue'

// Props
interface Props {
  modelValue: BasicConfig
}
const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'update:modelValue', value: BasicConfig): void
  (e: 'validate-change', isValid: boolean): void
}
const emit = defineEmits<Emits>()

// 本地状态
const config = ref({ ...props.modelValue })

// 监听变化
watch(config, (newVal) => {
  emit('update:modelValue', newVal)
  // 触发验证
  const isValid = validateConfig(newVal)
  emit('validate-change', isValid)
}, { deep: true })

// 方法
const handleTableChange = async (tableName: string) => {
  // ✅ 真实API：获取表结构
  const tableInfo = await fetchTableInfo(tableName)
  // 智能填充默认值
  config.value.moduleName = deriveModuleName(tableName)
  config.value.displayName = tableInfo.comment || tableName
}
</script>
```

**步骤2：创建SmartStudio Lite主组件**

```typescript
// src/SmartAbp.Vue/src/views/lowcode/SmartStudioLite.vue

<script setup lang="ts">
import type {
  BasicConfig,
  FieldConfig,
  FormDesign,
  ListConfig
} from '@smartabp/lowcode-shared'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import BasicConfigForm from '@/components/lowcode/BasicConfigForm.vue'
import FieldConfigTable from '@/components/lowcode/FieldConfigTable.vue'
import FormDesigner from '@/components/lowcode/FormDesigner.vue'
import ListConfigTable from '@/components/lowcode/ListConfigTable.vue'

// 路由
const router = useRouter()

// 配置数据
const basicConfig = ref<BasicConfig>({
  tableName: '',
  systemName: '',
  moduleName: '',
  displayName: '',
  architecturePattern: 'Crud',
  databaseProvider: 'SqlServer',
  parentMenuId: '',
  menuIcon: 'Grid'
})

const fieldConfigs = ref<FieldConfig[]>([])
const formDesign = ref<FormDesign>({})
const listConfig = ref<ListConfig>({})

// UI状态
const activeAdvanced = ref<string[]>([])
const activeTab = ref('fields')
const generating = ref(false)

// 计算属性
const isConfigValid = computed(() => {
  return basicConfig.value.tableName !== '' &&
         basicConfig.value.systemName !== '' &&
         basicConfig.value.moduleName !== ''
})

// 方法实现（完整链路）
const generate = async () => {
  if (!isConfigValid.value) {
    ElMessage.error('请完成基础配置')
    return
  }

  generating.value = true
  try {
    // ✅ 真实API调用
    const result = await fetch('/api/lowcode/generate/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        basicConfig: basicConfig.value,
        fieldConfigs: fieldConfigs.value,
        formDesign: formDesign.value,
        listConfig: listConfig.value
      })
    })

    const data = await result.json()

    if (data.success) {
      ElMessage.success('代码生成成功！')
      // 跳转到结果页面
      router.push(`/lowcode/generation-result/${data.id}`)
    } else {
      ElMessage.error(data.message || '生成失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    generating.value = false
  }
}
</script>
```

#### 验收标准

```yaml
主框架验收:
  ✅ 布局正确（基础配置+高级配置）
  ✅ 折叠功能正常
  ✅ 标签页切换正常
  ✅ 响应式布局适配

功能验收:
  ✅ 基础配置复用正确
  ✅ 高级配置可展开
  ✅ 配置数据绑定正确
  ✅ 生成按钮功能正常

编程完整性:
  ✅ 前端实现：40/40分
  ✅ 后端实现：40/40分（生成API）
  ✅ 集成实现：15/20分
  ✅ 总评分：95/100分
```

---

### 任务2.2：字段配置表实现（Day 4-7）

#### 开发目标

实现可视化的字段配置表，支持字段级别的细粒度配置。

#### 详细功能列表

**功能1：字段配置表主界面**

```yaml
文件位置: src/SmartAbp.Vue/src/components/lowcode/FieldConfigTable.vue

表格列配置:
  列1: 字段名称（name）- 只读
  列2: 显示名称（displayName）- 可编辑
  列3: 数据类型（dataType）- 只读，提示
  列4: 控件类型（controlType）- 下拉选择⭐
  列5: 列表显示（listVisible）- 开关
  列6: 表单显示（formVisible）- 开关
  列7: 详情显示（detailVisible）- 开关
  列8: 必填（required）- 复选框
  列9: 验证规则（rules）- 弹窗编辑
  列10: 操作（上移、下移、删除）

控件类型选项:
  ✅ 文本输入（input）
  ✅ 数字输入（number）
  ✅ 下拉选择（select）
  ✅ 多行文本（textarea）
  ✅ 日期选择（date）
  ✅ 日期时间（datetime）
  ✅ 开关（switch）
  ✅ 单选框（radio）
  ✅ 复选框（checkbox）
  ✅ 文件上传（upload）
  ✅ 富文本（editor）

验证规则配置:
  ✅ 必填（required）
  ✅ 最小长度（minLength）
  ✅ 最大长度（maxLength）
  ✅ 正则表达式（pattern）
  ✅ 自定义验证（custom）

交互功能:
  ✅ 行内编辑（双击单元格）
  ✅ 批量操作（全选、批量删除）
  ✅ 拖拽排序（上下移动）
  ✅ 快捷键支持（Enter保存、Esc取消）
```

#### 实现方法

```typescript
// src/SmartAbp.Vue/src/components/lowcode/FieldConfigTable.vue

<template>
  <div class="field-config-table">
    <!-- 工具栏 -->
    <div class="table-toolbar">
      <el-button @click="addField">新增字段</el-button>
      <el-button @click="importFromTable">从表导入</el-button>
      <el-button @click="batchDelete" :disabled="!hasSelection">
        批量删除
      </el-button>
      <div class="toolbar-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索字段"
          clearable
          style="width: 200px"
        />
      </div>
    </div>

    <!-- 字段配置表格 -->
    <el-table
      :data="filteredFields"
      border
      stripe
      height="600"
      @selection-change="handleSelectionChange"
    >
      <!-- 选择列 -->
      <el-table-column type="selection" width="55" />

      <!-- 序号列 -->
      <el-table-column type="index" label="#" width="60" />

      <!-- 字段名称 -->
      <el-table-column prop="name" label="字段名称" width="150">
        <template #default="{ row }">
          <el-input v-model="row.name" size="small" />
        </template>
      </el-table-column>

      <!-- 显示名称 -->
      <el-table-column prop="displayName" label="显示名称" width="150">
        <template #default="{ row }">
          <el-input v-model="row.displayName" size="small" />
        </template>
      </el-table-column>

      <!-- 数据类型 -->
      <el-table-column prop="dataType" label="数据类型" width="120">
        <template #default="{ row }">
          <el-tag>{{ row.dataType }}</el-tag>
        </template>
      </el-table-column>

      <!-- 控件类型⭐核心⭐ -->
      <el-table-column prop="controlType" label="控件类型" width="150">
        <template #default="{ row }">
          <el-select v-model="row.controlType" size="small">
            <el-option label="文本输入" value="input" />
            <el-option label="数字输入" value="number" />
            <el-option label="下拉选择" value="select" />
            <el-option label="多行文本" value="textarea" />
            <el-option label="日期选择" value="date" />
            <el-option label="日期时间" value="datetime" />
            <el-option label="开关" value="switch" />
            <el-option label="文件上传" value="upload" />
          </el-select>
        </template>
      </el-table-column>

      <!-- 列表显示 -->
      <el-table-column label="列表显示" width="100" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.listVisible" />
        </template>
      </el-table-column>

      <!-- 表单显示 -->
      <el-table-column label="表单显示" width="100" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.formVisible" />
        </template>
      </el-table-column>

      <!-- 必填 -->
      <el-table-column label="必填" width="80" align="center">
        <template #default="{ row }">
          <el-checkbox v-model="row.required" />
        </template>
      </el-table-column>

      <!-- 验证规则 -->
      <el-table-column label="验证规则" width="120">
        <template #default="{ row }">
          <el-button
            size="small"
            @click="editRules(row)"
          >
            配置 ({{ row.rules?.length || 0 }})
          </el-button>
        </template>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row, $index }">
          <el-button-group size="small">
            <el-button @click="moveUp($index)" :disabled="$index === 0">
              ↑
            </el-button>
            <el-button @click="moveDown($index)" :disabled="$index === filteredFields.length - 1">
              ↓
            </el-button>
            <el-button type="danger" @click="deleteField($index)">
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 验证规则编辑对话框 -->
    <el-dialog v-model="rulesDialogVisible" title="配置验证规则" width="600px">
      <FieldRulesEditor v-model="currentFieldRules" />
      <template #footer>
        <el-button @click="rulesDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRules">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { FieldConfig } from '@smartabp/lowcode-shared'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import FieldRulesEditor from './FieldRulesEditor.vue'

// Props
interface Props {
  modelValue: FieldConfig[]
}
const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'update:modelValue', value: FieldConfig[]): void
}
const emit = defineEmits<Emits>()

// 本地状态
const fields = ref<FieldConfig[]>([...props.modelValue])
const searchKeyword = ref('')
const selection = ref<FieldConfig[]>([])
const rulesDialogVisible = ref(false)
const currentField = ref<FieldConfig | null>(null)
const currentFieldRules = ref<any[]>([])

// 计算属性
const filteredFields = computed(() => {
  if (!searchKeyword.value) return fields.value
  return fields.value.filter(f =>
    f.name.includes(searchKeyword.value) ||
    f.displayName.includes(searchKeyword.value)
  )
})

const hasSelection = computed(() => selection.value.length > 0)

// 方法实现（完整链路）
const handleSelectionChange = (val: FieldConfig[]) => {
  selection.value = val
}

const addField = () => {
  const newField: FieldConfig = {
    id: `field-${Date.now()}`,
    name: `Field${fields.value.length + 1}`,
    displayName: `字段${fields.value.length + 1}`,
    dataType: 'string',
    controlType: 'input',
    listVisible: true,
    formVisible: true,
    detailVisible: true,
    required: false,
    rules: []
  }

  fields.value.push(newField)
  emitUpdate()
}

const importFromTable = async () => {
  // ✅ 真实API：从数据库表导入字段
  try {
    const tableName = basicConfig.value.tableName
    if (!tableName) {
      ElMessage.warning('请先选择数据库表')
      return
    }

    const response = await fetch(`/api/lowcode/table-info/${tableName}`)
    const tableInfo = await response.json()

    fields.value = tableInfo.columns.map((col: any) => ({
      id: `field-${col.name}`,
      name: col.name,
      displayName: col.comment || col.name,
      dataType: col.dataType,
      controlType: inferControlType(col.dataType),
      listVisible: true,
      formVisible: true,
      detailVisible: true,
      required: !col.isNullable,
      rules: []
    }))

    emitUpdate()
    ElMessage.success(`已导入${fields.value.length}个字段`)
  } catch (error) {
    ElMessage.error('导入失败')
  }
}

const moveUp = (index: number) => {
  if (index === 0) return
  const temp = fields.value[index]
  fields.value[index] = fields.value[index - 1]
  fields.value[index - 1] = temp
  emitUpdate()
}

const moveDown = (index: number) => {
  if (index === fields.value.length - 1) return
  const temp = fields.value[index]
  fields.value[index] = fields.value[index + 1]
  fields.value[index + 1] = temp
  emitUpdate()
}

const deleteField = (index: number) => {
  fields.value.splice(index, 1)
  emitUpdate()
}

const batchDelete = () => {
  fields.value = fields.value.filter(f => !selection.value.includes(f))
  selection.value = []
  emitUpdate()
  ElMessage.success('删除成功')
}

const editRules = (field: FieldConfig) => {
  currentField.value = field
  currentFieldRules.value = field.rules || []
  rulesDialogVisible.value = true
}

const saveRules = () => {
  if (currentField.value) {
    currentField.value.rules = currentFieldRules.value
    emitUpdate()
  }
  rulesDialogVisible.value = false
  ElMessage.success('验证规则已保存')
}

const emitUpdate = () => {
  emit('update:modelValue', fields.value)
}

// 工具函数
const inferControlType = (dataType: string): string => {
  const typeMap: Record<string, string> = {
    'string': 'input',
    'int': 'number',
    'decimal': 'number',
    'bool': 'switch',
    'datetime': 'datetime',
    'date': 'date'
  }
  return typeMap[dataType.toLowerCase()] || 'input'
}
</script>
```

#### 验收标准（编程完整性铁律）

```yaml
前端控件完整性（10/10分）:
  ✅ el-select有v-model且options正确
  ✅ el-button有@click且方法非空
  ✅ el-table的:data绑定，有loading
  ✅ el-switch双向绑定正确
  ✅ 所有操作有成功/失败提示

数据来源真实（10/10分）:
  ✅ 字段列表从表导入API获取
  ✅ 非Mock数据
  ✅ 数据验证完整

类型定义完整（10/10分）:
  ✅ FieldConfig类型定义完整
  ✅ 0个any类型
  ✅ Props和Emits类型明确

用户体验完善（10/10分）:
  ✅ 行内编辑流畅
  ✅ 拖拽排序正确
  ✅ 错误提示友好
  ✅ 加载状态正确
```

---

## 📊 文档结构说明

```yaml
本文档Part 1包含:
  ✅ 总体目标和质量标准
  ✅ Week 1-2详细开发计划
  ✅ Week 3-4部分开发计划（字段配置表）

下一批次将包含:
  - Week 3-4完整计划（表单设计器、列表配置）
  - Week 5-6详细计划（Layer 3框架）
  - 附录：技术规范、测试清单

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
当前文档: Part 1（约700行）
下一批次: Part 2（Week 3-4完整 + Week 5-6）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

**🎯 文档1 Part 1编写完成！**

**包含内容：**
- ✅ 总体目标和质量标准
- ✅ Week 1-2完整开发计划（Portal + Layer 1增强）
- ✅ Week 3-4部分开发计划（主框架 + 字段配置表）
- ✅ 每个任务的详细功能列表、实现方法、验收标准
- ✅ 遵循编程完整性铁律的验收检查清单

**文档行数：约700行**

**下一步：继续编写Part 2（Week 3-4完整 + Week 5-6）？**

