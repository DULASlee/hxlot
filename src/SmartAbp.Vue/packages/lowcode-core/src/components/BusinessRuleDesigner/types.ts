import type { Edge, Node } from '@vue-flow/core'

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
 * 动作类型
 */
export type ActionType = 'SetFieldValue' | 'ShowMessage' | 'CallAPI' | 'ValidateField'

/**
 * 动作参数基类型
 */
export interface BaseActionParams {
  actionType: ActionType
}

/**
 * 设置字段值参数
 */
export interface SetFieldValueParams extends BaseActionParams {
  actionType: 'SetFieldValue'
  field: string
  value: any
}

/**
 * 显示消息参数
 */
export interface ShowMessageParams extends BaseActionParams {
  actionType: 'ShowMessage'
  message: string
  type?: 'success' | 'warning' | 'info' | 'error'
}

/**
 * 调用API参数
 */
export interface CallAPIParams extends BaseActionParams {
  actionType: 'CallAPI'
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, any>
  headers?: Record<string, string>
}

/**
 * 验证字段参数
 */
export interface ValidateFieldParams extends BaseActionParams {
  actionType: 'ValidateField'
  field: string
  rules?: string[]
}

/**
 * 所有动作参数的联合类型
 */
export type ActionParams = SetFieldValueParams | ShowMessageParams | CallAPIParams | ValidateFieldParams

/**
 * 规则节点数据
 */
export interface RuleNodeData {
  label: string
  type: RuleNodeType
  description?: string
  selected?: boolean
  // 条件节点特有
  expression?: string
  // 动作节点特有
  actionType?: ActionType
  actionParams?: ActionParams
  // 决策节点特有
  branches?: Array<{
    condition: string
    label: string
  }>
  // 结束节点特有
  returnValue?: string
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
export interface RuleEdge extends Omit<Edge, never> {
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
