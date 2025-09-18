# 项目开发现状分析与规则总结

## 项目开发铁律核心要点
1. **强制准备工作**: 代码编写前必须加载项目开发规则、使用Serena分析关联代码、理解现有架构
2. **模板与ADR强制执行**: 必须检查templates/目录，遵循ADR决策，禁止重复实现
3. **工作计划审批制度**: 必须提交详细工作计划并等待用户审批
4. **质量保证流程**: 每次代码修改后必须验证构建、类型检查、代码规范
5. **沟通增强机制**: 使用interactive-feedback工具避免需求理解偏差

## 当前ModuleWizard现状
- 位置: `src/SmartAbp.Vue/packages/lowcode-designer/src/components/ModuleWizard.vue`
- 当前功能: 仅有5步向导框架，Step1只有4个简单输入框
- 缺陷: 缺乏企业级架构决策支持、智能化功能、实时验证
- 现有组件: EntityDesigner(Step2)、其他步骤基本空白

## 现有组件结构
- CodeGenerator/: EntityDesigner.vue, RelationshipDesigner.vue等
- customizer/: ComponentTree.vue, PropertyInspector.vue
- RelationshipDiagram/: 关系图相关组件
- UIGenerator/: SmartUIGenerator.vue
- UIPatterns/: 模式库相关组件

## 类型定义现状
- ModuleMetadata: 基础定义，缺乏企业级扩展(architecture, dependencies等)
- 需要添加: SystemDefinition, ArchitecturePattern, TechStackConfig等企业级接口