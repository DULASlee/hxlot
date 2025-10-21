# Phase 3: UniApp生成器开发方案

**项目**: SmartAbp低代码引擎平台扩展
**阶段**: Phase 3 - UniApp移动端代码生成器开发
**工期**: 2周（10个工作日）
**负责人**: 前端架构师 + 2名前端开发
**依赖**: Phase 1（核心架构重构）已完成
**文档版本**: v1.0
**更新日期**: 2025-10-21

---

## 📋 一、项目背景和目标

### 1.1 业务场景

**目标项目**：
- MES移动端应用（产线巡检、设备报修）
- 智慧工地移动端应用（现场巡查、安全检查）

**核心需求**：
- **MES移动端**：产线数据查看、设备巡检、报修工单、离线数据
- **智慧工地移动端**：现场巡查、安全检查、问题上报、照片上传

### 1.2 技术挑战

**UniApp vs Vue3+ElementPlus差异**：

| 维度 | Vue3+ElementPlus | UniApp | 差异程度 |
|------|-----------------|--------|---------|
| **组件库** | Element Plus | uni-ui | ⭐⭐⭐⭐⭐ 极高 |
| **HTML标签** | div/span/p | view/text/button | ⭐⭐⭐⭐⭐ 极高 |
| **API调用** | axios | uni.request | ⭐⭐⭐⭐ 高 |
| **路由** | vue-router | uni.navigateTo/navigateBack | ⭐⭐⭐⭐⭐ 极高 |
| **存储** | localStorage | uni.setStorageSync | ⭐⭐⭐ 中 |
| **样式单位** | px/rem | rpx | ⭐⭐⭐⭐ 高 |
| **布局** | flex/grid | flex（部分平台受限） | ⭐⭐⭐ 中 |
| **平台** | 浏览器 | iOS/Android/H5/小程序 | ⭐⭐⭐⭐⭐ 极高 |

### 1.3 Phase 3目标

**核心目标**：
1. ✅ 开发UniAppGenerator（继承BaseFrontendGenerator）
2. ✅ 创建UniApp模板库（列表页、详情页、表单页）
3. ✅ 支持多端适配（iOS/Android/H5）
4. ✅ 支持离线数据存储和同步

**成功标准**：
- 生成的UniApp代码质量≥95分
- 支持三端运行（iOS/Android/H5）
- API对接正常
- 离线数据功能正常

---

## 🏗️ 二、技术架构设计

### 2.1 UniAppGenerator架构

```
UniAppGenerator（继承BaseFrontendGenerator）
├── GenerateListPageAsync()          ← 生成列表页
├── GenerateDetailPageAsync()        ← 生成详情页
├── GenerateFormPageAsync()          ← 生成表单页
├── GenerateApiClientAsync()         ← 生成API客户端（uni.request）
├── GenerateStoreAsync()             ← 生成Pinia Store
├── GeneratePagesConfigAsync()       ← 生成pages.json配置
└── GenerateManifestConfigAsync()    ← 生成manifest.json配置
```

### 2.2 模板结构

```
templates/uniapp/
├── list-page.hbs              ← 列表页
├── detail-page.hbs            ← 详情页
├── form-page.hbs              ← 表单页
├── api-client.hbs             ← API客户端（uni.request）
├── pinia-store.hbs            ← Pinia Store
├── pages.json.hbs             ← 页面配置
├── manifest.json.hbs          ← 应用配置
└── components/
    ├── empty-view.hbs         ← 空状态组件
    ├── loading-view.hbs       ← 加载组件
    └── error-view.hbs         ← 错误提示组件
```

### 2.3 UniApp特性支持

**核心特性**：
- ✅ 多端适配（iOS/Android/H5/小程序）
- ✅ uni-ui组件库
- ✅ uni.request API调用
- ✅ uni.navigateTo路由
- ✅ uni.setStorageSync离线存储
- ✅ rpx响应式单位
- ✅ 上拉加载、下拉刷新

---

## 💻 三、核心组件实现

### 3.1 UniAppGenerator.cs

