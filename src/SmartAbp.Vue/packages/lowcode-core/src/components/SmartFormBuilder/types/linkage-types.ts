/**
 * 表单联动类型定义
 * 
 * @author SmartAbp Team
 * @since 2025-01-07
 * @version 2.0
 */

export * from '../engine/FormLinkageEngine'

/**
 * 预定义的常用联动规则模板
 */
export const LINKAGE_TEMPLATES = {
  /**
   * 条件显示模板
   */
  conditionalDisplay: (sourceField: string, triggerValue: any, targetFields: string[]) => ({
    id: `conditional_display_${sourceField}_${Date.now()}`,
    name: '条件显示',
    conditions: [
      {
        type: 'equals' as const,
        sourceField,
        value: triggerValue
      }
    ],
    actions: targetFields.map(field => ({
      type: 'show' as const,
      targetField: field
    })),
    enabled: true,
    priority: 100
  }),

  /**
   * 省市区三级联动模板
   */
  provinceCityDistrict: () => ({
    provinces: {
      id: 'cascade_province_city',
      parentField: 'province',
      childField: 'city',
      options: [] // 需要从外部传入
    },
    cities: {
      id: 'cascade_city_district',
      parentField: 'city',
      childField: 'district',
      options: []
    }
  }),

  /**
   * 数量单价总价计算模板
   */
  priceCalculation: () => ({
    id: `calc_total_price_${Date.now()}`,
    targetField: 'totalPrice',
    dependFields: ['quantity', 'unitPrice'],
    calculate: (values: Record<string, any>) => {
      const quantity = Number(values.quantity) || 0
      const unitPrice = Number(values.unitPrice) || 0
      return (quantity * unitPrice).toFixed(2)
    },
    realtime: true
  }),

  /**
   * 表单类型切换模板
   */
  formTypeSwitch: (typeField: string, typeValue: any, fieldsToShow: any[], fieldsToHide: string[]) => ({
    id: `form_type_switch_${typeField}_${Date.now()}`,
    name: '表单类型切换',
    conditions: [
      {
        type: 'equals' as const,
        sourceField: typeField,
        value: typeValue
      }
    ],
    actions: [
      ...fieldsToShow.map(field => ({
        type: 'show' as const,
        targetField: typeof field === 'string' ? field : field.field
      })),
      ...fieldsToHide.map(field => ({
        type: 'hide' as const,
        targetField: field
      }))
    ],
    enabled: true,
    priority: 90
  })
}

/**
 * 联动规则验证器
 */
export class LinkageRuleValidator {
  /**
   * 验证联动规则的有效性
   */
  static validate(rule: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!rule.id) {
      errors.push('规则ID不能为空')
    }

    if (!rule.conditions || !Array.isArray(rule.conditions) || rule.conditions.length === 0) {
      errors.push('至少需要一个条件')
    }

    if (!rule.actions || !Array.isArray(rule.actions) || rule.actions.length === 0) {
      errors.push('至少需要一个动作')
    }

    // 验证条件
    rule.conditions?.forEach((condition: any, index: number) => {
      if (!condition.type) {
        errors.push(`条件${index + 1}: 条件类型不能为空`)
      }
      if (!condition.sourceField) {
        errors.push(`条件${index + 1}: 源字段不能为空`)
      }
      if (condition.type === 'custom' && !condition.customFn) {
        errors.push(`条件${index + 1}: 自定义条件必须提供自定义函数`)
      }
    })

