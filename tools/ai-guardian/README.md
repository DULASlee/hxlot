# 🛡️ AI编程铁律执行引擎自动化守护工具

## 📋 功能概述

本工具集提供两个核心自动化机制，确保AI在编程过程中严格遵守质量标准：

### 📊 1. 代码行数追踪器 (CodeLineTracker)
- **100行检查点**：第一次用户干预，审查代码方向
- **200行检查点**：第二次用户干预，深度审查和测试建议
- **280行警告**：接近300行限制，建议尽快执行质量检查
- **300行强制停止**：触发质量门禁，禁止继续编程

### 🛡️ 2. AI自我守护机制 (AIEngineGuardian)
- **启动时自动加载**：加载所有MDC规则文件
- **30分钟自动重载**：防止AI在长会话中"忘记"规则
- **文件变更检测**：每分钟检查规则文件变更，自动重载
- **状态持久化**：记录加载历史，生成报告

---

## 🚀 快速开始

### 安装

```bash
# 工具已集成在项目中，无需额外安装
cd tools/ai-guardian
```

### 基本使用

#### 代码行数追踪器

```bash
# 检查当前会话代码行数（推荐在AI编程后执行）
node CodeLineTracker.js check

# 生成质量监控报告
node CodeLineTracker.js report

# 重置计数器（在执行完质量门禁后）
node CodeLineTracker.js reset

# 查看帮助
node CodeLineTracker.js help
```

#### AI自我守护机制

```bash
# 手动加载所有规则文件（推荐在会话开始时执行）
node AIEngineGuardian.js load

# 启动守护进程（后台运行，30分钟自动重载）
node AIEngineGuardian.js start

# 停止守护进程
node AIEngineGuardian.js stop

# 查看守护状态
node AIEngineGuardian.js status

# 生成守护报告
node AIEngineGuardian.js report

# 查看帮助
node AIEngineGuardian.js help
```

---

## 🔧 集成到开发工作流

### 方案1: Git Pre-commit Hook（推荐）

在 `.git/hooks/pre-commit` 中添加：

```bash
#!/bin/bash

echo "🔍 AI代码行数追踪检查..."
node tools/ai-guardian/CodeLineTracker.js check

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ 代码行数超出300行限制！"
  echo "💡 建议: 执行质量门禁检查后再提交"
  echo ""
  exit 1
fi

echo "✅ 代码行数检查通过"
```

### 方案2: package.json Scripts

在项目根目录的 `package.json` 中添加：

```json
{
  "scripts": {
    "ai:check": "node tools/ai-guardian/CodeLineTracker.js check",
    "ai:guard": "node tools/ai-guardian/AIEngineGuardian.js load",
    "ai:status": "node tools/ai-guardian/AIEngineGuardian.js status"
  }
}
```

### 方案3: CI/CD Pipeline

在 `.github/workflows/ai-quality-check.yml` 中添加：

```yaml
name: AI Quality Check

on: [push, pull_request]

jobs:
  ai-quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check AI code line limit
        run: node tools/ai-guardian/CodeLineTracker.js check
```

---

## 📊 输出示例

### 代码行数追踪器检查

```
🔍 正在分析最近会话的代码行数...

📊 当前会话代码统计:
  • 总代码行数: 2164行
  • 修改文件数: 3个
  • 违规次数: 1次

🚨 错误：超出300行限制！必须立即执行质量门禁检查！
```

### AI自我守护机制加载

```
🔥 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 AI编程铁律执行引擎 v9.0 (Ultimate Edition) 已启动！
🔥 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 正在加载核心规则文件...

✅ [1/9] .cursor/rules/00_编程完整性铁律.mdc
   📄 大小: 15.23 KB
   🕐 修改时间: 2025-10-05 10:30:45

✅ [2/9] .cursor/rules/00_执行引擎.mdc
   📄 大小: 42.56 KB
   🕐 修改时间: 2025-10-05 11:15:30

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 加载摘要
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 成功加载: 9/9个规则文件
🔄 重载次数: 1
🕐 本次重载时间: 2025-10-05 11:20:00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📁 生成的文件

### 持久化数据

- `.ai-engine/code-tracker.json` - 代码行数追踪历史
- `.ai-engine/guardian-status.json` - 守护状态记录
- `.ai-engine/guardian.pid` - 守护进程PID文件

### 报告文件

- `.ai-engine/code-tracker-report.md` - 代码行数监控报告
- `.ai-engine/guardian-report.md` - 规则加载守护报告

---

## 🚨 重要说明

### AI的责任
虽然这些工具提供了自动化检查和守护机制，但**AI本身必须内置遵守这些规则的意识**：

1. **内部追踪**：AI应该在生成代码时，内部维护一个行数计数器
2. **主动停止**：当达到阈值时，AI应该主动停止编程
3. **规则记忆**：AI应该在会话开始时主动请求加载规则

### 用户的责任
用户应该：

1. **定期检查**：在AI完成编程后，运行 `node CodeLineTracker.js check`
2. **会话开始**：在每次会话开始时，运行 `node AIEngineGuardian.js load`
3. **长会话**：考虑启动守护进程 `node AIEngineGuardian.js start`

---

## 🔧 故障排除

### 问题1：无法检测到Git修改文件

**原因**：不在Git仓库中或Git未初始化

**解决**：确保在项目根目录执行，并且已初始化Git仓库

```bash
git init
git add .
```

### 问题2：守护进程无法启动

**原因**：已有守护进程在运行或PID文件存在

**解决**：先停止现有守护进程

```bash
node AIEngineGuardian.js stop
node AIEngineGuardian.js start
```

### 问题3：规则文件缺失

**原因**：规则文件被移动或删除

**解决**：检查 `.cursor/rules/` 目录，确保所有规则文件存在

---

## 📚 配置

### 修改检查阈值

编辑 `CodeLineTracker.js` 中的 `CONFIG` 对象：

```javascript
const CONFIG = {
  thresholds: {
    warning1: 100,    // 第一次警告
    warning2: 200,    // 第二次警告
    warning3: 280,    // 第三次警告
    critical: 300,    // 强制停止
  },
  // ...
};
```

### 修改重载间隔

编辑 `AIEngineGuardian.js` 中的 `CONFIG` 对象：

```javascript
const CONFIG = {
  reloadInterval: 30 * 60 * 1000, // 30分钟（毫秒）
  // ...
};
```

---

## 📄 许可证

MIT License

---

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这些工具！

---

**🔥 让我们一起打造世界级的AI编程质量标准！**