```csharp
// src/SmartAbp.DevKit.Core/Generators/UniAppGenerator.cs
namespace SmartAbp.DevKit.Core.Generators
{
    public class UniAppGenerator : BaseFrontendGenerator
    {
        public override string Name => "UniAppGenerator";
        public override string Description => "生成UniApp移动应用代码";
        public override TargetPlatform Platform => TargetPlatform.UniApp;
        
        public UniAppGenerator(
            UnifiedMetadataSDK metadataSDK,
            ITemplateEngine templateEngine,
            PlatformAdapter platformAdapter,
            ILogger<UniAppGenerator> logger)
            : base(metadataSDK, templateEngine, platformAdapter, logger)
        {
        }
        
        public override async Task<GenerationResult> GenerateAsync(
            GenerationContext context,
            CancellationToken cancellationToken = default)
        {
            Logger.LogInformation("开始生成UniApp代码，实体：{EntityName}", context.EntityName);
            
            var result = new GenerationResult();
            var metadata = await MetadataSDK.GetEntityMetadataAsync(context.EntityName);
            
            // 1. 生成列表页
            result.GeneratedFiles.Add(await GenerateListPageAsync(metadata));
            
            // 2. 生成详情页
            result.GeneratedFiles.Add(await GenerateDetailPageAsync(metadata));
            
            // 3. 生成表单页
            result.GeneratedFiles.Add(await GenerateFormPageAsync(metadata));
            
            // 4. 生成API客户端（uni.request）
            result.GeneratedFiles.Add(await GenerateApiClientAsync(metadata));
            
            // 5. 生成Pinia Store
            result.GeneratedFiles.Add(await GenerateStoreAsync(metadata));
            
            // 6. 生成pages.json配置
            result.GeneratedFiles.Add(await GeneratePagesConfigAsync(metadata));
            
            // 7. 生成空状态/加载/错误组件
            result.GeneratedFiles.Add(await GenerateEmptyViewAsync(metadata));
            
            Logger.LogInformation("完成UniApp代码生成，文件数：{FileCount}",
                result.GeneratedFiles.Count);
            
            return result;
        }
        
        protected override async Task<GeneratedFile> GenerateListPageAsync(EntityMetadata metadata)
        {
            var content = await PlatformAdapter.GenerateFrontendCodeAsync(
                Platform,
                metadata,
                "ListPage"
            );
            
            return new GeneratedFile
            {
                Path = $"pages/{metadata.NameKebab}/list.vue",
                Content = content,
                FileType = FileType.UniAppVue,
                Description = "列表页"
            };
        }
        
        protected override async Task<GeneratedFile> GenerateApiClientAsync(EntityMetadata metadata)
        {
            var content = await PlatformAdapter.GenerateFrontendCodeAsync(
                Platform,
                metadata,
                "ApiClient"
            );
            
            return new GeneratedFile
            {
                Path = $"api/{metadata.NameKebab}-api.ts",
                Content = content,
                FileType = FileType.TypeScript,
                Description = "API客户端（uni.request）"
            };
        }
        
        protected override async Task<GeneratedFile> GenerateStoreAsync(EntityMetadata metadata)
        {
            var content = await PlatformAdapter.GenerateFrontendCodeAsync(
                Platform,
                metadata,
                "Store"
            );
            
            return new GeneratedFile
            {
                Path = $"stores/{metadata.NameKebab}-store.ts",
                Content = content,
                FileType = FileType.TypeScript,
                Description = "Pinia Store"
            };
        }
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // UniApp特有生成方法
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        
        private async Task<GeneratedFile> GenerateDetailPageAsync(EntityMetadata metadata)
        {
            var content = await PlatformAdapter.GenerateFrontendCodeAsync(
                Platform,
                metadata,
                "DetailPage"
            );
            
            return new GeneratedFile
            {
                Path = $"pages/{metadata.NameKebab}/detail.vue",
                Content = content,
                FileType = FileType.UniAppVue,
                Description = "详情页"
            };
        }
        
        private async Task<GeneratedFile> GenerateFormPageAsync(EntityMetadata metadata)
        {
            var content = await PlatformAdapter.GenerateFrontendCodeAsync(
                Platform,
                metadata,
                "FormPage"
            );
            
            return new GeneratedFile
            {
                Path = $"pages/{metadata.NameKebab}/form.vue",
                Content = content,
                FileType = FileType.UniAppVue,
                Description = "表单页"
            };
        }
        
        private async Task<GeneratedFile> GeneratePagesConfigAsync(EntityMetadata metadata)
        {
            var content = await PlatformAdapter.GenerateFrontendCodeAsync(
                Platform,
                metadata,
                "PagesConfig"
            );
            
            return new GeneratedFile
            {
                Path = "pages.json",
                Content = content,
                FileType = FileType.UniAppJson,
                Description = "页面配置"
            };
        }
        
        private async Task<GeneratedFile> GenerateEmptyViewAsync(EntityMetadata metadata)
        {
            var content = await TemplateEngine.RenderAsync(
                "templates/uniapp/components/empty-view.hbs",
                metadata
            );
            
            return new GeneratedFile
            {
                Path = "components/empty-view.vue",
                Content = content,
                FileType = FileType.UniAppVue,
                Description = "空状态组件"
            };
        }
    }
}
```

