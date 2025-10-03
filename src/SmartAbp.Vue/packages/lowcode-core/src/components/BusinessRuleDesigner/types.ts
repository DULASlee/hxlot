import type { Node, Edge } from '@vue-flow/core'

/**
 * 🔥 业务规则设计器类型定义
 * 
 * 基于Vue Flow的可视化规则设计器类型系统
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

/**
 * 规则节点类型
 */
export type RuleNodeType = 'condition' | 'action' | 'decision' | 'start' | 'end'

/**
 * 规则节点数据
 */
export interface RuleNodeData {
  label: string
  type: RuleNodeType
  description?: string
  // 条件节点特有
  expression?: string
  // 动作节点特有
  actionType?: string
  actionParams?: Record<string, any>
  // 决策节点特有
  branches?: Array<{
    condition: string
    label: string
  }>
}

/**
 * 规则节点（扩展Vue Flow Node）
 */
export interface RuleNode extends Node {
  type: RuleNodeType
  data: RuleNodeData
}

/**
 * 规则边（扩展Vue Flow Edge）
 */
export interface RuleEdge extends Edge {
  label?: string
  condition?: string
  animated?: boolean
}

/**
 * 规则设计器状态
 */
export interface RuleDesignerState {
  nodes: RuleNode[]
  edges: RuleEdge[]
  selectedNodeId: string | null
  selectedEdgeId: string | null
  zoom: number
  viewportCenter: { x: number; y: number }
}

/**
 * 工具箱节点模板
 */
export interface NodeTemplate {
  type: RuleNodeType
  label: string
  icon: string
  iconComponent?: any  // Element Plus 图标组件
  description: string
  color?: string
  defaultData: Partial<RuleNodeData>
}

/**
 * 节点属性配置
 */
export interface NodePropertyConfig {
  nodeId: string
  nodeType: RuleNodeType
  properties: Record<string, any>
}

/**
 * 规则验证结果
 */
export interface RuleValidationResult {
  isValid: boolean
  errors: Array<{
    nodeId?: string
    edgeId?: string
    message: string
    type: 'error' | 'warning'
  }>
}
