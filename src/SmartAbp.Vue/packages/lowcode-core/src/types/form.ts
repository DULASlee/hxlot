/**
 * 表单系统类型定义
 * 
 * 用于消除SmartFormDesigner和FormSchemaAdapter中的as any使用
 */

/**
 * Element Plus表单组件尺寸
 */
export type ElementSize = 'large' | 'default' | 'small'

/**
 * 表单验证规则
 */
export interface FormValidateRule {
    /** 是否必填 */
    required?: boolean
    /** 错误提示消息 */
    message?: string
    /** 触发方式 */
    trigger?: 'blur' | 'change' | string | string[]
    /** 最小长度 */
    min?: number
    /** 最大长度 */
    max?: number
    /** 正则表达式 */
    pattern?: RegExp
    /** 自定义验证器 */
    validator?: (rule: unknown, value: unknown, callback: (error?: Error) => void) => void
    /** 其他属性 */
    [key: string]: unknown
}

/**
 * CSS样式对象类型
 */
export type CSSStyleObject = Partial<CSSStyleDeclaration> | Record<string, string | number>

