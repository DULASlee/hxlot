/**
 * 业务规则设计器类型定义
 * 
 * 用于消除RuleEndNode和PropertyPanel中的as any使用
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
export interface RuleNodeDataBase {
  /** 节点标签 */
  label?: string
  /** 节点描述 */
  description?: string
  /** 其他属性 */
  [key: string]: unknown
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

