# SmartAbp 专家模式九重爆雷自动执行引擎

## 📋 功能说明

统一的自动化脚本，执行专家模式的完整九重爆雷检查流程，确保代码质量达到95分企业级标准。

## 🎯 九重爆雷流程

### 第一重：项目开发规范强制加载
- 加载五维同心圆规则体系 (L0-L4)
- 验证所有规则文件完整性

### 第二重：项目智能分析强制执行
- 扫描packages目录结构
- 识别ADR架构决策文档
- 统计代码模板库

### 第三重：增量开发代码去重检查
- 检测重复Vue组件
- 检测重复函数和类
- 强制DRY原则执行

### 第四重：架构整洁强制执行
- packages相对路径违规检查
- packages主应用引用违规检查
- 类型安全绕过检查

### 第五重：BUG修复最佳实践验证
- 企业级修复标准验证
- 类型安全保护验证
- 核心功能保护验证

### 第六重：五重质量门禁检查
1. 架构完整性检查 (0违规)
2. 代码重复度检查 (0重复)
3. 编译与静态检查 (0错误)
4. 低代码生成器专项检查 (100%质量)
5. 技术债务监控检查 (≥85分)

### 第七重：低代码生成器代码质量强制执行
- packages架构完整性
- packages层级关系正确性
- packages独立性保证

### 第八重：Git质量门禁永久保护
- Git hooks配置检查
- 质量检查脚本验证

### 第九重：AI编程架构自动识别保护
- JavaScript污染检测
- packages结构识别
- 架构自动保护

### Git版本管理（可选）
- 调用独立的Git安全同步脚本
- 执行六步铁律：备份 → 拉取 → 合并 → 推送
- 只在检测到代码变更时执行

## 🚀 使用方法

### Windows PowerShell

```powershell
# 完整执行（包含Git同步）
pwsh -File scripts/quality/expert-mode-nine-layers.ps1

# 跳过Git同步
pwsh -File scripts/quality/expert-mode-nine-layers.ps1 -SkipGitSync

# 预演模式（不执行实际操作）
pwsh -File scripts/quality/expert-mode-nine-layers.ps1 -DryRun

# 详细输出
pwsh -File scripts/quality/expert-mode-nine-layers.ps1 -Verbose
```

### Linux/Mac Bash

```bash
# 完整执行（包含Git同步）
bash scripts/quality/expert-mode-nine-layers.sh

# 跳过Git同步
bash scripts/quality/expert-mode-nine-layers.sh --skip-git-sync

# 预演模式（不执行实际操作）
bash scripts/quality/expert-mode-nine-layers.sh --dry-run

# 详细输出
bash scripts/quality/expert-mode-nine-layers.sh --verbose

# 显示帮助
bash scripts/quality/expert-mode-nine-layers.sh --help
```

## 📊 输出示例

```
========================================
  SmartAbp 专家模式九重爆雷执行引擎
========================================

🔥 九重爆雷连环启动！
执行时间: 2025-10-04 00:45:38
执行模式: 执行模式

[1/9] 项目开发规范强制加载...
[SUCCESS] ✓ 加载规则: docs/项目开发规范总览.md
[SUCCESS] ✓ 加载规则: .cursor/rules/00_执行引擎.mdc
...

[2/9] 项目智能分析强制执行...
[SUCCESS] ✓ 识别到 7 个packages模块
...

[3/9] 增量开发代码去重检查...
[SUCCESS] ✓ 无重复Vue组件
...

[4/9] 架构整洁强制执行...
[SUCCESS] ✓ 相对路径检查: 0违规
[SUCCESS] ✓ 主应用引用检查: 0违规
...

[5/9] BUG修复最佳实践验证...
[SUCCESS] ✓ 企业级修复标准: 符合
...

[6/9] 五重质量门禁检查...
🏗️ 第一关：架构完整性检查
  ✓ 相对路径违规: 0个
⚡ 第三关：编译与静态检查
  ✓ TypeScript类型检查: 0错误
🚀 第五关：技术债务监控
  • 质量评分: 92/100
  ✓ 第五关通过 (评分≥85)
...

========================================
          🎉 九重爆雷执行完成！
========================================

📊 执行统计:
   ⏱️  执行时长: 15.32 秒
   ⚠️  警告数量: 2
   ❌ 错误数量: 0
   🏗️ 架构违规: 0
   📊 质量评分: 92/100

🥇 质量评级: 优秀+ (Excellent) ⭐⭐⭐⭐

✅ 专家模式九重爆雷执行引擎完成！
```

