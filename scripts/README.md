# SmartAbp Scripts 标准化架构文档

## 📁 新版目录结构

SmartAbp项目scripts目录已按功能分类重新组织，提高可维护性和使用效率。

### 🎯 分类架构

```
scripts/
├── git/                    # Git版本管理脚本
│   ├── git-safe-sync.sh    # Linux/Mac Git同步脚本
│   ├── git-safe-sync.ps1   # Windows Git同步脚本
│   ├── git-safe-sync.bat   # Windows批处理同步脚本
│   ├── git-sync-simple.bat # 简化Git同步脚本
│   ├── git-config-check.sh # Git配置检查脚本
│   ├── git-hooks-monitor.sh # Git hooks监控脚本
│   └── ai-git-sync-monitor.js # AI Git同步监控
│
├── dev/                    # 开发环境脚本
│   ├── start-dev.bat       # 开发环境启动脚本
│   ├── start-dev.ps1       # PowerShell开发环境启动
│   ├── start-dev-safe.ps1  # 安全模式开发环境启动
│   ├── fast-dev.bat        # 快速开发环境启动
│   ├── cursor-performance-optimizer.* # Cursor性能优化脚本
│   ├── fix-*.ps1           # 各种修复脚本
│   └── 启动开发环境.bat    # 中文开发环境启动脚本
│
├── quality/                # 代码质量检查脚本
│   ├── ci-quality-check.sh # CI质量检查脚本
│   ├── local-quality-check.sh # 本地质量检查脚本
│   ├── architecture-cleanliness-audit.js # 架构整洁审计
│   ├── code-deduplication-optimizer.js # 代码去重优化器
│   ├── ai-expert-mode-validator.js # AI专家模式验证器
│   ├── emergency-architecture-fix.js # 紧急架构修复
│   └── verify-quality-system.js # 质量系统验证
│
├── testing/                # 测试脚本
│   ├── api-functionality-test.js # API功能测试
│   ├── test-core-functionality.js # 核心功能测试
│   ├── test-validation.js  # 测试验证脚本
│   ├── quick-test.js       # 快速测试脚本
│   ├── run-tests.js        # 测试运行器
│   └── verify-auto-terminal-fix.ps1 # 自动终端修复验证
│
├── performance/            # 性能测试脚本
│   └── performance-testing/ # 完整性能测试套件
│       ├── config/         # 配置文件
│       ├── monitoring/     # 监控配置
│       ├── tests/          # 性能测试用例
│       └── utils/          # 工具函数
│
├── tools/                  # 工具脚本
│   ├── setup-git-config.sh # Git配置设置
│   ├── setup-git-hooks.sh  # Git hooks设置
│   ├── intelligent-merge.sh # 智能合并工具
│   ├── lossless-migration.sh # 无损迁移工具
│   └── update-main-app-references.js # 主应用引用更新
│
├── deployment/             # 部署相关脚本
│   ├── production-optimization.sh # 生产环境优化
│   ├── production-readiness-check.sh # 生产就绪检查
│   └── production-readiness-report.html # 生产就绪报告
│
└── docs/                   # 文档说明
    ├── README.md           # 主要文档
    ├── README-Git-Scripts.md # Git脚本文档
    └── README-git-sync.md  # Git同步文档
```

## 🚀 常用脚本快速引用

### Git版本管理
```bash
# Windows环境
powershell -File scripts/git/git-safe-sync.ps1 -AutoCommit -Verbose

# Linux/Mac环境
bash scripts/git/git-safe-sync.sh --non-interactive --auto-commit
```

### 开发环境启动
```bash
# Windows快速启动
scripts/dev/fast-dev.bat

# PowerShell启动
scripts/dev/start-dev.ps1
```

### 质量检查
```bash
# 本地质量检查
bash scripts/quality/local-quality-check.sh

# CI质量检查
bash scripts/quality/ci-quality-check.sh
```

### 测试执行
```bash
# 快速测试
node scripts/testing/quick-test.js

# 完整测试
node scripts/testing/run-tests.js
```

## 📋 迁移说明

### 路径更新
所有对脚本的引用路径已更新为新的分类结构：

**旧路径** → **新路径**
- `scripts/git-safe-sync.sh` → `scripts/git/git-safe-sync.sh`
- `scripts/start-dev.bat` → `scripts/dev/start-dev.bat`
- `scripts/ci-quality-check.sh` → `scripts/quality/ci-quality-check.sh`

### 兼容性保证
- 所有现有脚本功能保持不变
- 脚本内部逻辑无任何修改
- 仅重新组织了目录结构

## 🛠️ 维护规范

### 新增脚本规范
1. **分类存放**: 根据功能将脚本放入对应分类文件夹
2. **命名规范**: 使用清晰的功能描述性命名
3. **文档更新**: 在对应分类文档中添加说明
4. **路径引用**: 使用完整的分类路径引用脚本

### 禁止事项
- ❌ 不得在scripts根目录直接添加新脚本
- ❌ 不得创建功能重复的脚本
- ❌ 不得绕过分类结构随意存放脚本

### 必须遵循
- ✅ 新脚本必须放入对应功能分类文件夹
- ✅ 更新脚本时同步更新相关文档
- ✅ 保持目录结构的整洁和规范

---
**最后更新**: 2025-09-28
**维护者**: SmartAbp开发团队
**版本**: v2.0 - 分类架构标准化版本
