/**
 * 通用验证函数
 */

import { REGEX } from './constants'

/**
 * 字段验证结果
 */
export interface FieldValidationResult {
  valid: boolean
  message?: string
}

/**
 * 验证是否为空
 */
export function isRequired(value: unknown): FieldValidationResult {
  const valid = value !== null && value !== undefined && value !== ''
  return {
    valid,
    message: valid ? undefined : '此字段不能为空'
  }
}

/**
 * 验证邮箱
 */
export function isEmail(value: string): FieldValidationResult {
  if (!value) {
    return { valid: true }
  }

  const valid = REGEX.EMAIL.test(value)
  return {
    valid,
    message: valid ? undefined : '请输入有效的邮箱地址'
  }
}

/**
 * 验证手机号
 */
export function isPhone(value: string): FieldValidationResult {
  if (!value) {
    return { valid: true }
  }

  const valid = REGEX.PHONE.test(value)
  return {
    valid,
    message: valid ? undefined : '请输入有效的手机号码'
  }
}

/**
 * 验证URL
 */
export function isUrl(value: string): FieldValidationResult {
  if (!value) {
    return { valid: true }
  }

  const valid = REGEX.URL.test(value)
  return {
    valid,
    message: valid ? undefined : '请输入有效的URL地址'
  }
}

/**
 * 验证IP地址
 */
export function isIP(value: string): FieldValidationResult {
  if (!value) {
    return { valid: true }
  }

  const valid = REGEX.IP.test(value)
  return {
    valid,
    message: valid ? undefined : '请输入有效的IP地址'
  }
}

/**
 * 验证数字
 */
export function isNumber(value: string | number): FieldValidationResult {
  if (!value && value !== 0) {
    return { valid: true }
  }

  const valid = typeof value === 'number' || REGEX.NUMBER.test(String(value))
  return {
    valid,
    message: valid ? undefined : '请输入有效的数字'
  }
}

/**
 * 验证整数
 */
export function isInteger(value: string | number): FieldValidationResult {
  if (!value && value !== 0) {
    return { valid: true }
  }

  const valid = typeof value === 'number' ? Number.isInteger(value) : REGEX.INTEGER.test(String(value))
  return {
    valid,
    message: valid ? undefined : '请输入有效的整数'
  }
}

/**
 * 验证正整数
 */
export function isPositiveInteger(value: string | number): FieldValidationResult {
  if (!value && value !== 0) {
    return { valid: true }
  }

  const valid = typeof value === 'number' ? Number.isInteger(value) && value > 0 : REGEX.POSITIVE_INTEGER.test(String(value))
  return {
    valid,
    message: valid ? undefined : '请输入有效的正整数'
  }
}

/**
 * 验证身份证号
 */
export function isIdCard(value: string): FieldValidationResult {
  if (!value) {
    return { valid: true }
  }

  const valid = REGEX.ID_CARD.test(value)
  return {
    valid,
    message: valid ? undefined : '请输入有效的身份证号'
  }
}

/**
 * 验证最小长度
 */
export function minLength(value: string, min: number): FieldValidationResult {
  if (!value) {
    return { valid: true }
  }

  const valid = value.length >= min
  return {
    valid,
    message: valid ? undefined : `最少需要${min}个字符`
  }
}

/**
 * 验证最大长度
 */
export function maxLength(value: string, max: number): FieldValidationResult {
  if (!value) {
    return { valid: true }
  }

  const valid = value.length <= max
  return {
    valid,
    message: valid ? undefined : `最多允许${max}个字符`
  }
}

/**
 * 验证范围长度
 */
export function rangeLength(value: string, min: number, max: number): FieldValidationResult {
  if (!value) {
    return { valid: true }
  }

  const valid = value.length >= min && value.length <= max
  return {
    valid,
    message: valid ? undefined : `长度需要在${min}-${max}个字符之间`
  }
}

/**
 * 验证最小值
 */
export function minValue(value: number, min: number): FieldValidationResult {
  if (value === null || value === undefined) {
    return { valid: true }
  }

  const valid = value >= min
  return {
    valid,
    message: valid ? undefined : `最小值为${min}`
  }
}

/**
 * 验证最大值
 */
export function maxValue(value: number, max: number): FieldValidationResult {
  if (value === null || value === undefined) {
    return { valid: true }
  }

  const valid = value <= max
  return {
    valid,
    message: valid ? undefined : `最大值为${max}`
  }
}

/**
 * 验证范围值
 */
export function rangeValue(value: number, min: number, max: number): FieldValidationResult {
  if (value === null || value === undefined) {
    return { valid: true }
  }

  const valid = value >= min && value <= max
  return {
    valid,
    message: valid ? undefined : `值需要在${min}-${max}之间`
  }
}

/**
 * 验证正则表达式
 */
export function pattern(value: string, regex: RegExp, message?: string): FieldValidationResult {
  if (!value) {
    return { valid: true }
  }

  const valid = regex.test(value)
  return {
    valid,
    message: valid ? undefined : message || '格式不正确'
  }
}

/**
 * 自定义验证
 */
export function custom(
  value: unknown,
  validator: (value: unknown) => boolean | Promise<boolean>,
  message?: string
): FieldValidationResult | Promise<FieldValidationResult> {
  const result = validator(value)

  if (result instanceof Promise) {
    return result.then((valid) => ({
      valid,
      message: valid ? undefined : message || '验证失败'
    }))
  }

  return {
    valid: result,
    message: result ? undefined : message || '验证失败'
  }
}
