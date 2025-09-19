# SmartAbp 低代码引擎当前真实架构状态 (2025-09-18)

## ⚠️ 关键发现：架构状态不一致

### 🔍 当前真实状态
**实际存在的低代码相关文件极少：**
- `src/SmartAbp.Vue/src/views/codegen/designer/schema/exporter.ts` - 仅3个基础函数
- `src/SmartAbp.Vue/src/views/lowcode/QuickStart.vue` - 基础快速开始页面
- `src/SmartAbp.Vue/src/views/CodeGenerator/Dashboard.vue` - 代码生成器控制台

### 🚨 发现的问题
1. **路由配置中的幽灵引用**：
   - 大量`@smartabp/lowcode-*`包引用，但这些包实际不存在
   - 如: `@smartabp/lowcode-designer/views/VisualDesignerView.vue`
   - 如: `@smartabp/lowcode-api`、`@smartabp/lowcode-codegen`等

2. **目录结构混乱**：
   - 配置指向不存在的组件文件
   - 实际功能与配置严重不符

### 🏗️ 真实架构模式：源码集成模式
根据项目规则修订，当前应为**源码集成模式**：
- 取消Monorepo packages打包方式
- 低代码功能直接在`src/SmartAbp.Vue/src`中开发
- 保持目录结构清晰：
  - `views/codegen/` - 代码生成相关视图
  - `views/lowcode/` - 低代码引擎视图
  - `views/CodeGenerator/` - 代码生成器控制台

### 📋 V4.2开发计划执行基础
**必须清理的技术债务：**
1. 移除所有`@smartabp/lowcode-*`的幽灵引用
2. 重新组织低代码功能到正确的目录结构
3. 建立清晰的源码集成架构

**正确的开发方向：**
- 在`src/SmartAbp.Vue/src/views/codegen/`下开发模块向导
- 在`src/SmartAbp.Vue/src/views/lowcode/`下开发低代码功能
- 使用相对路径`@/views/`而非不存在的包别名

### 🎯 立即行动计划
1. 清理路由配置中的错误引用
2. 在正确目录结构下开始V4.2开发
3. 更新相关配置文件以反映真实架构

这是V4.2增量开发的真实起点。