# MCP Script Executor - AI增量编程守护

## 🎯 核心功能

1. **增量编程监控**：自动追踪AI编写的代码行数
2. **280行轻量检查**：自动执行TypeScript + ESLint检查，通过后继续编程
3. **300行质量门禁**：自动执行五关检查，通过后重置计数器
4. **30分钟规则重载**：自动重新加载项目规则文件
5. **Git提交管理**：仅在所有TODO任务完成时提交
6. **跨平台支持**：Windows、Linux、macOS全平台兼容

## 📦 安装配置

### 1. 启动MCP服务

```bash
# 开发模式（不真正执行脚本）
node tools/ai-guardian/mcp-script-executor.js --test

# 生产模式
node tools/ai-guardian/mcp-script-executor.js
```

### 2. 配置Cursor/VS Code

在`.cursor/mcp-config.json`中配置：

```json
{
  "mcpServers": {
    "AIGuardian": {
      "command": "node",
      "args": ["tools/ai-guardian/mcp-script-executor.js"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

## 🚀 使用方式

### AI编程工作流

```
开始开发
  ↓
AI编写代码 → mcp_record_code_lines(lines, context)
  ↓
280行? → 自动轻量检查 → 通过 → 继续编程
  ↓
300行? → 自动质量门禁 → 通过 → 重置计数器 → 下一个任务
  ↓
所有TODO完成? → mcp_git_commit_all(message)
  ↓
完成
```

### MCP工具列表

#### 1. `mcp_record_code_lines` - 记录代码行数（核心）

**用途**：AI每写完一段代码后必须调用

```json
{
  "lines": 50,
  "context": "创建UserStore"
}
```

**返回**：
- `currentLines`: 当前会话总行数
- `actions`: 自动触发的检查（280/300行）
- `autoExecuted`: 是否自动执行了检查

#### 2. `mcp_get_session_state` - 查询会话状态

**用途**：查看当前编程进度

```json
{}
```

**返回**：
- `sessionId`: 会话ID
- `currentLines`: 当前行数
- `checkpointHistory`: 检查点历史
- `status`: `CODING` | `IN_CHECK` | `COMPLETED_TASK`

#### 3. `mcp_git_commit_all` - Git提交

**用途**：所有TODO任务完成后提交

```json
{
  "message": "feat: 完成用户、文章、评论模块"
}
```

**注意**：仅在所有开发任务完成或用户明确命令时调用！

#### 4. `mcp_reload_rules` - 重载规则

**用途**：立即重新加载规则文件（30分钟自动执行）

```json
{
  "immediate": true
}
```

#### 5. `mcp_execute_script` - 执行脚本

**用途**：执行任意脚本（跨平台）

```json
{
  "scriptPath": "scripts/quality/expert-mode-nine-layers.ps1",
  "args": ["-SkipGitSync"]
}
```

## 🧪 测试

```bash
# 测试完整工作流
node tools/ai-guardian/test-full-workflow.js

# 测试280行检查点
node tools/ai-guardian/test-280-checkpoint.js

# 测试增量编程
node tools/ai-guardian/test-incremental-programming.js
```

## 🎯 关键特性

### 1. 增量编程闭环

```
AI编程 → 记录 → 280行检查 → 通过继续 → 300行门禁 → 重置 → 继续
```

**不会**：
- ❌ 280行后停下等用户确认（自动继续）
- ❌ 300行后立即Git提交（继续下一个任务）

**只在所有TODO完成后才Git提交！**

### 2. 跨平台命令

| 平台 | npm命令 | PowerShell | Shell |
|-----|---------|-----------|-------|
| Windows | `npm.cmd` | `pwsh -File` | - |
| Linux | `npm` | - | `bash` |
| macOS | `npm` | `pwsh -File` | `bash` |

### 3. 状态持久化

会话状态保存在：`.ai-engine/session-state.json`

- 同一天会话自动恢复
- 新的一天自动重置
- Git提交后完全重置

## 📊 执行示例

### 场景：开发3个任务

```bash
# 任务1: 用户管理 (300行)
mcp_record_code_lines(50, "创建UserStore")      # 50/300
mcp_record_code_lines(100, "实现CRUD")          # 150/300
mcp_record_code_lines(150, "权限管理")          # 300/300 → 自动门禁 → 重置

# 任务2: 文章管理 (300行)
mcp_record_code_lines(80, "创建ArticleStore")  # 80/300
mcp_record_code_lines(220, "富文本编辑器")     # 300/300 → 自动门禁 → 重置

# 任务3: 评论系统 (150行)
mcp_record_code_lines(150, "评论功能")         # 150/300

# 所有任务完成
mcp_git_commit_all("feat: 完成用户、文章、评论模块") → Git提交 → 重置会话
```

## ⚠️ 注意事项

1. **不要手动删除**：`.ai-engine/session-state.json` 文件（会话状态）
2. **Git提交时机**：仅在所有TODO完成或用户命令时
3. **280行检查**：必须通过后才能继续，不是建议
4. **300行门禁**：通过后自动重置，继续下一个任务
5. **测试模式**：使用`{ testMode: true }`避免真正执行脚本

## 🔧 故障排查

### 会话状态错误

```bash
# 清除会话状态
Remove-Item .ai-engine/session-state.json -Force
```

### 检查点未触发

确保调用`mcp_record_code_lines`时行数正确：
- 280行：触发轻量检查
- 300行：触发质量门禁

### 跨平台问题

检查脚本路径和权限：
- Windows: `pwsh -File`
- Linux/macOS: `bash` 或 `chmod +x`

## 📚 相关文档

- [AI编程执行引擎](../../.cursor/rules/00_执行引擎.mdc)
- [核心原则](../../.cursor/rules/00_核心原则.mdc)
- [质量门禁脚本](../../scripts/quality/README-expert-mode.md)

