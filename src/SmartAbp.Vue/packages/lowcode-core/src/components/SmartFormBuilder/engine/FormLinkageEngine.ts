/**
 * 表单联动引擎
 * 负责处理表单字段之间的联动关系
 * 
 * @author SmartAbp Team
 * @since 2025-01-07
 * @version 2.0
 */

import type { Ref } from 'vue'
import type { Api } from '@form-create/element-ui'

/**
 * 联动条件类型
 */
export type LinkageConditionType =
  | 'equals'        // 等于
  | 'notEquals'     // 不等于
  | 'contains'      // 包含
  | 'notContains'   // 不包含
  | 'greaterThan'   // 大于
  | 'lessThan'      // 小于
  | 'between'       // 介于之间
  | 'isEmpty'       // 为空
  | 'isNotEmpty'    // 不为空
  | 'custom'        // 自定义函数

/**
 * 联动动作类型
 */
export type LinkageActionType =
  | 'show'          // 显示字段
  | 'hide'          // 隐藏字段
  | 'enable'        // 启用字段
  | 'disable'       // 禁用字段
  | 'setValue'      // 设置值
  | 'clearValue'    // 清空值
  | 'setOptions'    // 设置选项（级联）
  | 'calculate'     // 计算值
  | 'validate'      // 触发验证
  | 'custom'        // 自定义动作

/**
 * 联动条件配置
 */
export interface LinkageCondition {
  /** 条件类型 */
  type: LinkageConditionType
  /** 源字段名 */
  sourceField: string
  /** 比较值 */
  value?: any
  /** 自定义条件函数 */
  customFn?: (sourceValue: any, formData: Record<string, any>) => boolean
}

/**
 * 联动动作配置
 */
export interface LinkageAction {
  /** 动作类型 */
  type: LinkageActionType
  /** 目标字段名 */
  targetField: string
  /** 动作值（如设置的新值、选项等） */
  value?: any
  /** 自定义动作函数 */
  customFn?: (targetField: string, formData: Record<string, any>, api: Api) => void
}

/**
 * 联动规则配置
 */
export interface LinkageRule {
  /** 规则ID */
  id: string
  /** 规则名称 */
  name?: string
  /** 规则描述 */
  description?: string
  /** 联动条件（AND关系） */
  conditions: LinkageCondition[]
  /** 联动动作 */
  actions: LinkageAction[]
  /** 是否启用 */
  enabled?: boolean
  /** 优先级（数字越大优先级越高） */
  priority?: number
}

/**
 * 级联选择器配置
 */
export interface CascadeConfig {
  /** 级联ID */
  id: string
  /** 父字段名 */
  parentField: string
  /** 子字段名 */
  childField: string
  /** 选项数据源 */
  options: Array<{
    value: any
    label: string
    children?: any[]
  }>
  /** 动态获取子选项的函数 */
  loadChildren?: (parentValue: any) => Promise<any[]>
}

/**
 * 动态字段配置
 */
export interface DynamicFieldConfig {
  /** 触发字段 */
  triggerField: string
  /** 触发值 */
  triggerValue: any
  /** 要添加的字段规则 */
  fieldsToAdd: any[]
  /** 要移除的字段名 */
  fieldsToRemove?: string[]
}

/**
 * 计算字段配置
 */
export interface CalculatedFieldConfig {
  /** 目标字段 */
  targetField: string
  /** 依赖字段 */
  dependFields: string[]
  /** 计算函数 */
  calculate: (values: Record<string, any>) => any
  /** 是否实时计算 */
  realtime?: boolean
}

/**
 * 表单联动引擎
 */
export class FormLinkageEngine {
  private api: Ref<Api | null>
  private formData: Ref<Record<string, any>>
  private rules: LinkageRule[] = []
  private cascades: CascadeConfig[] = []
  private dynamicFields: DynamicFieldConfig[] = []
  private calculatedFields: CalculatedFieldConfig[] = []
  private fieldWatchers: Map<string, Function> = new Map()

  constructor(api: Ref<Api | null>, formData: Ref<Record<string, any>>) {
    this.api = api
    this.formData = formData
  }

  /**
   * 添加联动规则
   */
  addRule(rule: LinkageRule): void {
    // 检查规则是否已存在
    const existingIndex = this.rules.findIndex(r => r.id === rule.id)
    if (existingIndex >= 0) {
      this.rules[existingIndex] = rule
    } else {
      this.rules.push(rule)
    }
    
    // 按优先级排序
    this.rules.sort((a, b) => (b.priority || 0) - (a.priority || 0))
    
    // 注册字段监听
    this.registerFieldWatchers(rule)
  }

  /**
   * 移除联动规则
   */
  removeRule(ruleId: string): void {
    const index = this.rules.findIndex(r => r.id === ruleId)
    if (index >= 0) {
      this.rules.splice(index, 1)
    }
  }