### 3.2 模板示例

#### 3.2.1 列表页模板（list-page.hbs）

```handlebars
{{!-- templates/uniapp/list-page.hbs --}}
<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <uni-search-bar
        v-model="searchKeyword"
        placeholder="请输入关键词"
        @confirm="handleSearch"
        @clear="handleClear"
      />
    </view>
    
    <!-- 列表 -->
    <scroll-view
      scroll-y
      class="scroll-view"
      @scrolltolower="handleLoadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="handleRefresh"
    >
      <!-- 数据列表 -->
      <view
        v-for="item in list"
        :key="item.id"
        class="list-item"
        @click="handleDetail(item.id)"
      >
        <view class="item-content">
          <text class="item-title">{{ item.{{PrimaryDisplayField}} }}</text>
          {{#each SecondaryFields}}
          <text class="item-desc">{{DisplayName}}: {{ item.{{Name}} }}</text>
          {{/each}}
        </view>
        <uni-icons type="right" size="16" color="#999" />
      </view>
      
      <!-- 加载更多 -->
      <view v-if="loading" class="loading-more">
        <uni-load-more status="loading" />
      </view>
      
      <!-- 没有更多 -->
      <view v-if="noMore && list.length > 0" class="no-more">
        <text>没有更多数据了</text>
      </view>
      
      <!-- 空状态 -->
      <empty-view v-if="!loading && list.length === 0" />
    </scroll-view>
    
    <!-- 浮动按钮 -->
    <view class="fab" @click="handleCreate">
      <uni-icons type="plus" size="24" color="#fff" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { use{{EntityName}}Store } from '@/stores/{{EntityNameKebab}}-store'
import EmptyView from '@/components/empty-view.vue'

const store = use{{EntityName}}Store()

// 搜索关键词
const searchKeyword = ref('')

// 列表数据
const list = ref<any[]>([])
const loading = ref(false)
const refreshing = ref(false)
const noMore = ref(false)

// 分页
const pagination = ref({
  current: 1,
  pageSize: 20
})

// 加载数据
const loadData = async (append = false) => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    const result = await store.getList({
      keyword: searchKeyword.value,
      skipCount: (pagination.value.current - 1) * pagination.value.pageSize,
      maxResultCount: pagination.value.pageSize
    })
    
    if (append) {
      list.value.push(...result.items)
    } else {
      list.value = result.items
    }
    
    noMore.value = list.value.length >= result.totalCount
  } catch (error) {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.current = 1
  loadData()
}

// 清空搜索
const handleClear = () => {
  searchKeyword.value = ''
  handleSearch()
}

// 下拉刷新
const handleRefresh = () => {
  refreshing.value = true
  pagination.value.current = 1
  loadData()
}

// 上拉加载
const handleLoadMore = () => {
  if (noMore.value || loading.value) return
  
  pagination.value.current++
  loadData(true)
}

// 查看详情
const handleDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/{{EntityNameKebab}}/detail?id=${id}`
  })
}

