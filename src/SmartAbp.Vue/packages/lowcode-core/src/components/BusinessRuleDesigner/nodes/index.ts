/**
 * 业务规则节点组件库
 * 
 * @description 提供可视化规则设计器的自定义节点组件
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import ActionNode from './ActionNode.vue'
import ConditionNode from './ConditionNode.vue'
import DecisionNode from './DecisionNode.vue'
import EndNode from './EndNode.vue'
import StartNode from './StartNode.vue'

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
export const nodeComponents = {
  start: StartNode,
  end: EndNode,
  condition: ConditionNode,
  action: ActionNode,
  decision: DecisionNode
}

/**
 * 导出各个节点组件
 */
export { ActionNode, ConditionNode, DecisionNode, EndNode, StartNode }

