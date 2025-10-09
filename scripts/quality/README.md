# AI执行引擎 - 自动化脚本说明

## 📋 脚本清单

### 1️⃣ **30分钟自动规则加载提醒器** ✅ 真实可用

**脚本文件**:
- Windows: `scripts/quality/auto-rule-reminder.ps1`
- Linux/Mac: `scripts/quality/auto-rule-reminder.sh`

**功能**: 每30分钟自动提醒AI加载最新规则文件

**使用方式**:
```powershell
# Windows - 启动后台监控（推荐）
pwsh scripts/quality/START_AI_RULE_MONITOR.ps1

# 或者直接调用
pwsh scripts/quality/auto-rule-reminder.ps1 monitor

# 立即显示一次提醒
pwsh scripts/quality/auto-rule-reminder.ps1 now

# 查看状态
pwsh scripts/quality/auto-rule-reminder.ps1 status
```

**工作原理**:
- 定时器：每30分钟自动触发
- 状态管理：记录提醒次数和时间
- 彩色提示：显示需要加载的规则文件列表
- 系统通知：弹出Windows/macOS/Linux通知

---

### 2️⃣ **AI检查点轻量检查脚本** ✅ 真实可用

**脚本文件**: `scripts/quality/ai-checkpoint-check.ps1`

**功能**: AI在280/300行检查点时主动调用此脚本执行轻量检查

**AI调用方式**:
```powershell
# 280行检查点
run_terminal_cmd("pwsh scripts/quality/ai-checkpoint-check.ps1 280 280")

# 300行检查点
run_terminal_cmd("pwsh scripts/quality/ai-checkpoint-check.ps1 300 300")

# 快速检查（不指定检查点）
run_terminal_cmd("pwsh scripts/quality/ai-checkpoint-check.ps1 quick 150")
```

**检查内容**:
1. ✅ TypeScript类型快速扫描（无 as any/@ts-ignore）
2. ✅ 架构三大铁律快速扫描（无相对路径/主应用引用）
3. ✅ 功能完整性快速评估（无空方法/Mock数据/TODO）
4. ✅ 代码质量自评（文件大小/圈复杂度）

**工作原理**:
- 检查git暂存区的文件
- 快速扫描关键问题
- 返回状态码：0=通过，1=有问题
- AI根据结果决定是否继续

---

### 3️⃣ **Git安全同步脚本** ✅ 真实可用

**脚本文件**: `scripts/git/git-safe-sync.ps1`

**功能**: 完整质量门禁检查 + 安全Git同步

**AI调用方式**:
```powershell
run_terminal_cmd("pwsh scripts/git/git-safe-sync.ps1 -AutoCommit")
```

**检查内容**:
1. ✅ TypeScript完整编译检查
2. ✅ ESLint代码规范检查
3. ✅ 架构三大铁律验证
4. ✅ 功能完整性验证
5. ✅ Git安全同步（pull → merge → push）

---

## 🎯 AI执行流程

### **阶段1: 持续编程（0-280行）**
```
AI编写代码... (无检查)
```

### **阶段2: 280行检查点**
```powershell
# AI自动执行
run_terminal_cmd("pwsh scripts/quality/ai-checkpoint-check.ps1 280 280")

# 检查通过 → 继续编程
# 检查失败 → 修复问题 → 继续编程
```

### **阶段3: 持续编程（280-300行）**
```
AI继续编写代码... (无检查)
```

### **阶段4: 300行检查点**
```powershell
# AI自动执行
run_terminal_cmd("pwsh scripts/quality/ai-checkpoint-check.ps1 300 300")

# 检查通过 → 继续编程
# 检查失败 → 修复问题 → 继续编程
```

### **阶段5: 持续编程（300-N行）**
```
AI继续编写代码...
每300行执行一次轻量检查（580/600/880/900...）
```

### **阶段6: 功能完成 - 完整质量门禁**
```powershell
# AI执行完整检查和Git同步
run_terminal_cmd("pwsh scripts/git/git-safe-sync.ps1 -AutoCommit")

# 检查通过 → Git同步 → 生成进度报告 → 提供下一步方案
# 检查失败 → 修复问题 → 重新检查
```

---

## ⚠️ 重要说明

### ✅ **能真正自动执行的**:
1. 30分钟规则重载 - 后台定时器脚本
2. 280/300行轻量检查 - AI主动调用脚本
3. 完整质量门禁 - AI主动调用脚本

### ❌ **AI必须自己做的**:
1. 跟踪代码行数 - AI自己计数（外部无法知道）
2. 判断何时触发检查点 - AI自己判断
3. 决定是否继续编程 - AI自己决策

---

## 🔥 快速启动

### **启动30分钟规则提醒监控**:
```powershell
pwsh scripts/quality/START_AI_RULE_MONITOR.ps1
```

### **AI手动触发检查**:
```powershell
# 轻量检查
pwsh scripts/quality/ai-checkpoint-check.ps1 quick

# 完整质量门禁
pwsh scripts/git/git-safe-sync.ps1 -AutoCommit
```

---

**✅ 所有脚本都是真实可用的，无虚假实现！**
