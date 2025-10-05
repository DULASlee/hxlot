# ADR-0027: 第二阶段-架构边界清晰化方案 - 根除耦合，实现真模块化

- **状态**: 已接受
- **日期**: 2025-09-29
- **决策者**: 首席架构师

## 背景

在第一阶段解决了IDE性能问题后，架构的核心顽疾——`packages`间的非法耦合问题暴露无遗：

### 架构问题诊断
1. **非法跨层引用泛滥**
   - `packages`内部存在大量`'../'`和`@/'`的非法跨层引用
   - 破坏了模块化设计的初衷和"黑盒原则"
   - 代码审查发现明确要求扫描这些违规引用，证明问题的严重性

2. **无法独立构建**
   - 由于耦合，各个`package`无法被独立编译、测试和发布
   - 失去了Monorepo架构的核心优势
   - 阻碍了包的版本管理和独立发布

3. **编译效率极低**
   - 每次修改都需要对整个项目进行全量编译
   - 无法利用TypeScript的增量编译能力
   - 编译时间从秒级恶化到分钟级

### 现状分析
通过代码扫描确认的问题规模：
```bash
# 预期扫描结果
grep -r "'../'" src/SmartAbp.Vue/packages/ --include="*.ts" --include="*.vue"  # 预计发现多处违规
grep -r "@/" src/SmartAbp.Vue/packages/ --include="*.ts" --include="*.vue"     # 预计发现多处违规
```

## 决策

实施"架构边界清晰化"方案，核心策略是**解耦**和**规范化**。

### 决策2.1: 实施TypeScript项目引用（Project References）
**内容**: 放弃`tsconfig.json`中的`paths`别名方式来管理内部依赖，全面转向TypeScript官方的`Project References`方案。

**技术实施**:
```json
// src/SmartAbp.Vue/tsconfig.references.json
{
  "files": [],
  "include": [],
  "references": [
    { "path": "packages/lowcode-shared" },
    { "path": "packages/lowcode-core" },
    { "path": "packages/lowcode-designer" },
    { "path": "packages/lowcode-api" },
    { "path": "packages/lowcode-tools" }
  ]
}

// packages/lowcode-designer/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "references": [
    { "path": "../lowcode-shared" },
    { "path": "../lowcode-core" }
  ]
}
```

**构建命令**:
```bash
# 启用增量编译
npx tsc --build tsconfig.references.json

# 验证增量编译效果
# 修改lowcode-shared后，只有该包和依赖它的包被重新编译
```

**理由**: 这是TypeScript官方推荐的、用于管理Monorepo内部依赖的标准方案。它能提供真正的增量编译，并建立清晰的、静态的依赖图，从编译器层面杜绝非法引用。

### 决策2.2: 创建共享基础库`lowcode-shared`
**内容**: 创建一个新的`package`——`lowcode-shared`，专门用于存放所有`packages`共享的代码，建立清晰的单向依赖关系。

**目录结构设计**:
```
packages/lowcode-shared/
├── index.ts                    # 统一导出入口
├── tsconfig.json              # 包配置
└── src/
    ├── types/                 # 全局类型定义
    │   ├── index.ts           # 类型统一导出
    │   ├── component-base.ts  # 组件基础接口
    │   ├── global.ts          # 全局类型声明
    │   └── events.ts          # 事件相关类型
    ├── utils/                 # 通用工具函数
    │   ├── index.ts           # 工具统一导出
    │   ├── validators.ts      # 验证工具
    │   ├── formatters.ts      # 格式化工具
    │   └── performance.ts     # 性能工具
    ├── constants/             # 常量定义
    │   ├── index.ts           # 常量统一导出
    │   ├── design-tokens.ts   # 设计令牌
    │   └── config.ts          # 配置常量
    └── errors/                # 统一错误处理
        ├── index.ts           # 错误统一导出
        ├── BaseError.ts       # 错误基类
        └── ErrorManager.ts    # 错误管理器
```

**依赖关系设计**:
```
lowcode-shared (Layer 0: 基础层)
    ↑
lowcode-core, lowcode-api, lowcode-tools (Layer 1: 功能层)
    ↑
lowcode-designer (Layer 2: 表现层)
    ↑
主应用 (Layer 3: 应用层)
```

**理由**: 建立一个清晰的、单向的依赖底层，从根本上杜绝`'../'`和`@/'`的非法引用需求。这是实现架构整洁的必要前提。