## 🔧 参数说明

### PowerShell版本

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-SkipGitSync` | 跳过Git版本管理 | false |
| `-DryRun` | 预演模式（不执行实际操作） | false |
| `-Verbose` | 详细输出 | false |

### Bash版本

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--skip-git-sync` | 跳过Git版本管理 | false |
| `--dry-run` | 预演模式（不执行实际操作） | false |
| `--verbose` | 详细输出 | false |
| `-h, --help` | 显示帮助信息 | - |

## 📈 质量评级标准

| 评分 | 评级 | 显示 |
|------|------|------|
| 95-100分 | 卓越 (Excellence) | ⭐⭐⭐⭐⭐ |
| 90-94分 | 优秀+ (Excellent) | ⭐⭐⭐⭐ |
| 85-89分 | 优秀 (Very Good) | ⭐⭐⭐⭐ |
| <85分 | 需要改进 (Needs Improvement) | ⚠️ |

## 🎯 质量评分计算方法

```
质量评分 = 代码复杂度(25%) + TODO标记(20%) + 代码重复度(25%) + 类型安全(30%)

其中：
- 代码复杂度 = 100 - (大文件数量 × 2)
- TODO标记 = 100 - (TODO数量 ÷ 4)
- 代码重复度 = 100 - (重复组件数 × 10)
- 类型安全 = 100 - (类型绕过数 × 2)
```

## ✅ 退出码

- `0`: 成功（无错误）
- `1`: 失败（有错误）

## 🔗 与Git脚本的关系

九重爆雷脚本会在最后阶段**调用**Git安全同步脚本，而不是重复实现Git同步逻辑：

```powershell
# Windows
& pwsh -File "scripts/git/git-safe-sync.ps1" -NonInteractive -AutoCommit
```

```bash
# Linux/Mac
bash scripts/git/git-safe-sync.sh --non-interactive --auto-commit
```

这样保持了Git脚本的独立性，同时实现了统一调用。

## 📝 使用场景

### 1. 开发前检查
```bash
bash scripts/quality/expert-mode-nine-layers.sh --dry-run
```

### 2. 提交前完整检查
```bash
bash scripts/quality/expert-mode-nine-layers.sh
```

### 3. CI/CD集成
```bash
bash scripts/quality/expert-mode-nine-layers.sh --skip-git-sync
```

### 4. 本地开发调试
```bash
bash scripts/quality/expert-mode-nine-layers.sh --skip-git-sync --verbose
```

## 🚨 注意事项

1. **必须在项目根目录执行**：脚本会自动切换到正确的目录
2. **TypeScript编译需要时间**：完整执行可能需要15-30秒
3. **Git同步需要网络**：如果网络不稳定，使用 `--skip-git-sync`
4. **预演模式仅输出**：不会执行实际的编译和Git操作

## 📚 相关文档

- [项目开发规范总览](../../docs/项目开发规范总览.md)
- [执行引擎规则](.cursor/rules/00_执行引擎.mdc)
- [Git安全同步脚本](../git/git-safe-sync.sh)

## 🔄 版本历史

- **v1.0** (2025-10-04): 初始版本，实现完整的九重爆雷检查流程

---

**🔥 专家模式承诺**: 95分质量标准 | 零容忍违规 | 自动化执行 | 独立决策
