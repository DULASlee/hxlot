# 🛡️ AI断线守护MCP服务使用指南

## 📋 概述

**AI Guardian MCP Server** 是专为解决Cursor IDE中AI大模型断线问题而设计的企业级解决方案。

### 核心功能

1. **智能断线检测**: 基于活动模式判断AI是否离线
2. **自动检查点**: 关键节点自动保存执行状态
3. **快速恢复**: 生成清晰的恢复指令模板
4. **心跳监控**: 30秒间隔检测AI在线状态

## 🚀 快速开始

### 1. 配置Cursor IDE

在 `.cursor/settings.json` 中添加MCP配置：

```json
{
  "mcp.servers": {
    "ai-guardian": {
      "command": "node",
      "args": [
        "${workspaceFolder}/tools/ai-guardian/mcp-ai-guardian-server.js"
      ],
      "env": {
        "AI_GUARDIAN_PROJECT_ROOT": "${workspaceFolder}",
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 2. 重启Cursor IDE

保存配置后，重启Cursor IDE使MCP服务生效。

### 3. 验证服务状态

在Cursor聊天框中测试：

```
@ai_guardian_status
```

## 💡 使用方式

### 方式1: 自动心跳（推荐）

AI每次执行操作时自动调用：

```typescript
// AI在执行任务时自动记录活动
@ai_guardian_ping { "activity": "正在生成代码" }
```

### 方式2: 手动检查点

在关键任务节点创建检查点：

```typescript
@ai_guardian_checkpoint {
  "stage": "代码生成阶段",
  "task": "生成用户管理模块",
  "progress": 60,
  "completedTasks": ["创建Entity", "创建DTO"],
  "pendingTasks": ["创建Service", "创建Controller"]
}
```

### 方式3: 查看状态

随时查看AI在线状态：

```typescript
@ai_guardian_status
```

### 方式4: 生成恢复指令

断线后生成恢复指令：

```typescript
@ai_guardian_recover
```

## 🔍 工作原理

### 断线检测机制

```
AI活动记录 → 计算无活动时长 → 超过90秒 → 判断为离线
```

**关键参数**:
- **检测阈值**: 90秒无活动
- **心跳间隔**: 30秒检测一次
- **恢复尝试**: 最多3次自动恢复

### 检查点机制

```
执行任务 → 创建检查点 → 保存状态 → 断线恢复 → 继续执行
```

**检查点包含**:
- 执行阶段
- 当前任务
- 完成进度
- 已完成任务列表
- 待执行任务列表
- 时间戳

### 恢复流程

```
检测离线 → 生成恢复指令 → 保存到文件 → 用户复制粘贴 → AI继续执行
```

## 📊 状态文件

### 状态文件位置

```
.ai-engine/
├── ai-state.json          # AI状态持久化
├── checkpoint-*.json       # 检查点快照
└── logs/
    └── recovery-*.txt      # 恢复指令
```

### 状态文件示例

```json
{
  "lastActivity": 1696428000000,
  "lastCheckpoint": {
    "stage": "代码生成阶段",
    "task": "生成用户管理模块",
    "progress": 60,
    "completedTasks": ["创建Entity", "创建DTO"],
    "pendingTasks": ["创建Service", "创建Controller"],
    "timestamp": "2025-10-04T10:00:00.000Z"
  },
  "activityHistory": [
    { "activity": "正在生成代码", "timestamp": "2025-10-04T09:59:00.000Z" },
    { "activity": "正在创建文件", "timestamp": "2025-10-04T09:58:00.000Z" }
  ],
  "timestamp": "2025-10-04T10:00:00.000Z"
}
```

## 🎯 最佳实践

### 1. 频繁创建检查点

在关键节点创建检查点，确保断线后能快速恢复：

```typescript
// ✅ 好的做法：每完成一个大任务就创建检查点
@ai_guardian_checkpoint {
  "stage": "优化阶段",
  "task": "完成优化2-执行性能监控",
  "progress": 30,
  "completedTasks": ["优化1完成"],
  "pendingTasks": ["优化3", "优化4", "优化5"]
}

// ❌ 不好的做法：一直不创建检查点
```

### 2. 定期查看状态

每30分钟查看一次AI状态，确保服务正常：

```typescript
@ai_guardian_status
```

### 3. 断线后立即恢复

发现AI断线后，立即使用恢复工具：

```typescript
@ai_guardian_recover
```

### 4. 保持活动记录

AI在执行任务时保持活动记录更新：

```typescript
@ai_guardian_ping { "activity": "正在编写代码" }
@ai_guardian_ping { "activity": "正在运行测试" }
@ai_guardian_ping { "activity": "正在提交代码" }
```

## 🔧 高级配置

### 调整检测阈值

修改 `mcp-ai-guardian-server.js` 中的参数：

```javascript
this.offlineDetectionThreshold = 90000; // 90秒（可调整）
this.heartbeatInterval = 30000;          // 30秒（可调整）
this.maxRecoveryAttempts = 3;            // 最多3次（可调整）
```

### 自定义恢复指令

修改 `generateRecoveryCommand()` 方法自定义恢复指令格式。

## 📈 监控和调试

### 查看服务日志

```bash
# 服务启动日志会显示在Cursor的输出面板
# 查看 "MCP: ai-guardian" 输出
```

### 检查状态文件

```bash
# 查看AI状态
cat .ai-engine/ai-state.json

# 查看最新检查点
ls -lt .ai-engine/checkpoint-*.json | head -1 | xargs cat

# 查看恢复指令
ls -lt .ai-engine/logs/recovery-*.txt | head -1 | xargs cat
```

## ❓ 常见问题

### Q1: AI Guardian服务没有启动？

**解决方案**:
1. 检查 `.cursor/settings.json` 配置是否正确
2. 重启Cursor IDE
3. 查看Cursor输出面板的MCP日志

### Q2: 检测不到AI离线？

**解决方案**:
1. 确保AI在执行任务时调用了 `@ai_guardian_ping`
2. 降低 `offlineDetectionThreshold` 阈值
3. 检查状态文件 `.ai-engine/ai-state.json`

### Q3: 恢复指令无效？

**解决方案**:
1. 确保创建了检查点
2. 检查检查点文件是否包含完整信息
3. 手动补充上下文信息

### Q4: 服务占用资源过高？

**解决方案**:
1. 增加 `heartbeatInterval` 间隔（如60秒）
2. 减少活动历史记录数量
3. 定期清理旧检查点文件

## 🚀 后续优化

### Python守护脚本（备选方案）

如果MCP方案无法满足需求，可以启用Python守护脚本：

```python
# 见 tools/ai-guardian/guardian-daemon.py
python tools/ai-guardian/guardian-daemon.py
```

### VS Code Extension（长期方案）

开发独立的Cursor Extension，获得更强的IDE控制能力。

## 📚 相关文档

- [MCP协议规范](https://modelcontextprotocol.io/)
- [AI编程铁律执行引擎](.cursor/rules/00_执行引擎.mdc)
- [执行引擎守护检查机制](../architecture/execution-guardian.md)

---

**版本**: 1.0.0  
**更新日期**: 2025-10-04  
**维护者**: 世界顶级微服务架构师

