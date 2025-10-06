# Schema版本升级指南

## 📋 文档概述

**版本**: v1.0.0  
**更新日期**: 2025-10-06  
**适用范围**: SmartAbp LowCode Engine统一元数据Schema

---

## 🎯 版本升级策略

### 语义化版本规范

**格式**: `MAJOR.MINOR.PATCH`

- **MAJOR**(主版本): 不兼容的API修改
- **MINOR**(次版本): 向后兼容的功能性新增
- **PATCH**(修订号): 向后兼容的BUG修复

### 版本兼容性矩阵

| 客户端版本 | 服务端版本 | 兼容性 | 建议操作 |
|---|---|---|---|
| 1.0.0 | 1.0.0 | ✅ 完全兼容 | 无需操作 |
| 1.0.0 | 1.0.1 | ✅ 向后兼容 | 建议升级(Patch) |
| 1.0.0 | 1.1.0 | ✅ 向后兼容 | 建议升级(Minor) |
| 1.0.0 | 2.0.0 | ❌ 不兼容 | 必须升级(Major) |
| 1.1.0 | 1.0.0 | ⚠️ 警告 | 部分功能不可用 |
| 2.0.0 | 1.0.0 | ❌ 不兼容 | 服务端需升级 |

---

## 🚀 前端自动升级流程

### 1. 版本检测

**时机**:
- 应用启动时
- 定时轮询(推荐:1分钟)
- API调用前

**实现**:
```typescript
import { useSchemaVersion } from '@smartabp/lowcode-shared'

// 在App.vue或主布局中
const { compatibilityResult, isCompatible, handleUpgrade } = useSchemaVersion({
  autoCheck: true,
  checkInterval: 60000, // 1分钟
  versionApiUrl: '/api/lowcode/schema/version'
})
```

### 2. 版本不兼容警告

**显示组件**:
```vue
<template>
  <VersionWarningBanner
    :compatibility-result="compatibilityResult"
    @action="handleUpgrade"
  />
</template>

<script setup lang="ts">
import { VersionWarningBanner } from '@smartabp/lowcode-shared'
</script>
```

**用户体验**:
- **INCOMPATIBLE**: 红色横幅，强制刷新按钮
- **NEED_UPGRADE**: 黄色横幅，建议刷新按钮
- **NEED_DOWNGRADE**: 蓝色横幅，提示警告

### 3. 自动刷新机制

**触发条件**:
- 用户点击"立即刷新"按钮
- 主版本不兼容时自动刷新(可配置)

**实现**:
```typescript
function handleUpgrade() {
  // 清除缓存
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name))
    })
  }
  
  // 刷新页面
  window.location.reload(true) // 强制从服务器重新加载
}
```

---

## 🔄 后端版本协商机制

### 1. API响应包含版本信息

**所有API响应格式**:
```json
{
  "success": true,
  "data": { /* 业务数据 */ },
  "schemaVersion": {
    "version": "1.0.0",
    "schemaName": "LowCodeEntitySchema",
    "isActive": true,
    "releaseDate": "2025-10-06T00:00:00Z"
  }
}
```

### 2. 版本验证中间件(可选)

**C# ASP.NET Core中间件**:
```csharp
public class SchemaVersionMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        var clientVersion = context.Request.Headers["X-Schema-Version"];
        
        if (!string.IsNullOrEmpty(clientVersion))
        {
            var isCompatible = _versionService.IsCompatible(clientVersion);
            
            if (!isCompatible)
            {
                context.Response.Headers.Add("X-Schema-Upgrade-Required", "true");
                context.Response.Headers.Add("X-Schema-Current-Version", CurrentVersion);
            }
        }
        
        await _next(context);
    }
}
```

### 3. 版本历史API

**查询已发布版本**:
```http
GET /api/lowcode/schema/version/history
```

