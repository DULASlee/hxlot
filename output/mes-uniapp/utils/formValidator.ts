/**
 * 表单验证工具
 * 用途：提供通用的表单验证规则和验证方法
 * 符合铁律2：控件完整性（防止无效数据提交）
 */

/**
 * 验证规则类型
 */
export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  validator?: (value: any) => boolean | string
  message?: string
  trigger?: string | string[]
}

/**
 * 字段验证配置
 */
export interface FieldValidation {
  [field: string]: ValidationRule[]
}

/**
 * 常用验证规则
 */
export const ValidationRules = {
  /**
   * 必填规则
   */
  required(message = '此项为必填项'): ValidationRule {
    return {
      required: true,
      message,
      trigger: ['blur', 'change']
    }
  },

  /**
   * 长度范围规则
   */
  length(min: number, max: number, message?: string): ValidationRule {
    return {
      minLength: min,
      maxLength: max,
      message: message || `长度为${min}-${max}个字符`,
      trigger: ['blur', 'change']
    }
  },

  /**
   * 数值范围规则
   */
  range(min: number, max: number, message?: string): ValidationRule {
    return {
      min,
      max,
      message: message || `数值范围：${min}-${max}`,
      trigger: ['blur', 'change']
    }
  },

  /**
   * 编码格式规则（大写字母-数字）
   */
  code(message = '编码格式：2-4个大写字母-3-6位数字（如PL-001）'): ValidationRule {
    return {
      pattern: /^[A-Z]{2,4}-\d{3,6}$/,
      message,
      trigger: ['blur', 'change']
    }
  },

  /**
   * 手机号规则
   */
  phone(message = '请输入正确的手机号'): ValidationRule {
    return {
      pattern: /^1[3-9]\d{9}$/,
      message,
      trigger: ['blur', 'change']
    }
  },

  /**
   * 邮箱规则
   */
  email(message = '请输入正确的邮箱地址'): ValidationRule {
    return {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message,
      trigger: ['blur', 'change']
    }
  },

  /**
   * URL规则
   */
  url(message = '请输入正确的URL地址'): ValidationRule {
    return {
      pattern: /^https?:\/\/.+/,
      message,
      trigger: ['blur', 'change']
    }
  },

  /**
   * 正整数规则
   */
  positiveInteger(message = '请输入正整数'): ValidationRule {
    return {
      pattern: /^[1-9]\d*$/,
      message,
      trigger: ['blur', 'change']
    }
  },

  /**
   * 非负整数规则（包含0）
   */
  nonNegativeInteger(message = '请输入非负整数'): ValidationRule {
    return {
      pattern: /^(0|[1-9]\d*)$/,
      message,
      trigger: ['blur', 'change']
    }
  },

  /**
   * 自定义验证规则
   */
  custom(validator: (value: any) => boolean | string, message = '验证失败'): ValidationRule {
    return {
      validator,
      message,
      trigger: ['blur', 'change']
    }
  }
}

/**
 * 生产线表单验证配置
 */
export const ProductionLineFormValidation: FieldValidation = {
  name: [
    ValidationRules.required('请输入生产线名称'),
    ValidationRules.length(2, 50)
  ],
  code: [
    ValidationRules.required('请输入生产线编码'),
    ValidationRules.code()
  ],
  status: [
    ValidationRules.required('请选择运行状态')
  ],
  location: [
    ValidationRules.length(0, 100, '位置长度不超过100个字符')
  ],
  capacity: [
    ValidationRules.range(0, 100000, '产能范围：0-100000')
  ],
  currentOutput: [
    ValidationRules.range(0, 100000, '当前产量范围：0-100000')
  ]
}

/**
 * 设备表单验证配置
 */
export const EquipmentFormValidation: FieldValidation = {
  name: [
    ValidationRules.required('请输入设备名称'),
    ValidationRules.length(2, 50)
  ],
  code: [
    ValidationRules.required('请输入设备编码'),
    ValidationRules.code('编码格式：2-4个大写字母-3-6位数字（如EQ-001）')
  ],
  type: [
    ValidationRules.required('请输入设备类型')
  ],
  status: [
    ValidationRules.required('请选择设备状态')
  ],
  productionLineId: [
    ValidationRules.required('请选择所属生产线')
  ]
}

/**
 * 传感器数据表单验证配置
 */
export const SensorDataFormValidation: FieldValidation = {
  sensorType: [
    ValidationRules.required('请输入传感器类型')
  ],
  sensorName: [
    ValidationRules.required('请输入传感器名称'),
    ValidationRules.length(2, 50)
  ],
  sensorCode: [
    ValidationRules.required('请输入传感器编码'),
    ValidationRules.code('编码格式：2-4个大写字母-3-6位数字（如SEN-001）')
  ],
  value: [
    ValidationRules.required('请输入传感器数值')
  ],
  unit: [
    ValidationRules.required('请输入单位')
  ]
}

/**
 * 验证单个字段
 */
export function validateField(value: any, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    // 必填验证
    if (rule.required && (value === null || value === undefined || value === '')) {
      return rule.message || '此项为必填项'
    }

    // 跳过空值的其他验证
    if (value === null || value === undefined || value === '') {
      continue
    }

    // 长度验证
    if (rule.minLength !== undefined && value.length < rule.minLength) {
      return rule.message || `最小长度为${rule.minLength}`
    }
    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
      return rule.message || `最大长度为${rule.maxLength}`
    }

    // 数值范围验证
    if (rule.min !== undefined && value < rule.min) {
      return rule.message || `最小值为${rule.min}`
    }
    if (rule.max !== undefined && value > rule.max) {
      return rule.message || `最大值为${rule.max}`
    }

    // 正则验证
    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message || '格式不正确'
    }

    // 自定义验证
    if (rule.validator) {
      const result = rule.validator(value)
      if (result !== true) {
        return typeof result === 'string' ? result : rule.message || '验证失败'
      }
    }
  }

  return null // 验证通过
}

/**
 * 验证整个表单
 */
export function validateForm(formData: any, validation: FieldValidation): { [field: string]: string } {
  const errors: { [field: string]: string } = {}

  for (const field in validation) {
    const rules = validation[field]
    const value = formData[field]
    const error = validateField(value, rules)
    if (error) {
      errors[field] = error
    }
  }

  return errors
}