  /**
   * 获取所有规则
   */
  getRules(): LinkageRule[] {
    return this.rules
  }

  /**
   * 添加级联配置
   */
  addCascade(cascade: CascadeConfig): void {
    const existingIndex = this.cascades.findIndex(c => c.id === cascade.id)
    if (existingIndex >= 0) {
      this.cascades[existingIndex] = cascade
    } else {
      this.cascades.push(cascade)
    }
    
    // 注册级联监听
    this.registerCascadeWatcher(cascade)
  }

  /**
   * 添加动态字段配置
   */
  addDynamicField(config: DynamicFieldConfig): void {
    this.dynamicFields.push(config)
    this.registerDynamicFieldWatcher(config)
  }

  /**
   * 添加计算字段配置
   */
  addCalculatedField(config: CalculatedFieldConfig): void {
    this.calculatedFields.push(config)
    this.registerCalculatedFieldWatcher(config)
  }

  /**
   * 注册字段监听器
   */
  private registerFieldWatchers(rule: LinkageRule): void {
    if (!rule.enabled && rule.enabled !== undefined) return

    rule.conditions.forEach(condition => {
      const key = `rule_${rule.id}_${condition.sourceField}`
      if (!this.fieldWatchers.has(key)) {
        this.fieldWatchers.set(key, () => {
          this.evaluateRule(rule)
        })
      }
    })
  }

  /**
   * 评估联动规则
   */
  private evaluateRule(rule: LinkageRule): void {
    if (!this.api.value) return

    // 评估所有条件（AND关系）
    const allConditionsMet = rule.conditions.every(condition => 
      this.evaluateCondition(condition)
    )

    // 如果条件满足，执行动作
    if (allConditionsMet) {
      rule.actions.forEach(action => {
        this.executeAction(action)
      })
    }
  }

  /**
   * 评估单个条件
   */
  private evaluateCondition(condition: LinkageCondition): boolean {
    const sourceValue = this.formData.value[condition.sourceField]

    switch (condition.type) {
      case 'equals':
        return sourceValue === condition.value

      case 'notEquals':
        return sourceValue !== condition.value

      case 'contains':
        if (Array.isArray(sourceValue)) {
          return sourceValue.includes(condition.value)
        }
        if (typeof sourceValue === 'string') {
          return sourceValue.includes(condition.value as string)
        }
        return false

      case 'notContains':
        if (Array.isArray(sourceValue)) {
          return !sourceValue.includes(condition.value)
        }
        if (typeof sourceValue === 'string') {
          return !sourceValue.includes(condition.value as string)
        }
        return true

      case 'greaterThan':
        return Number(sourceValue) > Number(condition.value)

      case 'lessThan':
        return Number(sourceValue) < Number(condition.value)

      case 'between':
        if (Array.isArray(condition.value) && condition.value.length === 2) {
          const num = Number(sourceValue)
          return num >= condition.value[0] && num <= condition.value[1]
        }
        return false

      case 'isEmpty':
        return sourceValue === null || sourceValue === undefined || sourceValue === ''

      case 'isNotEmpty':
        return sourceValue !== null && sourceValue !== undefined && sourceValue !== ''

      case 'custom':
        if (condition.customFn) {
          return condition.customFn(sourceValue, this.formData.value)
        }
        return false

      default:
        return false
    }
  }

  /**
   * 执行联动动作
   */
  private executeAction(action: LinkageAction): void {
    if (!this.api.value) return

    const api = this.api.value

    switch (action.type) {
      case 'show':
        api.hidden(false, action.targetField)
        break

      case 'hide':
        api.hidden(true, action.targetField)
        break

      case 'enable':
        api.disabled(false, action.targetField)
        break

      case 'disable':
        api.disabled(true, action.targetField)
        break

      case 'setValue':
        api.setValue({ [action.targetField]: action.value })
        break

      case 'clearValue':
        api.setValue({ [action.targetField]: undefined })
        break

      case 'setOptions':
        if (action.value && Array.isArray(action.value)) {
          api.updateRule(action.targetField, { options: action.value })
        }
        break

      case 'calculate':
        // 计算逻辑在 calculateField 中处理
        break

      case 'validate':
        api.validateField(action.targetField)
        break

      case 'custom':
        if (action.customFn) {
          action.customFn(action.targetField, this.formData.value, api)
        }
        break
    }
  }

  /**
   * 注册级联监听器
   */
  private registerCascadeWatcher(cascade: CascadeConfig): void {
    const key = `cascade_${cascade.id}`
    if (!this.fieldWatchers.has(key)) {
      this.fieldWatchers.set(key, async () => {
        await this.handleCascade(cascade)
      })
    }
  }

