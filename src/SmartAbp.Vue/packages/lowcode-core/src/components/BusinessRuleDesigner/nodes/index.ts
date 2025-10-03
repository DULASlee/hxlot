/**
 * 业务规则节点组件库
 * 
 * @description 提供可视化规则设计器的自定义节点组件
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

export { default as StartNode } from './StartNode.vue'
export { default as EndNode } from './EndNode.vue'
export { default as ConditionNode } from './ConditionNode.vue'
export { default as ActionNode } from './ActionNode.vue'
export { default as DecisionNode } from './DecisionNode.vue'

/**
 * 节点类型映射
 */
export const NODE_TYPES = {
  start: 'StartNode',
  end: 'EndNode',
  condition: 'ConditionNode',
  action: 'ActionNode',
  decision: 'DecisionNode'
} as const

/**
 * 节点组件注册配置
 */
import StartNode from './StartNode.vue'
import EndNode from './EndNode.vue'
import ConditionNode from './ConditionNode.vue'
import ActionNode from './ActionNode.vue'
import DecisionNode from './DecisionNode.vue'

export const nodeComponents = {
  start: StartNode,
  end: EndNode,
  condition: ConditionNode,
  action: ActionNode,
  decision: DecisionNode
}
