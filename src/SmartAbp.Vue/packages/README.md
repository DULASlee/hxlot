# SmartAbp LowCode Engine - Packages

> 📦 **企业级低代码引擎核心组件库**
> 
> 采用现代化黑盒架构模式，确保模块化、可扩展性和可维护性

## 📚 Packages 总览

SmartAbp低代码引擎由5个核心package组成，采用分层架构设计：

| Package | 层级 | 职责 | 依赖 |
|---------|------|------|------|
| **lowcode-shared** | L0 - 基础层 | 共享工具、类型、组件注册中心 | 零依赖 ✅ |
| **lowcode-core** | L1 - 核心层 | 核心引擎、状态管理、代码生成 | lowcode-shared |
| **lowcode-designer** | L2 - UI层 | 可视化设计器、编辑器UI | lowcode-core, lowcode-shared |
| **lowcode-api** | L2 - API层 | HTTP接口、数据库操作 | lowcode-core, lowcode-shared |
| **lowcode-tools** | L3 - 桥接层 | 主应用工具桥接（唯一@/白名单） | lowcode-shared |

## 🏗️ 架构原则

### 1. **黑盒隔离原则**
- 每个package独立封装，对外提供清晰的API
- 严禁跨层级直接访问内部实现
- 通过`@smartabp/*`别名进行包间通信

### 2. **单向依赖原则**
- 下层不依赖上层（L0 ← L1 ← L2 ← L3）
- 严禁循环依赖
- lowcode-shared保持零依赖

### 3. **相对路径禁止原则**
- 严禁使用`../`相对路径引用
- 必须使用`@smartabp/*`别名
- lowcode-tools是唯一可使用`@/`的桥接层

### 4. **类型安全原则**
- 严禁使用`as any`绕过类型检查
- 严禁使用`@ts-ignore`忽略错误
- 所有API必须有完整TypeScript类型定义

## 📦 Packages 详细说明

### 🌿 lowcode-shared (基础层 - L0)

**包名**: `@smartabp/lowcode-shared`  
**职责**: 提供所有packages共享的基础设施

**核心功能**:
- 🎯 **类型定义**: 组件基础类型、UI类型（MDIWindowConfig、TabConfig）
- 🔧 **工具函数**: 数组、对象、字符串处理工具
- 🏗️ **组件注册中心**: 企业级组件管理系统
- 🛡️ **错误处理**: 全局错误处理器、错误日志集成
- ⚡ **性能监控**: 内存监控、事件监听器安全管理
- ✅ **验证器**: 通用数据验证工具

**使用示例**:
```typescript
import { 
  MDIWindowConfig, 
  TabConfig,
  globalComponentRegistry 
} from '@smartabp/lowcode-shared'
```

**文档**: [lowcode-shared/README.md](./lowcode-shared/README.md)

---

### 🧠 lowcode-core (核心引擎层 - L1)

**包名**: `@smartabp/lowcode-core`  
**职责**: 低代码引擎核心业务逻辑

**核心功能**:
- 🎨 **主题系统**: 增强主题管理、主题快照、动态切换
- 🔄 **状态机**: 增强状态机、工作流管理
- 📦 **代码生成**: 清单写入、代码生成进度管理
- 🗄️ **状态管理**: Pinia stores（codeGeneration, templates, theme等）
- 🎯 **类型导出**: 清单类型、实体设计器类型
- 🔧 **工具函数**: manifestWriter、拖拽组合式函数

**使用示例**:
```typescript
import { 
  useEnhancedThemeStore,
  useCodeGenerationStore,
  useStateMachineStore 
} from '@smartabp/lowcode-core'
```

**文档**: [lowcode-core/README.md](./lowcode-core/README.md)

---

### 🎨 lowcode-designer (设计器UI层 - L2)

**包名**: `@smartabp/lowcode-designer`  
**职责**: 可视化设计器用户界面组件

**核心功能**:
- 📐 **实体设计器**: EntityDesigner组件，可视化实体建模
- 🎨 **主题编辑器**: ThemeEditor组件，实时主题定制
- 📊 **可视化设计视图**: VisualDesignerView，综合设计界面
- 🔧 **设计工具**: 工具栏、属性面板、画布管理

**使用示例**:
```typescript
import { 
  EntityDesigner,
  ThemeEditor,
  VisualDesignerView 
} from '@smartabp/lowcode-designer'
```

**文档**: [lowcode-designer/README.md](./lowcode-designer/README.md)

---

### 🔌 lowcode-api (API接口层 - L2)

**包名**: `@smartabp/lowcode-api`  
**职责**: 后端API接口封装与数据操作

**核心功能**:
- 🗄️ **数据库API**: 数据库操作、模板管理
- 📡 **HTTP请求**: RESTful API封装
- 🔐 **认证集成**: 与主应用认证系统集成

