# 🛡️ AI Guardian插件与守护脚本集成方案

## 📋 需求分析

**用户问题**: 是否需要把增量编程300行脚本和AI规则引擎守护脚本添加到AI Guardian插件中？

---

## 🔍 现状分析

### 1. 现有AI Guardian插件功能（v1.4.0）

```yaml
已实现功能:
  ✅ 断线检测: 90秒无活动自动报警
  ✅ 自动恢复: 智能重试策略（5次重试，交替聊天框）
  ✅ 执行引擎检查: 30分钟定时检查规则加载
  ✅ 状态持久化: 跨IDE重启保持状态
  ✅ 自我诊断: 插件健康检查

部分实现:
  ⚠️ 代码行数追踪: 有接口但未完全集成
  ⚠️ 300行机制: 在codeLineTracker.ts中定义但未激活
```

### 2. 独立守护脚本

```yaml
scripts/quality/auto-execution-guard.sh:
  作用: Git pre-commit钩子守护
  检查项:
    ✅ .cursorules文件完整性
    ✅ 执行引擎文件存在性（627行）
    ✅ 规则文件完整性（6个文件）
    ✅ 代码修改检测

运行时机: Git提交前自动触发
职责: 确保规则文件不被误删或损坏
```

### 3. 功能重叠度分析

| 功能 | AI Guardian插件 | Git守护脚本 | 重叠度 |
|------|----------------|------------|--------|
| 规则文件检查 | ⚠️ 部分支持 | ✅ 完全支持 | 50% |
| 执行引擎加载 | ✅ 30分钟定时 | ✅ 每次提交 | 80% |
| 代码行数追踪 | ⚠️ 接口存在 | ❌ 不支持 | 0% |
| 断线恢复 | ✅ 完全支持 | ❌ 不支持 | 0% |
| Git提交守护 | ❌ 不支持 | ✅ 完全支持 | 0% |

---

## 💡 专业建议

### ✅ 建议1: 增量编程300行机制 - **应该集成到插件**

**理由：**

1. **实时性要求**
   - 300行机制需要实时监控编辑活动
   - Git hook只在提交时触发，太晚
   - IDE插件可以在编辑时实时追踪

2. **用户体验**
   - 100行审查点 → IDE弹窗提醒
   - 200行审查点 → 强制用户确认
   - 300行强制停止 → 触发质量门禁

3. **已有基础**
   - `codeLineTracker.ts`已有完整实现
   - 只需要在`extension.ts`中集成激活

**集成方案：**

```typescript
// 在extension.ts中激活300行机制
import { EnhancedCodeLineTracker } from './codeLineTracker';

export class AIGuardianExtension {
  private codeTracker: EnhancedCodeLineTracker;

  private initialize() {
    // 初始化代码追踪器
    this.codeTracker = new EnhancedCodeLineTracker();
    
    // 监听文档编辑
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.contentChanges.length > 0) {
        const linesAdded = event.contentChanges.reduce((sum, change) => {
          return sum + change.text.split('\n').length - 1;
        }, 0);
        
        // 追踪行数
        this.codeTracker.addCode(
          event.document.fileName,
          event.contentChanges.map(c => c.text).join('\n')
        );
        
        // 检查阈值
        const canContinue = this.codeTracker.checkSmartThresholds();
        if (!canContinue) {
          this.triggerQualityGate();
        }
      }
    });
  }
  
  private async triggerQualityGate() {
    // 显示强制质量门禁对话框
    const action = await vscode.window.showWarningMessage(
      '⚠️ 已达到300行代码限制！\n' +
      '根据AI编程铁律，必须执行质量门禁检查。',
      { modal: true },
      '立即执行质量检查',
      '保存并稍后检查'
    );
    
    if (action === '立即执行质量检查') {
      // 触发质量检查命令
      vscode.commands.executeCommand('workbench.action.tasks.runTask', 'quality-check');
    }
  }
}
```

### ⚠️ 建议2: AI规则引擎守护脚本 - **部分集成，保持独立**

**理由：**

1. **职责分离**
   - Git守护脚本：Git提交时的最后一道防线
   - IDE插件：开发过程中的实时监控
   - 两者互补，不应完全替代

