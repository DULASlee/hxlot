/**
 * 🌐 SmartAbp LowCode Engine - 验证错误消息国际化
 *
 * 提供多语言的验证错误消息支持
 *
 * @version 1.0.0
 * @author SmartAbp架构团队
 * @date 2025-10-16
 */

// ============================================================================
// 错误消息类型定义
// ============================================================================

/**
 * 支持的语言
 */
export type SupportedLocale = 'zh-CN' | 'en-US'

/**
 * 错误消息键
 */
export type ErrorMessageKey =
    | 'required'
    | 'invalid_type'
    | 'too_small'
    | 'too_big'
    | 'invalid_string'
    | 'invalid_email'
    | 'invalid_url'
    | 'custom'

/**
 * 错误消息模板
 */
export interface ErrorMessageTemplate {
    /** 消息模板（支持{{field}}占位符） */
    template: string
    /** 详细描述（可选） */
    description?: string
}

/**
 * 语言包
 */
export type LocaleMessages = Record<ErrorMessageKey, ErrorMessageTemplate>

// ============================================================================
// 中文错误消息
// ============================================================================

export const zh_CN: LocaleMessages = {
    required: {
        template: '{{field}}是必填项',
        description: '字段不能为空'
    },
    invalid_type: {
        template: '{{field}}类型不正确，期望{{expected}}，实际{{received}}',
        description: '字段类型与定义不匹配'
    },
    too_small: {
        template: '{{field}}长度不足，最小需要{{minimum}}',
        description: '字段长度小于最小要求'
    },
    too_big: {
        template: '{{field}}长度过长，最大允许{{maximum}}',
        description: '字段长度超过最大限制'
    },
    invalid_string: {
        template: '{{field}}格式不正确',
        description: '字段格式验证失败'
    },
    invalid_email: {
        template: '{{field}}不是有效的邮箱地址',
        description: '邮箱格式验证失败'
    },
    invalid_url: {
        template: '{{field}}不是有效的URL',
        description: 'URL格式验证失败'
    },
    custom: {
        template: '{{field}}验证失败：{{message}}',
        description: '自定义验证规则失败'
    }
}

// ============================================================================
// 英文错误消息
// ============================================================================

export const en_US: LocaleMessages = {
    required: {
        template: '{{field}} is required',
        description: 'Field cannot be empty'
    },
    invalid_type: {
        template: '{{field}} has invalid type, expected {{expected}}, received {{received}}',
        description: 'Field type does not match the definition'
    },
    too_small: {
        template: '{{field}} is too short, minimum length is {{minimum}}',
        description: 'Field length is less than the minimum requirement'
    },
    too_big: {
        template: '{{field}} is too long, maximum length is {{maximum}}',
        description: 'Field length exceeds the maximum limit'
    },
    invalid_string: {
        template: '{{field}} has invalid format',
        description: 'Field format validation failed'
    },
    invalid_email: {
        template: '{{field}} is not a valid email address',
        description: 'Email format validation failed'
    },
    invalid_url: {
        template: '{{field}} is not a valid URL',
        description: 'URL format validation failed'
    },
    custom: {
        template: '{{field}} validation failed: {{message}}',
        description: 'Custom validation rule failed'
    }
}

// ============================================================================
// 错误消息管理器
// ============================================================================

/**
 * 当前语言（默认中文）
 */
let currentLocale: SupportedLocale = 'zh-CN'

/**
 * 语言包映射
 */
const localeMap: Record<SupportedLocale, LocaleMessages> = {
    'zh-CN': zh_CN,
    'en-US': en_US
}

/**
 * 获取当前语言
 * @returns 当前语言代码
 */
export function getCurrentLocale(): SupportedLocale {
    return currentLocale
}

/**
 * 设置当前语言
 * @param locale 语言代码
 */
export function setCurrentLocale(locale: SupportedLocale): void {
    if (!localeMap[locale]) {
        console.warn(`Unsupported locale: ${locale}, fallback to zh-CN`)
        currentLocale = 'zh-CN'
    } else {
        currentLocale = locale
    }
}

/**
 * 获取错误消息
 * @param key 错误消息键
 * @param params 替换参数
 * @returns 格式化后的错误消息
 */