**响应**:
```json
{
  "versions": [
    {
      "version": "1.0.0",
      "releaseDate": "2025-10-01",
      "isBreakingChange": false,
      "changeType": "Major",
      "description": "初始版本"
    },
    {
      "version": "1.0.1",
      "releaseDate": "2025-10-05",
      "isBreakingChange": false,
      "changeType": "Patch",
      "description": "修复字段验证BUG"
    }
  ]
}
```

---

## 🛡️ 平滑升级最佳实践

### 1. 渐进式升级(推荐)

**步骤**:
1. **后端先升级**: 确保向后兼容
2. **灰度发布**: 部分用户先体验新版本
3. **监控指标**: 观察错误率、性能指标
4. **全量发布**: 确认无问题后全量升级

### 2. 蓝绿部署

**策略**:
- 蓝环境: 当前版本(1.0.0)
- 绿环境: 新版本(1.1.0)
- 切换时机: 所有用户会话结束或强制刷新

### 3. 版本共存(复杂场景)

**适用场景**:
- 多租户SaaS系统
- 不同租户使用不同Schema版本

**实现**:
```typescript
// 前端根据租户版本加载不同Schema
const schemaVersion = useTenantSchemaVersion()

if (schemaVersion.major === 1) {
  // 加载v1 Schema
} else if (schemaVersion.major === 2) {
  // 加载v2 Schema
}
```

---

## 📊 升级检查清单

### 升级前检查

- [ ] 阅读版本变更日志
- [ ] 确认是否有破坏性变更
- [ ] 备份当前数据和配置
- [ ] 准备回滚方案
- [ ] 通知用户升级时间窗口

### 升级中监控

- [ ] 后端服务健康检查
- [ ] API响应时间监控
- [ ] 前端错误率监控
- [ ] 用户会话活跃度

### 升级后验证

- [ ] 核心功能回归测试
- [ ] 数据一致性验证
- [ ] 性能基准对比
- [ ] 用户反馈收集

---

## 🆘 升级失败回滚

### 快速回滚步骤

**1. 前端回滚**:
```bash
# 回滚到上一个版本的构建
cd /path/to/frontend
git checkout v1.0.0
npm run build
pm2 restart frontend
```

**2. 后端回滚**:
```bash
# 回滚到上一个版本
cd /path/to/backend
git checkout v1.0.0
dotnet publish -c Release
systemctl restart smartabp-api
```

**3. 数据库回滚(如有Schema变更)**:
```bash
# 运行回滚脚本
dotnet ef database update PreviousMigration
```

### 回滚验证

- [ ] 版本号已回滚到预期版本
- [ ] 核心功能正常
- [ ] 数据完整性验证通过
- [ ] 用户可以正常访问

---

## 🔍 常见问题

### Q1: 用户浏览器缓存导致版本不更新?

**A**: 使用以下策略:
```html
<!-- 在index.html中添加cache-control meta标签 -->
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

或在构建时使用hash文件名:
```javascript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js'
      }
    }
  }
}
```

### Q2: 如何处理长时间运行的用户会话?

**A**: 使用WebSocket或Server-Sent Events推送升级通知:
```typescript
// 监听服务端推送的升级通知
const eventSource = new EventSource('/api/events/schema-updates')

eventSource.addEventListener('schema-upgrade', (event) => {
  const { newVersion } = JSON.parse(event.data)
  
  // 显示升级提示
  showUpgradeNotification(newVersion)
})
```

### Q3: 如何避免破坏性变更?

**A**: 遵循以下原则:
- ✅ 添加字段(可选):允许
- ✅ 字段重命名+保留旧字段:允许
- ❌ 删除字段:不允许(标记为deprecated)
- ❌ 修改字段类型:不允许(添加新字段)
- ❌ 修改字段语义:不允许(Major版本变更)

---

## 📚 相关文档

- [Schema版本管理API文档](./Schema版本管理API.md)
- [前端版本检测Hook文档](../packages/lowcode-shared/src/version/README.md)
- [版本历史查询接口](./版本历史API.md)

---

**🚀 Schema版本升级指南 - 确保平滑升级,零停机部署!**