2. **运行环境不同**
   - Git hook：Shell脚本，无需IDE
   - IDE插件：需要IDE运行
   - CI/CD环境可能只有Git hook

3. **检查时机不同**
   - Git hook：提交前强制检查
   - IDE插件：30分钟定时检查
   - 前者更严格，后者更友好

**集成方案：复用逻辑，独立运行**

```typescript
// 在extension.ts中添加规则文件检查
export class AIGuardianExtension {
  private async checkRuleFiles(): Promise<boolean> {
    const requiredRules = [
      '.cursor/rules/00_执行引擎.mdc',
      '.cursor/rules/00_全栈低代码从花瓶到神器.mdc',
      '.cursor/rules/00_核心原则.mdc',
      '.cursor/rules/01_开发指南.mdc',
      '.cursor/rules/02_最佳实践.mdc',
      '.cursor/rules/03_项目架构指南.mdc'
    ];
    
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) return false;
    
    const missingRules: string[] = [];
    
    for (const rule of requiredRules) {
      const rulePath = path.join(workspaceRoot, rule);
      try {
        await vscode.workspace.fs.stat(vscode.Uri.file(rulePath));
      } catch {
        missingRules.push(rule);
      }
    }
    
    if (missingRules.length > 0) {
      this.log(`❌ 缺少规则文件: ${missingRules.join(', ')}`);
      
      vscode.window.showErrorMessage(
        `⚠️ AI编程铁律规则文件缺失！\n缺少: ${missingRules.length}个文件`,
        '查看详情'
      ).then(action => {
        if (action === '查看详情') {
          this.outputChannel.show();
        }
      });
      
      return false;
    }
    
    return true;
  }
  
  private startEngineCheck() {
    const interval = this.config.get('engineCheckInterval', 30) * 60 * 1000;
    
    this.engineCheckTimer = setInterval(async () => {
      this.log('🔍 执行引擎守护检查...');
      
      // 1. 检查规则文件
      const rulesOk = await this.checkRuleFiles();
      
      // 2. 检查执行引擎文件
      const engineOk = await this.checkEngineFile();
      
      // 3. 检查.cursorules
      const cursorrulersOk = await this.checkCursorRules();
      
      if (rulesOk && engineOk && cursorrulersOk) {
        this.log('✅ 规则引擎守护检查通过');
        this.aiState.engineLoaded = true;
      } else {
        this.log('❌ 规则引擎守护检查失败');
        this.aiState.engineLoaded = false;
        
        // 尝试自动修复
        await this.attemptAutoRepair();
      }
      
      this.aiState.lastEngineCheck = Date.now();
      await this.saveState();
    }, interval);
  }
  
  private async attemptAutoRepair() {
    const action = await vscode.window.showWarningMessage(
      '⚠️ 检测到AI规则引擎异常！\n' +
      '可能原因：规则文件被删除或损坏\n\n' +
      '建议：从备份恢复规则文件',
      '查看备份',
      '忽略'
    );
    
    if (action === '查看备份') {
      // 打开备份目录
      const backupPath = path.join(
        vscode.workspace.workspaceFolders![0].uri.fsPath,
        'docs/项目规则备用'
      );
      vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(backupPath));
    }
  }
}
```

---

## 🎯 推荐的集成方案

### 方案概述

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Guardian 插件 v2.0                      │
│                     （IDE内实时监控）                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. 断线检测与自动恢复 ✅ 已有                                 │
│     - 90秒阈值检测                                            │
│     - 5次智能重试                                             │
│                                                               │
│  2. 增量编程300行机制 ⭐ 新增                                 │
│     - 100行审查点 → 弹窗提醒                                  │
│     - 200行审查点 → 强制确认                                  │
│     - 300行强制停止 → 质量门禁                                │
│                                                               │
│  3. AI规则引擎守护 ⭐ 增强                                    │
│     - 30分钟定时检查                                          │
│     - 规则文件完整性验证                                       │
│     - 自动修复建议                                            │
│                                                               │
│  4. 执行引擎加载监控 ✅ 已有                                   │
│     - 关键词验证                                              │
│     - 自动重新加载                                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    协同工作，互补
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Git守护脚本（pre-commit hook）                   │
│              （Git提交时的最后防线）                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ✅ 规则文件完整性检查（P0）                                   │
│  ✅ 执行引擎文件验证（627行）                                  │
│  ✅ .cursorules文件检查                                       │
│  ✅ 代码修改检测                                              │
│                                                               │
│  ❌ 不支持增量编程监控（由插件负责）                           │
│  ❌ 不支持断线恢复（由插件负责）                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 职责划分