  /**
   * 处理级联选择
   */
  private async handleCascade(cascade: CascadeConfig): Promise<void> {
    if (!this.api.value) return

    const parentValue = this.formData.value[cascade.parentField]
    if (!parentValue) {
      // 父级未选择，清空子级
      this.api.value.setValue({ [cascade.childField]: undefined })
      this.api.value.updateRule(cascade.childField, { options: [] })
      return
    }

    // 获取子级选项
    let childOptions: any[] = []
    
    if (cascade.loadChildren) {
      // 动态加载
      childOptions = await cascade.loadChildren(parentValue)
    } else {
      // 从静态配置中查找
      const parentOption = cascade.options.find(opt => opt.value === parentValue)
      if (parentOption && parentOption.children) {
        childOptions = parentOption.children
      }
    }

    // 更新子级选项
    this.api.value.updateRule(cascade.childField, { options: childOptions })
    
    // 清空子级当前值（如果不在新选项中）
    const currentChildValue = this.formData.value[cascade.childField]
    if (currentChildValue) {
      const isValidValue = childOptions.some(opt => opt.value === currentChildValue)
      if (!isValidValue) {
        this.api.value.setValue({ [cascade.childField]: undefined })
      }
    }
  }

  /**
   * 注册动态字段监听器
   */
  private registerDynamicFieldWatcher(config: DynamicFieldConfig): void {
    const key = `dynamic_${config.triggerField}`
    if (!this.fieldWatchers.has(key)) {
      this.fieldWatchers.set(key, () => {
        this.handleDynamicFields(config)
      })
    }
  }

  /**
   * 处理动态字段
   */
  private handleDynamicFields(config: DynamicFieldConfig): void {
    if (!this.api.value) return

    const triggerValue = this.formData.value[config.triggerField]
    const shouldAdd = triggerValue === config.triggerValue

    if (shouldAdd) {
      // 添加字段
      config.fieldsToAdd.forEach(fieldRule => {
        // 检查字段是否已存在
        const existingRule = this.api.value!.getRule(fieldRule.field)
        if (!existingRule) {
          this.api.value!.addRule(fieldRule)
        }
      })
    } else {
      // 移除字段
      if (config.fieldsToRemove) {
        config.fieldsToRemove.forEach(fieldName => {
          const rule = this.api.value!.getRule(fieldName)
          if (rule) {
            this.api.value!.removeRule(rule)
          }
        })
      }
    }
  }

  /**
   * 注册计算字段监听器
   */
  private registerCalculatedFieldWatcher(config: CalculatedFieldConfig): void {
    config.dependFields.forEach(field => {
      const key = `calc_${config.targetField}_${field}`
      if (!this.fieldWatchers.has(key)) {
        this.fieldWatchers.set(key, () => {
          this.handleCalculatedField(config)
        })
      }
    })
  }

  /**
   * 处理计算字段
   */
  private handleCalculatedField(config: CalculatedFieldConfig): void {
    if (!this.api.value) return

    // 收集依赖字段的值
    const values: Record<string, any> = {}
    config.dependFields.forEach(field => {
      values[field] = this.formData.value[field]
    })

    // 检查所有依赖字段是否都有值
    const allDependenciesFilled = config.dependFields.every(
      field => values[field] !== undefined && values[field] !== null && values[field] !== ''
    )

    if (allDependenciesFilled || config.realtime) {
      try {
        // 执行计算
        const result = config.calculate(values)
        // 设置目标字段值
        this.api.value.setValue({ [config.targetField]: result })
      } catch (error) {
        console.error('计算字段错误:', error)
      }
    }
  }

  /**
   * 触发字段变化（手动触发联动）
   */
  triggerFieldChange(fieldName: string): void {
    // 触发相关的联动规则
    this.rules.forEach(rule => {
      const hasField = rule.conditions.some(c => c.sourceField === fieldName)
      if (hasField) {
        this.evaluateRule(rule)
      }
    })

    // 触发相关的级联
    this.cascades.forEach(cascade => {
      if (cascade.parentField === fieldName) {
        this.handleCascade(cascade)
      }
    })

    // 触发相关的动态字段
    this.dynamicFields.forEach(config => {
      if (config.triggerField === fieldName) {
        this.handleDynamicFields(config)
      }
    })

    // 触发相关的计算字段
    this.calculatedFields.forEach(config => {
      if (config.dependFields.includes(fieldName)) {
        this.handleCalculatedField(config)
      }
    })
  }

  /**
   * 初始化所有联动规则（在表单加载时调用）
   */
  initializeAll(): void {
    // 评估所有联动规则
    this.rules.forEach(rule => {
      if (rule.enabled !== false) {
        this.evaluateRule(rule)
      }
    })

    // 初始化所有级联
    this.cascades.forEach(cascade => {
      this.handleCascade(cascade)
    })

    // 初始化所有计算字段
    this.calculatedFields.forEach(config => {
      this.handleCalculatedField(config)
    })
  }

  /**
   * 清理所有监听器
   */
  cleanup(): void {
    this.fieldWatchers.clear()
    this.rules = []
    this.cascades = []
    this.dynamicFields = []
    this.calculatedFields = []
  }
}