### 决策2.3: 全面修复架构违规引用
**内容**: 系统性地扫描并修复所有非法引用，建立架构合规检查机制。

**扫描和修复流程**:
```bash
# 1. 扫描违规引用
grep -r -E "'\.\./|'@/" src/SmartAbp.Vue/packages/ --include="*.ts" --include="*.vue"

# 2. 分析违规类型
# - '../' 相对路径引用 → 改为从 lowcode-shared 导入
# - '@/' 主应用引用 → 重构为包间通信或移至 shared

# 3. 批量重构
# 将所有共享代码迁移到 lowcode-shared
# 更新所有 import 语句使用正确的包引用
```

**架构合规检查**:
```bash
# 每日自动检查脚本
#!/bin/bash
VIOLATIONS=$(grep -r -E "'\.\./|'@/" src/SmartAbp.Vue/packages/ --include="*.ts" --include="*.vue" | wc -l)
if [ $VIOLATIONS -gt 0 ]; then
  echo "❌ 发现 $VIOLATIONS 处架构违规引用"
  exit 1
else
  echo "✅ 架构合规检查通过"
fi
```

## 后果

### 正面影响
1. **真正的模块化架构**
   - 实现了`packages`的真正解耦
   - 每个包都可以独立构建、测试和版本控制
   - 支持独立发布和版本管理

2. **编译效率革命**
   - 启用增量编译后，二次编译时间预计将从分钟级降低到秒级
   - 只编译实际发生变更的包及其依赖
   - 大幅提升开发效率

3. **架构健康度提升**
   - 建立了清晰的、单向的依赖关系
   - 根除了架构腐化的主要来源
   - 极大提升了项目的长期可维护性

4. **团队协作改善**
   - 清晰的包边界减少了团队间的代码冲突
   - 支持并行开发和独立测试
   - 提高了代码审查的效率

### 负面影响
1. **重构工作量大**
   - 需要全局扫描并修复所有非法引用
   - 预计需要2周的集中开发时间
   - 需要仔细处理依赖关系和接口变更

2. **构建配置复杂化**
   - 需要为每个`package`创建独立的`tsconfig.json`
   - 需要正确配置`references`依赖关系
   - 需要团队学习新的构建流程

3. **学习成本**
   - 团队需要理解TypeScript项目引用概念
   - 需要适应新的包间通信方式
   - 需要遵循新的开发规范

## 验收标准

### 技术验收
1. **架构合规性**
   - [ ] 上述`grep`命令运行结果为空（0个违规引用）
   - [ ] 所有`packages`依然可以独立构建成功
   - [ ] `lowcode-shared`包已建立并包含所有共享代码

2. **增量编译验证**
   - [ ] `npx tsc --build tsconfig.references.json`命令成功执行
   - [ ] 修改底层包后，只有相关包被重新编译
   - [ ] 生成`.tsbuildinfo`文件，验证增量编译工作

3. **依赖关系验证**
   - [ ] 依赖关系图清晰且无循环依赖
   - [ ] 每个包的`references`配置正确
   - [ ] 所有包都能正确导入`lowcode-shared`的内容

### 业务验收
1. **功能完整性**
   - [ ] 所有现有功能正常运行
   - [ ] 低代码引擎功能无回归
   - [ ] 代码生成功能正常工作

2. **开发体验**
   - [ ] 编译时间显著缩短（≥50%）
   - [ ] IDE智能提示正常工作
   - [ ] 热更新功能正常

## 风险缓解

### 分阶段实施
1. **第一阶段**（3天）：创建`lowcode-shared`包和基础配置
2. **第二阶段**（4天）：迁移共享代码和修复引用
3. **第三阶段**（3天）：配置项目引用和验证

### 回滚机制
```bash
# 如需回滚：
# 1. 恢复原有的 tsconfig.json paths 配置
# 2. 删除 lowcode-shared 包
# 3. 恢复原有的相对路径引用
# 4. 移除所有 tsconfig references 配置
```

### 监控机制
1. **每日合规检查**：自动扫描架构违规引用
2. **编译性能监控**：跟踪编译时间变化
3. **功能回归测试**：确保重构不影响功能

## 相关ADR
- ADR-0025: 务实重构总体方案
- ADR-0026: 第一阶段-紧急止血方案
- ADR-0028: 第三阶段-运行时性能革命方案

## 更新记录
- 2025-09-29: 创建第二阶段架构边界清晰化方案ADR，基于终极版开发计划制定