| 功能 | AI Guardian插件 | Git守护脚本 | 协同方式 |
|------|----------------|------------|---------|
| **增量编程300行** | ✅ 主要负责 | ❌ 不涉及 | 插件实时监控 |
| **规则文件检查** | ✅ 30分钟检查 | ✅ 提交前检查 | 双重保障 |
| **断线恢复** | ✅ 唯一负责 | ❌ 不涉及 | 插件独有 |
| **Git提交守护** | ❌ 不涉及 | ✅ 唯一负责 | 脚本独有 |
| **执行引擎加载** | ✅ 定时加载 | ✅ 验证存在 | 插件主动，脚本验证 |

---

## 📋 实施计划

### 阶段1: 增量编程300行机制集成（高优先级）

**目标**: 完全激活300行监控机制

**步骤**:

1. ✅ 完善`codeLineTracker.ts`（已有基础）
2. ⭐ 在`extension.ts`中集成
3. ⭐ 添加用户交互（弹窗、状态栏显示）
4. ⭐ 实现质量门禁触发

**预期效果**:
```
编写100行 → IDE弹窗: "⚠️ 已编写100行，建议审查"
编写200行 → IDE强制确认: "⚠️ 已编写200行，必须确认继续"
编写300行 → IDE阻止: "🛑 已达300行限制，必须执行质量检查"
```

### 阶段2: AI规则引擎守护增强（中优先级）

**目标**: 增强规则文件检查和自动修复

**步骤**:

1. ✅ 添加规则文件完整性检查
2. ⭐ 实现自动修复建议
3. ⭐ 与Git守护脚本逻辑对齐
4. ⭐ 添加详细日志和诊断

**预期效果**:
```
30分钟检查 → 发现规则文件缺失 → 弹窗提示并建议恢复
启动时检查 → 验证规则完整性 → 显示守护状态
```

### 阶段3: Git守护脚本优化（低优先级）

**目标**: 保持独立，与插件协同

**步骤**:

1. ✅ 保持现有Git hook
2. ⚠️ 添加与插件状态的协同机制（可选）
3. ⚠️ 日志格式统一

**预期效果**:
```
Git提交 → 守护脚本检查 → 通过/失败
失败时 → 建议检查插件状态
```

---

## 🔧 技术实现细节

### 1. 300行机制完整实现

