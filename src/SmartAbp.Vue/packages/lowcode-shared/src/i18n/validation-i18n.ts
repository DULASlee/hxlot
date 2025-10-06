/**
 * @smartabp/lowcode-shared
 * 验证系统国际化工具
 * 
 * 🔥 阶段4：国际化错误信息
 * - 集成Vue I18n系统
 * - 提供验证错误消息翻译
 * - 支持参数化错误消息
 */

/**
 * 验证错误消息键
 */
export enum ValidationMessageKey {
  // 基础验证
  ENTITY_NAME_REQUIRED = 'wizard.validation.schemaValidation.entityNameRequired',
  ENTITY_NAME_INVALID = 'wizard.validation.schemaValidation.entityNameInvalid',
  FIELD_NAME_REQUIRED = 'wizard.validation.schemaValidation.fieldNameRequired',
  FIELD_TYPE_REQUIRED = 'wizard.validation.schemaValidation.fieldTypeRequired',
  FIELD_TYPE_INVALID = 'wizard.validation.schemaValidation.fieldTypeInvalid',
  
  // 字符串验证
  STRING_TOO_SHORT = 'wizard.validation.schemaValidation.stringTooShort',
  STRING_TOO_LONG = 'wizard.validation.schemaValidation.stringTooLong',
  
  // 数值验证
  NUMBER_TOO_SMALL = 'wizard.validation.schemaValidation.numberTooSmall',
  NUMBER_TOO_BIG = 'wizard.validation.schemaValidation.numberTooBig',
  
  // 数组验证
  ARRAY_TOO_FEW = 'wizard.validation.schemaValidation.arrayTooFew',
  ARRAY_TOO_MANY = 'wizard.validation.schemaValidation.arrayTooMany',
  
  // 格式验证
  INVALID_EMAIL = 'wizard.validation.schemaValidation.invalidEmail',
  INVALID_URL = 'wizard.validation.schemaValidation.invalidUrl',
  INVALID_REGEX = 'wizard.validation.schemaValidation.invalidRegex',
  INVALID_ENUM = 'wizard.validation.schemaValidation.invalidEnum',
  
  // 版本验证
  SCHEMA_VERSION_INVALID = 'wizard.validation.schemaValidation.schemaVersionInvalid',
  SCHEMA_VERSION_OLDER = 'wizard.validation.schemaValidation.schemaVersionOlder',
  SCHEMA_VERSION_NEWER = 'wizard.validation.schemaValidation.schemaVersionNewer',
  SCHEMA_VERSION_INCOMPATIBLE = 'wizard.validation.schemaValidation.schemaVersionIncompatible',
  
  // 兼容性检查
  FIELD_REMOVED = 'wizard.validation.schemaValidation.fieldRemoved',
  TYPE_CHANGED = 'wizard.validation.schemaValidation.typeChanged',
  FIELD_REQUIRED = 'wizard.validation.schemaValidation.fieldRequired',
  SCHEMA_CHANGED = 'wizard.validation.schemaValidation.schemaChanged',
  BREAKING_CHANGE_DETECTED = 'wizard.validation.schemaValidation.breakingChangeDetected',
  USE_SEMANTIC_VERSION = 'wizard.validation.schemaValidation.useSemanticVersion'
}

/**
 * Zod错误代码到ValidationMessageKey的映射
 */
export const ZOD_ERROR_TO_MESSAGE_KEY: Record<string, ValidationMessageKey> = {
  'too_small': ValidationMessageKey.STRING_TOO_SHORT,
  'too_big': ValidationMessageKey.STRING_TOO_LONG,
  'invalid_type': ValidationMessageKey.FIELD_TYPE_INVALID,
  'invalid_string': ValidationMessageKey.INVALID_REGEX,
  'invalid_enum_value': ValidationMessageKey.INVALID_ENUM
}

/**
 * Zod字符串验证类型映射
 */
export const ZOD_STRING_VALIDATION_TO_KEY: Record<string, ValidationMessageKey> = {
  'email': ValidationMessageKey.INVALID_EMAIL,
  'url': ValidationMessageKey.INVALID_URL,
  'regex': ValidationMessageKey.INVALID_REGEX
}

/**
 * 错误消息参数类型
 */
export type ValidationMessageParams = {
  expected?: string
  received?: string
  minimum?: number
  maximum?: number
  options?: string
  version?: string
  current?: string
  field?: string
  oldType?: string
  newType?: string
  summary?: string
}

/**
 * 验证国际化配置
 */
export interface ValidationI18nConfig {
  /** 当前语言环境 */
  locale: string
  /** Vue I18n的t函数 */
  t: (key: string, params?: Record<string, any>) => string
}

let currentConfig: ValidationI18nConfig | null = null

/**
 * 设置验证国际化配置
 */
export function setValidationI18nConfig(config: ValidationI18nConfig): void {
  currentConfig = config
}

/**
 * 获取验证国际化配置
 */
export function getValidationI18nConfig(): ValidationI18nConfig | null {
  return currentConfig
}

/**
 * 翻译验证错误消息
 * 
 * @param key 消息键
 * @param params 消息参数
 * @returns 翻译后的消息
 */
