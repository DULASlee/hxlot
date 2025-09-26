# SmartAbp .cursor/rules 规则文件体系

## 📋 规则文件优先级结构 (整理后)

按优先级从高到低排列：

| 优先级 | 文件名 | 功能描述 | 适用范围 |
|--------|--------|----------|----------|
| 1500 | `core-principles.mdc` | 核心开发原则 - 三大铁律 | 全局 |
| 1400 | `core-functionality-preservation-law.mdc` | 核心功能保护铁律 | 代码文件 |
| 1300 | `expert-mode-unified.mdc` | 专家模式统一规则 | 全局 |
| 1200 | `bug-fixing-iron-law.mdc` | BUG修复铁律 | 代码文件 |
| 1100 | `git-version-control-unified.mdc` | Git版本控制统一铁律 | 全局 |
| 1000 | `development-process.mdc` | 开发流程规范 | 代码文件 |
| 900 | `code-quality.mdc` | 代码质量规则 | 代码文件 |
| 800 | `lowcode-architecture-unified.mdc` | 低代码引擎架构规则 | 低代码相关 |
| 700 | `style-system.mdc` | 样式系统规则 | 样式文件 |
| 600 | `template-usage.mdc` | 模板使用规则 | 全局 |

## 🔄 整理成果

### ✅ 已删除的重复文件 (7个)
- `expert-mode.mdc` → 合并到 `expert-mode-unified.mdc`
- `smart-expert-mode-trigger.mdc` → 合并到 `expert-mode-unified.mdc`
- `expert-mode-execution-validation.mdc` → 合并到 `expert-mode-unified.mdc`
- `git-version-control-law.mdc` → 合并到 `git-version-control-unified.mdc`
- `eleventh-thunderbolt-git-auto-sync.mdc` → 合并到 `git-version-control-unified.mdc`
- `lowcode-architecture.mdc` → 已删除（与unified版本重复）

### 🎯 内容去重效果
- **专家模式机制**: 从4个文件重复 → 统一到1个文件
- **Git同步流程**: 从3个文件重复 → 统一到1个文件
- **架构验证规则**: 避免重复定义，通过引用机制

### 📈 优化效果
- **文件数量**: 14个 → 10个 (减少29%)
- **重复内容**: 大幅减少，避免规则冲突
- **优先级**: 重新分配，解决冲突
- **职责**: 更加清晰的单一职责原则

## 🏗️ 使用指南

### 开发者查阅顺序
1. `core-principles.mdc` - 了解三大基本铁律
2. `development-process.mdc` - 了解开发流程要求
3. 根据具体需求查阅专门规则文件

### AI执行优先级
规则文件按priority值自动加载，高优先级规则优先生效。
