# MCP激活与验证指南

## ✅ MCP已配置完成

MCP服务器`ai-guardian`已成功配置到Cursor中。

## 🔄 激活步骤

### 1. 重启Cursor

**必须重启Cursor才能加载新的MCP配置**

1. 完全关闭Cursor
2. 重新打开Cursor
3. 打开项目文件夹

### 2. 验证MCP已加载

**方式1: 通过Cursor界面**

1. 打开Cursor设置 (Ctrl+,)
2. 搜索 "MCP"
3. 查看是否显示 `ai-guardian` 服务器

**方式2: 通过AI聊天**

在Cursor中询问AI：

```
请列出可用的MCP工具
```

AI应该能看到以下工具：
- `mcp_record_code_lines`
- `mcp_get_session_state`
- `mcp_git_commit_all`
- `mcp_reload_rules`
- `mcp_execute_script`

### 3. 测试MCP功能

**测试1: 查询会话状态**

让AI执行：

```
请使用mcp_get_session_state查询当前编程状态
```

**测试2: 记录代码行数（模拟）**

让AI执行：

```
假设我刚写了50行代码，请使用mcp_record_code_lines记录
```

## 📋 配置文件清单

以下文件已更新：

| 文件 | 更新内容 |
|------|---------|
| `.cursor/mcp-settings.json` | ✅ 添加ai-guardian服务器配置 |
| `.cursor/rules/00_执行引擎.mdc` | ✅ 添加MCP工具使用说明 |
| `.cursorrules` | ✅ 添加MCP核心使用规则 |

## 🎯 AI使用MCP的工作流

### 标准编程流程

```
1. AI开始编程
   ↓
2. AI写完一段代码（如50行）
   ↓
3. AI调用: mcp_record_code_lines({ lines: 50, context: "创建UserStore" })
   ↓
4. MCP自动监控:
   - 280行: 自动执行轻量检查 → 通过继续
   - 300行: 自动执行质量门禁 → 通过 → 重置计数器
   ↓
5. AI继续编程下一个任务
   ↓
6. 所有任务完成
   ↓
7. AI调用: mcp_git_commit_all({ message: "feat: 完成所有功能" })
```

### AI必须遵守的规则

```yaml
✅ 必须做:
  - AI每写完代码必须调用mcp_record_code_lines
  - 280/300行检查自动执行，AI继续编程
  - 只在所有TODO任务完成后才Git提交

❌ 禁止做:
  - 不在280行后停下等待用户确认
  - 不在300行后立即Git提交
  - 不在单个任务完成后就Git提交
```

## 🧪 完整测试场景

**场景：开发3个功能模块**

```bash
# 用户命令
开始开发：用户管理、文章管理、评论系统

# AI执行流程：

# 任务1: 用户管理 (300行)
1. AI编写50行代码
2. mcp_record_code_lines({ lines: 50, context: "创建UserStore" })
3. AI编写100行代码
4. mcp_record_code_lines({ lines: 100, context: "实现CRUD" })
5. AI编写150行代码
6. mcp_record_code_lines({ lines: 150, context: "权限管理" })
   → 触发300行门禁 → 通过 → 重置计数器

# 任务2: 文章管理 (300行)
7. AI编写80行代码
8. mcp_record_code_lines({ lines: 80, context: "创建ArticleStore" })
9. AI编写220行代码
10. mcp_record_code_lines({ lines: 220, context: "富文本编辑器" })
    → 触发300行门禁 → 通过 → 重置计数器

# 任务3: 评论系统 (150行)
11. AI编写150行代码
12. mcp_record_code_lines({ lines: 150, context: "评论功能" })

# 所有任务完成
13. mcp_git_commit_all({ message: "feat: 完成用户、文章、评论模块" })
```

## 🔧 故障排查

### MCP服务器未启动

**症状**: AI说"找不到MCP工具"

**解决方案**:
1. 检查`.cursor/mcp-settings.json`配置是否正确
2. 完全重启Cursor
3. 检查`tools/ai-guardian/mcp-script-executor.js`是否存在
4. 手动测试MCP服务器:
   ```bash
   node tools/ai-guardian/mcp-script-executor.js
   ```

### AI不使用MCP工具

**症状**: AI写代码但不调用`mcp_record_code_lines`

**解决方案**:
1. 提醒AI: "请使用MCP工具记录代码行数"
2. 让AI重新加载规则:
   ```
   请重新加载执行引擎规则
   ```
3. 检查`.cursorrules`和`00_执行引擎.mdc`是否包含MCP说明

### 280/300行检查未触发

**症状**: 达到280/300行但没有自动检查

**解决方案**:
1. 检查MCP服务器是否运行:
   ```bash
   # 查看MCP进程
   ps aux | grep mcp-script-executor
   ```
2. 查看会话状态:
   ```
   请使用mcp_get_session_state查询状态
   ```
3. 清除会话状态重新开始:
   ```powershell
   Remove-Item .ai-engine/session-state.json -Force
   ```

## 📚 相关文档

- [MCP使用手册](README.md)
- [AI编程执行引擎](../../.cursor/rules/00_执行引擎.mdc)
- [测试脚本](test-full-workflow.js)

## 🎉 完成确认

当您看到以下现象时，说明MCP已成功激活：

1. ✅ AI能列出MCP工具
2. ✅ AI能调用`mcp_record_code_lines`
3. ✅ AI能调用`mcp_get_session_state`
4. ✅ AI编程时自动记录行数
5. ✅ 280/300行自动触发检查

**祝您编程愉快！🚀**