```typescript
// extension.ts
export class AIGuardianExtension {
  private codeTracker: EnhancedCodeLineTracker;
  private currentSessionLines: number = 0;
  
  private initialize() {
    // 初始化代码追踪器
    this.codeTracker = new EnhancedCodeLineTracker();
    
    // 监听所有文档编辑
    this.context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        this.onDocumentChange(event);
      })
    );
    
    // 状态栏显示当前行数
    this.updateLineCountStatusBar();
  }
  
  private onDocumentChange(event: vscode.TextDocumentChangeEvent) {
    // 只追踪代码文件
    if (!this.isCodeFile(event.document)) return;
    
    // 计算新增行数
    const linesAdded = event.contentChanges.reduce((sum, change) => {
      const newLines = change.text.split('\n').length;
      const oldLines = change.rangeLength > 0 ? 
        event.document.getText(change.range).split('\n').length : 1;
      return sum + (newLines - oldLines);
    }, 0);
    
    if (linesAdded > 0) {
      // 更新追踪器
      this.codeTracker.addCode(
        event.document.fileName,
        event.contentChanges.map(c => c.text).join('\n')
      );
      
      // 更新会话行数
      this.currentSessionLines += linesAdded;
      
      // 检查阈值
      this.checkLineThresholds();
      
      // 更新状态栏
      this.updateLineCountStatusBar();
    }
  }
  
  private async checkLineThresholds() {
    const lines = this.currentSessionLines;
    
    // 100行审查点
    if (lines >= 100 && lines < 120 && !this.hasReviewed100) {
      this.hasReviewed100 = true;
      this.show100LinesNotification();
    }
    
    // 200行审查点
    if (lines >= 200 && lines < 220 && !this.hasReviewed200) {
      this.hasReviewed200 = true;
      await this.show200LinesConfirmation();
    }
    
    // 280行警告
    if (lines >= 280 && lines < 300 && !this.hasWarned280) {
      this.hasWarned280 = true;
      this.show280LinesWarning();
    }
    
    // 300行强制停止
    if (lines >= 300) {
      await this.enforce300LinesLimit();
    }
  }
  
  private show100LinesNotification() {
    vscode.window.showInformationMessage(
      '📊 已编写100行代码\n' +
      '建议：进行代码审查，确保质量。',
      '继续编写',
      '暂停审查'
    ).then(action => {
      if (action === '暂停审查') {
        this.createCheckpoint('100lines');
      }
    });
  }
  
  private async show200LinesConfirmation() {
    const action = await vscode.window.showWarningMessage(
      '⚠️ 已编写200行代码！\n' +
      '根据AI编程铁律，建议执行阶段性检查。',
      { modal: true },
      '继续（确认质量无问题）',
      '暂停并检查'
    );
    
    if (action === '暂停并检查') {
      this.createCheckpoint('200lines');
      // 触发质量检查
      this.runQualityCheck();
    }
  }
  
  private show280LinesWarning() {
    vscode.window.showWarningMessage(
      '🚨 警告：已编写280行，接近300行限制！\n' +
      '请准备执行质量门禁检查。'
    );
  }
  
  private async enforce300LinesLimit() {
    // 强制停止，显示模态对话框
    const action = await vscode.window.showErrorMessage(
      '🛑 已达到300行代码限制！\n\n' +
      '根据AI编程铁律v10.0第五关质量门禁：\n' +
      '必须立即执行以下检查才能继续：\n\n' +
      '1. TypeScript编译检查\n' +
      '2. ESLint代码规范\n' +
      '3. 架构合规检查\n' +
      '4. 功能验证\n\n' +
      '点击"执行质量检查"开始验证。',
      { modal: true },
      '执行质量检查',
      '查看详情'
    );
    
    if (action === '执行质量检查') {
      await this.runFullQualityGate();
    } else if (action === '查看详情') {
      // 打开执行引擎规则文档
      this.openRuleDocument('00_执行引擎.mdc');
    }
  }
  
  private async runFullQualityGate() {
    this.log('🚀 开始执行质量门禁检查...');
    
    // 显示进度
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "AI编程铁律质量门禁",
      cancellable: false
    }, async (progress) => {
      // 1. TypeScript检查
      progress.report({ message: "检查TypeScript编译...", increment: 20 });
      const tsOk = await this.runTypeScriptCheck();
      
      // 2. ESLint检查
      progress.report({ message: "检查ESLint规范...", increment: 20 });
      const lintOk = await this.runESLintCheck();
      
      // 3. 架构合规检查
      progress.report({ message: "检查架构合规...", increment: 20 });
      const archOk = await this.runArchitectureCheck();
      
      // 4. 生成报告
      progress.report({ message: "生成质量报告...", increment: 20 });
      
      const allPassed = tsOk && lintOk && archOk;
      
      if (allPassed) {
        vscode.window.showInformationMessage(
          '✅ 质量门禁检查全部通过！\n可以继续编写代码。'
        );
        
        // 重置计数器
        this.currentSessionLines = 0;
        this.hasReviewed100 = false;
        this.hasReviewed200 = false;
        this.hasWarned280 = false;
      } else {
        vscode.window.showErrorMessage(
          '❌ 质量门禁检查未通过！\n请修复问题后再继续。'
        );
      }
      
      progress.report({ message: "完成", increment: 20 });
    });
  }
  
  private async runTypeScriptCheck(): Promise<boolean> {
    try {
      const workspaceRoot = vscode.workspace.workspaceFolders![0].uri.fsPath;
      const { stdout, stderr } = await execAsync(
        'cd src/SmartAbp.Vue && npm run type-check',
        { cwd: workspaceRoot }
      );
      
      this.log('✅ TypeScript检查通过');
      return true;
    } catch (error: any) {
      this.log(`❌ TypeScript检查失败: ${error.message}`);
      return false;
    }
  }
  
  private async runESLintCheck(): Promise<boolean> {
    try {
      const workspaceRoot = vscode.workspace.workspaceFolders![0].uri.fsPath;
      const { stdout, stderr } = await execAsync(
        'cd src/SmartAbp.Vue && npm run lint',
        { cwd: workspaceRoot }
      );
      
      this.log('✅ ESLint检查通过');
      return true;
    } catch (error: any) {
      this.log(`❌ ESLint检查失败: ${error.message}`);
      return false;
    }
  }
  
  private async runArchitectureCheck(): Promise<boolean> {
    try {
      const workspaceRoot = vscode.workspace.workspaceFolders![0].uri.fsPath;
      
      // 检查相对路径违规
      const { stdout: relativePathCheck } = await execAsync(
        'grep -r "\'\\.\\./\'" src/SmartAbp.Vue/packages/ | wc -l',
        { cwd: workspaceRoot }
      );
      
      // 检查主应用引用违规
      const { stdout: mainAppCheck } = await execAsync(
        'grep -r "@/" src/SmartAbp.Vue/packages/ | grep -v node_modules | wc -l',
        { cwd: workspaceRoot }
      );
      
      const violations = parseInt(relativePathCheck.trim()) + parseInt(mainAppCheck.trim());
      
      if (violations === 0) {
        this.log('✅ 架构合规检查通过');
        return true;
      } else {
        this.log(`❌ 架构合规检查失败: 发现${violations}个违规`);
        return false;
      }
    } catch (error: any) {
      this.log(`❌ 架构合规检查失败: ${error.message}`);
      return false;
    }
  }
  
  private updateLineCountStatusBar() {
    const lines = this.currentSessionLines;
    let icon = '$(edit)';
    let color = undefined;
    
    if (lines >= 280) {
      icon = '$(alert)';
      color = 'yellow';
    } else if (lines >= 200) {
      icon = '$(warning)';
      color = 'orange';
    } else if (lines >= 100) {
      icon = '$(info)';
    }
    
    this.statusBarItem.text = `${icon} 代码: ${lines}行`;
    this.statusBarItem.tooltip = 
      `本次会话已编写 ${lines} 行代码\n` +
      `下一个检查点: ${this.getNextCheckpoint(lines)}行`;
    
    if (color) {
      this.statusBarItem.backgroundColor = new vscode.ThemeColor(`statusBarItem.${color}Background`);
    }
  }
  
  private getNextCheckpoint(currentLines: number): number {
    if (currentLines < 100) return 100;
    if (currentLines < 200) return 200;
    if (currentLines < 300) return 300;
    return 300;
  }
}
```

