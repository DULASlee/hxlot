// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 业务规则节点组件库（企业级架构设计）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Vue组件通过ComponentRegistry统一管理（遵循架构铁律二）
// - 组件注册：见 register.ts
// - 组件加载：使用 loadComponent() 或全局注册
// - 运行时处理：由 Vite 在开发/构建时处理 .vue 文件
// - TypeScript编译：tsc --build 只处理 .ts/.tsx 文件
//
// 注意：.vue 文件的导入已注释，因为 tsc 无法处理它们
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// import type { Component } from 'vue'
// import ActionNode from './ActionNode.vue'
// import ConditionNode from './ConditionNode.vue'
// import DecisionNode from './DecisionNode.vue'
// import RuleEndNode from './RuleEndNode.vue'
// import RuleStartNode from './RuleStartNode.vue'

/**
 * 节点类型映射
 */
export const NODE_TYPES = {
  start: 'RuleStartNode',
  end: 'RuleEndNode',
  condition: 'ConditionNode',
  action: 'ActionNode',
  decision: 'DecisionNode'
} as const

/**
 * 节点组件注册配置
 * 注意：组件实例在运行时通过ComponentRegistry获取
 */
// export const nodeComponents: Record<'start' | 'end' | 'condition' | 'action' | 'decision', Component> = {
//   start: RuleStartNode,
//   end: RuleEndNode,
//   condition: ConditionNode,
//   action: ActionNode,
//   decision: DecisionNode
// }

// 导出各个节点组件（运行时由Vite处理）
// export { ActionNode, ConditionNode, DecisionNode, RuleEndNode, RuleStartNode }

