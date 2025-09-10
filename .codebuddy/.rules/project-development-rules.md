# 🚨 SmartAbp项目开发铁律（强制执行）

## ⚡ 开发铁律四大核心

### 1. 代码编写前的强制准备工作
- 必须阅读项目规则：
  - doc/项目开发铁律.md
  - doc/编码规范.md
  - doc/architecture/ 下架构文档
- 必须使用 Serena 分析现有代码（查找符号/搜索模式/模块概览）
- 严禁编写重复代码（先检索再实现，能复用必复用）

### 2. 工作计划审批制度
- 使用 sequential-thinking 制定详细计划（步骤/检查点/风险）
- 等待用户审批确认后才能开始编码

### 3. 质量保证流程（每次修改后强制执行）
```bash
npm run build
npm run type-check
npm run lint --fix
npm run dev
```
- 错误零容忍：构建/类型/lint/运行时错误必须立即修复

### 4. 沟通增强机制
- 每次交互开始必须调用 interactive-feedback 工具获取确认

## 📁 前端目录结构（强制）
```
src/SmartAbp.Vue/src/
├── views/               # 按模块分组
├── components/          # 按功能分组
├── stores/modules/      # 模块化状态
└── styles/design-system/# 统一设计系统
```

## 🎯 路由规范（强制）
- 扁平化：/User、/Project、/Log、/Admin 采用统一布局 SmartAbpLayout

## 🚫 严禁事项
1. 跳过 Serena 分析
2. 未经审批直接编码
3. 跳过质量检查序列
4. 硬编码样式值（必须用设计系统变量）
5. 创建重复代码

## 🏷️ 命名规范
- Vue组件：PascalCase（UserManagementView.vue）
- TS文件：camelCase（userService.ts）
- CSS类：kebab-case（.user-management）
- 变量：camelCase；常量：UPPER_SNAKE_CASE

## ✅ 检查清单
- 开发前：已交互确认、已读规则、已Serena分析、已计划并批准
- 提交前：build/type-check/lint/dev 通过；无重复代码；样式用设计系统变量

---
这些是铁律，不是建议！