export function translateValidationMessage(
  key: ValidationMessageKey | string,
  params?: ValidationMessageParams
): string {
  if (!currentConfig) {
    // 降级：没有配置时返回英文默认消息
    return getFallbackMessage(key, params)
  }
  
  try {
    return currentConfig.t(key, params)
  } catch (error) {
    console.warn('翻译验证消息失败:', key, error)
    return getFallbackMessage(key, params)
  }
}

/**
 * 从Zod错误代码获取消息键
 */
export function getMessageKeyFromZodError(zodError: any): ValidationMessageKey | null {
  const errorCode = zodError.code
  
  // 字符串验证特殊处理
  if (errorCode === 'invalid_string' && zodError.validation) {
    return ZOD_STRING_VALIDATION_TO_KEY[zodError.validation] || null
  }
  
  // 数值范围验证
  if (errorCode === 'too_small') {
    if (zodError.type === 'string') return ValidationMessageKey.STRING_TOO_SHORT
    if (zodError.type === 'number') return ValidationMessageKey.NUMBER_TOO_SMALL
    if (zodError.type === 'array') return ValidationMessageKey.ARRAY_TOO_FEW
  }
  
  if (errorCode === 'too_big') {
    if (zodError.type === 'string') return ValidationMessageKey.STRING_TOO_LONG
    if (zodError.type === 'number') return ValidationMessageKey.NUMBER_TOO_BIG
    if (zodError.type === 'array') return ValidationMessageKey.ARRAY_TOO_MANY
  }
  
  // 通用映射
  return ZOD_ERROR_TO_MESSAGE_KEY[errorCode] || null
}

/**
 * 提取Zod错误的参数
 */
export function extractZodErrorParams(zodError: any): ValidationMessageParams {
  const params: ValidationMessageParams = {}
  
  if (zodError.expected !== undefined) params.expected = zodError.expected
  if (zodError.received !== undefined) params.received = zodError.received
  if (zodError.minimum !== undefined) params.minimum = zodError.minimum
  if (zodError.maximum !== undefined) params.maximum = zodError.maximum
  if (zodError.options) params.options = zodError.options.join(', ')
  
  return params
}

/**
 * 获取降级消息（英文）
 */
function getFallbackMessage(key: string, params?: ValidationMessageParams): string {
  const fallbackMessages: Record<string, string> = {
    [ValidationMessageKey.ENTITY_NAME_REQUIRED]: 'Entity name is required',
    [ValidationMessageKey.ENTITY_NAME_INVALID]: 'Invalid entity name format, must be PascalCase',
    [ValidationMessageKey.FIELD_NAME_REQUIRED]: 'Field name is required',
    [ValidationMessageKey.FIELD_TYPE_REQUIRED]: 'Field type is required',
    [ValidationMessageKey.FIELD_TYPE_INVALID]: `Invalid field type: expected ${params?.expected}, received ${params?.received}`,
    [ValidationMessageKey.STRING_TOO_SHORT]: `String length must be at least ${params?.minimum} characters`,
    [ValidationMessageKey.STRING_TOO_LONG]: `String length must not exceed ${params?.maximum} characters`,
    [ValidationMessageKey.NUMBER_TOO_SMALL]: `Value must be at least ${params?.minimum}`,
    [ValidationMessageKey.NUMBER_TOO_BIG]: `Value must not exceed ${params?.maximum}`,
    [ValidationMessageKey.ARRAY_TOO_FEW]: `Array must contain at least ${params?.minimum} items`,
    [ValidationMessageKey.ARRAY_TOO_MANY]: `Array must not contain more than ${params?.maximum} items`,
    [ValidationMessageKey.INVALID_EMAIL]: 'Please enter a valid email address',
    [ValidationMessageKey.INVALID_URL]: 'Please enter a valid URL',
    [ValidationMessageKey.INVALID_REGEX]: 'Value does not match the required pattern',
    [ValidationMessageKey.INVALID_ENUM]: `Value must be one of: ${params?.options}`,
    [ValidationMessageKey.SCHEMA_VERSION_INVALID]: `Invalid schema version format: ${params?.version}`,
    [ValidationMessageKey.SCHEMA_VERSION_OLDER]: `Schema version ${params?.version} is older than current version ${params?.current}`,
    [ValidationMessageKey.SCHEMA_VERSION_NEWER]: `Schema version ${params?.version} is newer than current version ${params?.current}`,
    [ValidationMessageKey.SCHEMA_VERSION_INCOMPATIBLE]: `Schema version ${params?.version} is not compatible with current version ${params?.current}`,
    [ValidationMessageKey.FIELD_REMOVED]: `Removed required field: ${params?.field}`,
    [ValidationMessageKey.TYPE_CHANGED]: `Field type changed: ${params?.oldType} -> ${params?.newType}`,
    [ValidationMessageKey.FIELD_REQUIRED]: `Field became required: ${params?.field}`,
    [ValidationMessageKey.SCHEMA_CHANGED]: `Schema has changes: ${params?.summary}`,
    [ValidationMessageKey.BREAKING_CHANGE_DETECTED]: 'Breaking changes detected',
    [ValidationMessageKey.USE_SEMANTIC_VERSION]: 'Please use semantic versioning (e.g., 1.0.0)'
  }
  
  return fallbackMessages[key] || key
}

