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

/** form-create 配置（最小化定义，适配内部使用） */
export interface FormCreateConfig {
    form?: {
        labelPosition?: 'left' | 'right' | 'top'
        labelWidth?: string | number
        size?: ElementSize
    }
    submitBtn?: boolean | { show?: boolean; innerText?: string }
    resetBtn?: boolean | { show?: boolean; innerText?: string }
}

/** form-create 规则（最小化定义，适配内部使用） */
export interface FormCreateRule {
    field: string
    type?: string
    title?: string
    value?: unknown
    props?: Record<string, unknown>
    col?: { span?: number }
    class?: string | string[]
    style?: CSSStyleObject
    options?: Array<{ label: string; value: unknown; disabled?: boolean }>
    validate?: unknown[]
    hidden?: boolean
    on?: Record<string, (...args: unknown[]) => unknown>
}