### 2. 规则引擎守护增强

```typescript
// 完整的规则文件检查
private async performFullRuleCheck(): Promise<{
  passed: boolean;
  missingFiles: string[];
  corruptedFiles: string[];
  details: string;
}> {
  const workspaceRoot = vscode.workspace.workspaceFolders![0].uri.fsPath;
  
  const requiredRules = [
    { path: '.cursor/rules/00_执行引擎.mdc', minLines: 500 },
    { path: '.cursor/rules/00_全栈低代码从花瓶到神器.mdc', minLines: 100 },
    { path: '.cursor/rules/00_核心原则.mdc', minLines: 300 },
    { path: '.cursor/rules/01_开发指南.mdc', minLines: 400 },
    { path: '.cursor/rules/02_最佳实践.mdc', minLines: 500 },
    { path: '.cursor/rules/03_项目架构指南.mdc', minLines: 700 }
  ];
  
  const missingFiles: string[] = [];
  const corruptedFiles: string[] = [];
  
  for (const rule of requiredRules) {
    const filePath = path.join(workspaceRoot, rule.path);
    
    try {
      const stat = await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
      
      // 检查文件大小（粗略检查）
      if (stat.size < rule.minLines * 50) {
        corruptedFiles.push(rule.path);
      }
    } catch {
      missingFiles.push(rule.path);
    }
  }
  
  const passed = missingFiles.length === 0 && corruptedFiles.length === 0;
  
  const details = 
    `规则文件检查结果:\n` +
    `✅ 完整文件: ${requiredRules.length - missingFiles.length - corruptedFiles.length}\n` +
    (missingFiles.length > 0 ? `❌ 缺失文件: ${missingFiles.length}\n` : '') +
    (corruptedFiles.length > 0 ? `⚠️ 可能损坏: ${corruptedFiles.length}\n` : '');
  
  return { passed, missingFiles, corruptedFiles, details };
}
```