// 新增
const handleCreate = () => {
  uni.navigateTo({
    url: '/pages/{{EntityNameKebab}}/form'
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.search-bar {
  background-color: #fff;
  padding: 20rpx;
}

.scroll-view {
  flex: 1;
  padding: 20rpx;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 12rpx;
}

.item-desc {
  font-size: 28rpx;
  color: #999;
  display: block;
  margin-top: 8rpx;
}

.loading-more,
.no-more {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 28rpx;
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 100rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
}
</style>
```

#### 3.2.2 API客户端模板（api-client.hbs）

```handlebars
{{!-- templates/uniapp/api-client.hbs --}}
// api/{{EntityNameKebab}}-api.ts
import type {
  {{EntityName}}Dto,
  Create{{EntityName}}Dto,
  Update{{EntityName}}Dto,
  {{EntityName}}PagedRequestDto
} from '@/types/{{EntityNameKebab}}.types'
import type { PagedResultDto } from '@/types/common.types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * 发送请求（封装uni.request）
 */
function request<T>(options: {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
}): Promise<T> {
  return new Promise((resolve, reject) => {
    // 获取Token
    const token = uni.getStorageSync('token')
    
    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data as T)
        } else {
          reject(new Error(`请求失败：${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 获取列表
 */
export function get{{EntityName}}List(
  params: {{EntityName}}PagedRequestDto
): Promise<PagedResultDto<{{EntityName}}Dto>> {
  return request({
    url: '/api/{{EntityNameKebab}}',
    method: 'GET',
    data: params
  })
}

/**
 * 获取详情
 */
export function get{{EntityName}}ById(id: string): Promise<{{EntityName}}Dto> {
  return request({
    url: `/api/{{EntityNameKebab}}/${id}`,
    method: 'GET'
  })
}

/**
 * 创建
 */
export function create{{EntityName}}(
  data: Create{{EntityName}}Dto
): Promise<{{EntityName}}Dto> {
  return request({
    url: '/api/{{EntityNameKebab}}',
    method: 'POST',
    data
  })
}

/**
 * 更新
 */
export function update{{EntityName}}(
  id: string,
  data: Update{{EntityName}}Dto
): Promise<{{EntityName}}Dto> {
  return request({
    url: `/api/{{EntityNameKebab}}/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除
 */
export function delete{{EntityName}}(id: string): Promise<void> {
  return request({
    url: `/api/{{EntityNameKebab}}/${id}`,
    method: 'DELETE'
  })
}
```

#### 3.2.3 pages.json配置模板（pages.json.hbs）

```handlebars
{{!-- templates/uniapp/pages.json.hbs --}}
{
  "pages": [
    {
      "path": "pages/{{EntityNameKebab}}/list",
      "style": {
        "navigationBarTitleText": "{{DisplayName}}列表",
        "enablePullDownRefresh": true
      }
    },
    {
      "path": "pages/{{EntityNameKebab}}/detail",
      "style": {
        "navigationBarTitleText": "{{DisplayName}}详情"
      }
    },
    {
      "path": "pages/{{EntityNameKebab}}/form",
      "style": {
        "navigationBarTitleText": "{{DisplayName}}表单"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "{{AppName}}",
    "navigationBarBackgroundColor": "#F8F8F8",
    "backgroundColor": "#F8F8F8"
  },
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#3cc51f",
    "borderStyle": "black",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/{{EntityNameKebab}}/list",
        "iconPath": "static/icon/home.png",
        "selectedIconPath": "static/icon/home-active.png",
        "text": "首页"
      }
    ]
  }
}
```

---

## 📝 四、开发步骤（10天详细计划）

### Week 1：核心生成器和通用模板

#### Day 1-2：UniAppGenerator开发（2天）

**任务清单**：
1. 创建UniAppGenerator.cs（继承BaseFrontendGenerator）
2. 实现所有抽象方法
3. 添加UniApp特有生成方法
4. 单元测试

**验收标准**：
- ✅ 代码质量≥95分
- ✅ 单元测试覆盖率≥85%

#### Day 3-5：通用模板开发（3天）

**任务清单**：
1. 创建list-page.hbs（列表页）
2. 创建detail-page.hbs（详情页）
3. 创建form-page.hbs（表单页）
4. 创建api-client.hbs（API客户端）
5. 创建pinia-store.hbs（Store）
6. 创建pages.json.hbs（配置）

**验收标准**：
- ✅ 模板可正常渲染
- ✅ 生成的代码可编译
- ✅ 生成的代码可运行（iOS/Android/H5）

---

### Week 2：多端适配和离线功能

#### Day 6-7：多端适配（2天）

**任务清单**：
1. iOS平台适配（安全区域、刘海屏）
2. Android平台适配（返回键处理）
3. H5平台适配（浏览器兼容性）
4. 小程序平台适配（基础支持）

**验收标准**：
- ✅ iOS运行正常
- ✅ Android运行正常
- ✅ H5运行正常

#### Day 8-9：离线数据功能（2天）

**任务清单**：
1. 实现离线数据存储（uni.setStorageSync）
2. 实现数据同步机制
3. 实现网络状态检测
4. 实现冲突解决策略

**验收标准**：
- ✅ 离线数据存储正常
- ✅ 数据同步正常
- ✅ 网络状态检测正常

#### Day 10：完整测试和文档（1天）

**任务清单**：
1. 完整集成测试
2. 性能测试
3. 文档更新

**验收标准**：
- ✅ 所有测试通过
- ✅ 文档完整

---

## ✅ 五、验收标准

### 5.1 功能验收

| 验收项 | 验收标准 | 验收方式 |
|--------|---------|---------|
| UniAppGenerator | 继承BaseFrontendGenerator，实现所有抽象方法 | 代码审查 |
| 列表页 | 支持搜索、分页、下拉刷新、上拉加载 | 功能测试 |
| 详情页 | 数据展示完整 | 功能测试 |
| 表单页 | 表单验证、提交正常 | 功能测试 |
| API客户端 | uni.request封装正确 | 集成测试 |
| 多端运行 | iOS/Android/H5运行正常 | 多端测试 |

### 5.2 质量验收

| 质量指标 | 目标值 | 验收方式 |
|---------|-------|---------|
| 代码质量 | ≥95分 | SonarQube |
| TypeScript编译 | 0错误 | tsc --noEmit |
| ESLint检查 | 0警告 | eslint --fix |

### 5.3 性能验收

| 性能指标 | 目标值 | 验收方式 |
|---------|-------|---------|
| 列表首屏加载 | <1秒 | 性能测试 |
| API请求时间 | <500ms | Network Monitor |
| 内存占用 | <150MB | Memory Profiler |

---

## 🧪 六、测试方案

### 6.1 单元测试

```csharp
[Fact]
public async Task UniAppGenerator_GenerateListPage_Success()
{
    var generator = new UniAppGenerator(_metadataSDK, _templateEngine, 
        _platformAdapter, _logger);
    var context = CreateTestContext();
    
    var result = await generator.GenerateAsync(context);
    
    Assert.NotNull(result);
    Assert.Contains(result.GeneratedFiles, f => f.Path.Contains("list.vue"));
}
```

### 6.2 多端测试

**测试平台**：
- iOS（真机 + 模拟器）
- Android（真机 + 模拟器）
- H5（Chrome + Safari）

**测试步骤**：
```bash
# 1. 生成UniApp代码
dotnet devkit generate -e Order -p UniApp

# 2. 编译检查
cd src/SmartAbp.UniApp && npm run type-check

# 3. 运行H5
npm run dev:h5

# 4. 运行iOS
npm run dev:ios

# 5. 运行Android
npm run dev:android
```

---

## 📦 七、交付清单

### 7.1 代码交付

| 文件路径 | 说明 | 状态 |
|---------|------|------|
| `src/SmartAbp.DevKit.Core/Generators/UniAppGenerator.cs` | UniApp生成器 | ✅ 新增 |
| `templates/uniapp/list-page.hbs` | 列表页模板 | ✅ 新增 |
| `templates/uniapp/detail-page.hbs` | 详情页模板 | ✅ 新增 |
| `templates/uniapp/form-page.hbs` | 表单页模板 | ✅ 新增 |
| `templates/uniapp/api-client.hbs` | API客户端模板 | ✅ 新增 |
| `templates/uniapp/pinia-store.hbs` | Store模板 | ✅ 新增 |
| `templates/uniapp/pages.json.hbs` | 配置模板 | ✅ 新增 |

### 7.2 文档交付

| 文件路径 | 说明 | 状态 |
|---------|------|------|
| `docs/开发方案/Phase3-UniApp生成器开发方案.md` | 本文档 | ✅ 完成 |
| `docs/使用指南/UniApp代码生成指南.md` | 使用指南 | ✅ 新增 |

---

## 🎯 八、成功指标

- ✅ UniApp代码生成器完整实现
- ✅ 支持三端运行（iOS/Android/H5）
- ✅ API对接正常
- ✅ 代码质量≥95分

**Phase 3 完成标志**：
- ✅ 所有代码合并到主分支
- ✅ 所有测试通过
- ✅ 三端运行正常

**下一步**：Phase 4 - Dashboard后端链路开发