    // 验证动作
    rule.actions?.forEach((action: any, index: number) => {
      if (!action.type) {
        errors.push(`动作${index + 1}: 动作类型不能为空`)
      }
      if (!action.targetField) {
        errors.push(`动作${index + 1}: 目标字段不能为空`)
      }
      if (action.type === 'custom' && !action.customFn) {
        errors.push(`动作${index + 1}: 自定义动作必须提供自定义函数`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

/**
 * 联动规则构建器（Builder模式）
 */
export class LinkageRuleBuilder {
  private rule: any = {
    id: `rule_${Date.now()}`,
    conditions: [],
    actions: [],
    enabled: true,
    priority: 100
  }

  /**
   * 设置规则ID
   */
  setId(id: string): this {
    this.rule.id = id
    return this
  }

  /**
   * 设置规则名称
   */
  setName(name: string): this {
    this.rule.name = name
    return this
  }

  /**
   * 设置描述
   */
  setDescription(description: string): this {
    this.rule.description = description
    return this
  }

  /**
   * 设置优先级
   */
  setPriority(priority: number): this {
    this.rule.priority = priority
    return this
  }

  /**
   * 添加条件：等于
   */
  whenEquals(field: string, value: any): this {
    this.rule.conditions.push({
      type: 'equals',
      sourceField: field,
      value
    })
    return this
  }

  /**
   * 添加条件：不等于
   */
  whenNotEquals(field: string, value: any): this {
    this.rule.conditions.push({
      type: 'notEquals',
      sourceField: field,
      value
    })
    return this
  }

  /**
   * 添加条件：为空
   */
  whenEmpty(field: string): this {
    this.rule.conditions.push({
      type: 'isEmpty',
      sourceField: field
    })
    return this
  }

  /**
   * 添加条件：不为空
   */
  whenNotEmpty(field: string): this {
    this.rule.conditions.push({
      type: 'isNotEmpty',
      sourceField: field
    })
    return this
  }

  /**
   * 添加条件：大于
   */
  whenGreaterThan(field: string, value: number): this {
    this.rule.conditions.push({
      type: 'greaterThan',
      sourceField: field,
      value
    })
    return this
  }

  /**
   * 添加条件：小于
   */
  whenLessThan(field: string, value: number): this {
    this.rule.conditions.push({
      type: 'lessThan',
      sourceField: field,
      value
    })
    return this
  }

  /**
   * 添加条件：自定义
   */
  whenCustom(field: string, fn: (value: any, formData: Record<string, any>) => boolean): this {
    this.rule.conditions.push({
      type: 'custom',
      sourceField: field,
      customFn: fn
    })
    return this
  }

  /**
   * 添加动作：显示
   */
  thenShow(...fields: string[]): this {
    fields.forEach(field => {
      this.rule.actions.push({
        type: 'show',
        targetField: field
      })
    })
    return this
  }

  /**
   * 添加动作：隐藏
   */
  thenHide(...fields: string[]): this {
    fields.forEach(field => {
      this.rule.actions.push({
        type: 'hide',
        targetField: field
      })
    })
    return this
  }

  /**
   * 添加动作：启用
   */
  thenEnable(...fields: string[]): this {
    fields.forEach(field => {
      this.rule.actions.push({
        type: 'enable',
        targetField: field
      })
    })
    return this
  }

  /**
   * 添加动作：禁用
   */
  thenDisable(...fields: string[]): this {
    fields.forEach(field => {
      this.rule.actions.push({
        type: 'disable',
        targetField: field
      })
    })
    return this
  }

  /**
   * 添加动作：设置值
   */
  thenSetValue(field: string, value: any): this {
    this.rule.actions.push({
      type: 'setValue',
      targetField: field,
      value
    })
    return this
  }

  /**
   * 添加动作：清空值
   */
  thenClearValue(...fields: string[]): this {
    fields.forEach(field => {
      this.rule.actions.push({
        type: 'clearValue',
        targetField: field
      })
    })
    return this
  }

  /**
   * 添加动作：设置选项
   */
  thenSetOptions(field: string, options: any[]): this {
    this.rule.actions.push({
      type: 'setOptions',
      targetField: field,
      value: options
    })
    return this
  }

  /**
   * 添加动作：自定义
   */
  thenCustom(field: string, fn: (targetField: string, formData: Record<string, any>, api: any) => void): this {
    this.rule.actions.push({
      type: 'custom',
      targetField: field,
      customFn: fn
    })
    return this
  }

  /**
   * 构建规则
   */
  build(): any {
    const validation = LinkageRuleValidator.validate(this.rule)
    if (!validation.valid) {
      throw new Error(`联动规则验证失败: ${validation.errors.join(', ')}`)
    }
    return { ...this.rule }
  }
}

