/**
 * 表单系统类型定义
 * 
 * 目的：为 SmartFormDesigner 与 FormSchemaAdapter 提供强类型
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
    trigger?: 'blur' | 'change' | Array<'blur' | 'change'>
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