export function getErrorMessage(
    key: ErrorMessageKey,
    params: Record<string, string | number> = {}
): string {
    const messages = localeMap[currentLocale]
    const template = messages[key]

    if (!template) {
        console.warn(`Error message template not found: ${key}`)
        return `Validation error: ${key}`
    }

    let message = template.template

    // 替换占位符
    Object.entries(params).forEach(([key, value]) => {
        message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value))
    })

    return message
}

/**
 * 批量获取错误消息
 * @param errors 错误列表
 * @returns 格式化后的错误消息数组
 */
export function getErrorMessages(
    errors: Array<{ key: ErrorMessageKey; params?: Record<string, string | number> }>
): string[] {
    return errors.map(error => getErrorMessage(error.key, error.params))
}

// ============================================================================
// 字段名称映射（用于友好显示）
// ============================================================================

/**
 * 字段名称映射
 */
export interface FieldNameMap {
    [fieldName: string]: {
        'zh-CN': string
        'en-US': string
    }
}

/**
 * 默认字段名称映射
 */
export const defaultFieldNameMap: FieldNameMap = {
    name: {
        'zh-CN': '名称',
        'en-US': 'Name'
    },
    displayName: {
        'zh-CN': '显示名称',
        'en-US': 'Display Name'
    },
    description: {
        'zh-CN': '描述',
        'en-US': 'Description'
    },
    module: {
        'zh-CN': '模块',
        'en-US': 'Module'
    },
    namespace: {
        'zh-CN': '命名空间',
        'en-US': 'Namespace'
    },
    version: {
        'zh-CN': '版本',
        'en-US': 'Version'
    },
    fields: {
        'zh-CN': '字段列表',
        'en-US': 'Fields'
    },
    relationships: {
        'zh-CN': '关系列表',
        'en-US': 'Relationships'
    },
    permissions: {
        'zh-CN': '权限配置',
        'en-US': 'Permissions'
    }
}

/**
 * 获取字段友好名称
 * @param fieldName 字段名称
 * @param locale 语言（可选，默认当前语言）
 * @returns 友好名称
 */
export function getFieldDisplayName(
    fieldName: string,
    locale?: SupportedLocale
): string {
    const targetLocale = locale || currentLocale
    const mapping = defaultFieldNameMap[fieldName]

    if (!mapping) {
        // 如果没有映射，使用原始字段名
        return fieldName
    }

    return mapping[targetLocale] || fieldName
}

/**
 * 格式化验证错误（包含字段友好名称）
 * @param fieldName 字段名称
 * @param errorKey 错误键
 * @param params 额外参数
 * @returns 格式化后的错误消息
 */
export function formatValidationError(
    fieldName: string,
    errorKey: ErrorMessageKey,
    params: Record<string, string | number> = {}
): string {
    const displayName = getFieldDisplayName(fieldName)
    return getErrorMessage(errorKey, {
        field: displayName,
        ...params
    })
}

// ============================================================================
// 错误消息上下文（用于批量处理）
// ============================================================================

/**
 * 错误消息上下文
 */
export class ErrorMessageContext {
    private locale: SupportedLocale
    private fieldNameMap: FieldNameMap

    constructor(locale?: SupportedLocale, fieldNameMap?: FieldNameMap) {
        this.locale = locale || currentLocale
        this.fieldNameMap = fieldNameMap || defaultFieldNameMap
    }

    /**
     * 格式化单个错误
     */
    format(
        fieldName: string,
        errorKey: ErrorMessageKey,
        params: Record<string, string | number> = {}
    ): string {
        const displayName = this.getFieldDisplayName(fieldName)
        const messages = localeMap[this.locale]
        const template = messages[errorKey]

        if (!template) {
            return `Validation error: ${errorKey}`
        }

        let message = template.template

        // 替换占位符
        Object.entries({
            field: displayName,
            ...params
        }).forEach(([key, value]) => {
            message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value))
        })

        return message
    }

    /**
     * 批量格式化错误
     */
    formatBatch(
        errors: Array<{
            field: string
            key: ErrorMessageKey
            params?: Record<string, string | number>
        }>
    ): string[] {
        return errors.map(error => this.format(error.field, error.key, error.params))
    }

    /**
     * 获取字段显示名称
     */
    private getFieldDisplayName(fieldName: string): string {
        const mapping = this.fieldNameMap[fieldName]
        return mapping?.[this.locale] || fieldName
    }
}

