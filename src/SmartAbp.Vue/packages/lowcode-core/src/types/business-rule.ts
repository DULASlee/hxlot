/**
 * 业务规则设计器类型定义
 *
 * 目的：为 RuleEndNode 和 PropertyPanel 提供强类型
 */

/**
 * 规则节点类型
 */
export type RuleNodeType = 'start' | 'end' | 'condition' | 'action' | 'decision'

/**
 * Element Plus Tag组件类型
 */
export type ElementTagType = 'success' | 'info' | 'warning' | 'danger' | ''

/**
 * 规则节点数据基础接口
 */
export type ActionType = 'SetFieldValue' | 'ShowMessage' | 'CallAPI' | 'ValidateField'

export interface SetFieldValueParams {
  actionType: 'SetFieldValue'
  field: string
  value: unknown
}

export interface ShowMessageParams {
  actionType: 'ShowMessage'
  message: string
  type?: 'success' | 'warning' | 'info' | 'error'
}

export interface CallAPIParams {
  actionType: 'CallAPI'
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
}

export interface ValidateFieldParams {
  actionType: 'ValidateField'
  field: string
  rules?: string[]
}

export type RuleActionParams =
  | SetFieldValueParams
  | ShowMessageParams
  | CallAPIParams
  | ValidateFieldParams

export interface RuleNodeDataBase {
  id: string
  label?: string
  description?: string
  /** 设计器选中态（UI用途） */
  selected?: boolean
  /** 条件节点可选表达式 */
  expression?: string
  /** 动作节点类型（可选） */
  actionType?: ActionType
  /** 动作节点参数（可选） */
  actionParams?: RuleActionParams
}

/**
 * 结束节点数据（带返回值）
 */
export interface RuleEndNodeData extends RuleNodeDataBase {
  /** 返回值 */
  returnValue?: string | number | boolean | object
}

/**
 * 规则节点数据联合类型
 */
export type RuleNodeData = RuleNodeDataBase | RuleEndNodeData

/**
 * 类型守卫：判断是否为结束节点数据
 */
export function isRuleEndNodeData(data: RuleNodeData): data is RuleEndNodeData {
  return 'returnValue' in data
}