**使用示例**:
```typescript
import { 
  databaseApi,
  templatesApi 
} from '@smartabp/lowcode-api'

const templates = await databaseApi.getTemplates()
```

**文档**: [lowcode-api/README.md](./lowcode-api/README.md)

---

### 🌉 lowcode-tools (桥接工具层 - L3)

**包名**: `@smartabp/lowcode-tools`  
**职责**: **桥接主应用与packages**（唯一`@/`白名单）

**核心功能**:
- 📝 **日志系统**: logger、createComponentLogger
- 📡 **事件总线**: eventBus、LowCodeEvents类型
- ⚡ **性能优化**: 内存优化、虚拟滚动工具
- 🔌 **API服务**: apiService桥接

**特殊架构地位**:
- ✅ **唯一允许**使用`@/`别名的package
- 🌉 作为主应用与其他packages的桥接层
- 🔒 其他packages通过它间接访问主应用工具

**使用示例**:
```typescript
import { 
  logger,
  eventBus,
  apiService 
} from '@smartabp/lowcode-tools'

logger.info('操作成功')
eventBus.emit('template:created', template)
```

**文档**: [lowcode-tools/README.md](./lowcode-tools/README.md)

---

## 🛡️ 架构守卫与质量保障

SmartAbp低代码引擎实施了严格的架构保护机制，防止AI编程破坏工程化成果。

### 🔍 自动化检查

**架构守卫脚本**: `scripts/quality/architecture-guard.sh`

检查项目：
1. **相对路径违规检查** - 零容忍`../`引用
2. **主应用引用违规检查** - 除lowcode-tools外禁止`@/`引用
3. **类型安全绕过检查** - 零容忍`as any`、`@ts-ignore`
4. **重复组件检查** - 防止冗余代码
5. **依赖层级检查** - 确保单向依赖
6. **架构完整性检查** - 验证所有packages存在

### 📊 质量标准

| 检查项 | 标准 | 当前状态 |
|--------|------|----------|
| TypeScript编译 | 0错误 | ✅ 通过 |
| 相对路径违规 | 0个 | 🔄 7个待修复 |
| 主应用引用违规 | 0个（lowcode-tools除外） | ✅ 0个 |
| 类型安全绕过 | 0个 | 🔄 3个待修复 |
| 重复组件 | 0个 | ✅ 0个 |

### 🚨 提交前检查（Git Hooks）

每次`git commit`前自动执行：
- ESLint代码规范检查
- TypeScript类型检查
- 架构完整性检查

## 📈 开发指南

### 安装依赖

```bash
cd src/SmartAbp.Vue
npm install
```

### 构建Packages

```bash
# 构建所有packages
npm run build:packages

# 构建特定package
npm run build:lowcode-core
npm run build:lowcode-designer
```

### 类型检查

```bash
# TypeScript类型检查
npm run type-check

# 项目引用构建（packages TypeScript）
npx tsc --build tsconfig.references.json
```

### 代码规范

```bash
# ESLint检查
npm run lint

# ESLint自动修复
npm run lint -- --fix

# Packages专项检查
npm run lint -- "packages/*/src/**/*.{ts,vue}" --fix
```

### 架构检查

```bash
# 运行架构守卫
bash scripts/quality/architecture-guard.sh

# 完整质量门禁（包含架构检查）
bash scripts/ci-quality-check.sh
```

## 🔗 相关文档

- [Packages依赖关系图](../../docs/架构优化/packages依赖关系图.md) - 可视化架构图
- [AI编程架构保护方案](../../docs/架构优化/AI编程架构保护方案.md) - 架构保护机制
- [前端框架工程化优化方案](../../docs/架构优化/前端框架工程化优化方案-整理版.md) - 优化路线图

## 📝 贡献指南

### 新增Package

1. 在`packages/`目录下创建新包
2. 遵循黑盒架构原则
3. 添加`package.json`和`README.md`
4. 更新本文档的Packages列表
5. 运行架构守卫确保合规

### 修改现有Package

1. 确保不破坏公共API兼容性
2. 更新相关文档和类型定义
3. 运行完整的质量检查
4. 提交前通过Git Hooks检查

## 🎯 未来规划

- [ ] **包版本管理**: 实现独立的包版本控制
- [ ] **独立构建**: 支持packages独立打包发布
- [ ] **性能优化**: 按需加载、Tree Shaking优化
- [ ] **Storybook集成**: 组件可视化文档和测试
- [ ] **单元测试**: 完善packages单元测试覆盖率

---

**🏆 架构质量标准**: 95分企业级标准  
**🛡️ 架构保护机制**: AI编程架构自动识别保护铁律  
**⚡ 性能目标**: 首屏加载 < 3s，组件懒加载  
**📦 包管理**: pnpm workspace + TypeScript Project References