---

## 📊 预期效果对比

### 集成前

```
现状:
  ✅ 断线检测和恢复工作良好
  ⚠️ 300行机制存在但未激活
  ⚠️ 规则检查依赖Git hook
  ❌ 缺少实时行数显示
  ❌ 质量门禁需手动触发
```

### 集成后

```
效果:
  ✅ 断线检测和恢复（已有）
  ✅ 300行机制完全激活并实时监控
  ✅ 规则检查：插件30分钟 + Git hook提交前
  ✅ 状态栏实时显示代码行数
  ✅ 质量门禁自动触发
  ✅ 用户体验大幅提升
```

---

## ✅ 最终建议

### 1. **增量编程300行机制** - 强烈建议集成

**优先级**: ⭐⭐⭐⭐⭐ （最高）

**原因**:
- ✅ 这是AI编程铁律的核心机制
- ✅ 需要实时监控，插件是最佳载体
- ✅ 已有基础代码，集成成本低
- ✅ 用户体验提升明显

**工作量**: 中等（2-3天）

### 2. **AI规则引擎守护脚本** - 建议部分集成

**优先级**: ⭐⭐⭐⭐ （高）

**原因**:
- ✅ 增强插件的守护能力
- ✅ 与Git hook形成双重保障
- ⚠️ 但保持Git hook独立运行
- ✅ 提供自动修复建议

**工作量**: 小（1-2天）

### 3. **协同机制优化** - 建议保持独立

**优先级**: ⭐⭐⭐ （中）

**原因**:
- ✅ Git hook和插件职责明确
- ✅ 互补而不重复
- ⚠️ 过度集成反而降低可靠性
- ✅ CI/CD环境仍需Git hook

---

## 🚀 实施时间表

```
Week 1: 增量编程300行机制集成
  ✅ Day 1-2: 完善codeLineTracker.ts
  ✅ Day 3-4: 集成到extension.ts
  ✅ Day 5: 用户交互和状态栏
  ✅ Day 6-7: 测试和优化

Week 2: AI规则引擎守护增强
  ✅ Day 8-9: 规则文件检查功能
  ✅ Day 10: 自动修复建议
  ✅ Day 11-12: 与Git hook逻辑对齐
  ✅ Day 13-14: 测试和文档

Week 3: 整体测试和优化
  ✅ Day 15-16: 集成测试
  ✅ Day 17-18: 性能优化
  ✅ Day 19-20: 用户文档
  ✅ Day 21: 发布v2.0
```

---

## 📝 总结

**核心建议**:

1. **✅ 必须集成**: 增量编程300行机制
   - 这是AI编程铁律的核心
   - 插件是最佳实现方式
   - 用户体验提升显著

2. **✅ 应该增强**: AI规则引擎守护
   - 提供实时监控
   - 与Git hook互补
   - 增加自动修复能力

3. **✅ 保持独立**: Git守护脚本
   - 提交前最后防线
   - CI/CD环境需要
   - 职责清晰不重复

**预期效果**:

集成后的AI Guardian插件将成为：
- 🛡️ **完整的AI编程助手**
- 📊 **实时的代码质量监控**
- 🔄 **智能的断线恢复系统**
- ✅ **全面的规则引擎守护**

---

**版本**: v1.0  
**日期**: 2025-10-08  
**作者**: AI Assistant  
**状态**: 待实施

