// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 SmartFormBuilder - JSON Schema类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// @module @smartabp/lowcode-core/components/SmartFormBuilder/types
//
// 📋 功能：
//   - 表单配置的JSON Schema定义
//   - 支持30+字段类型
//   - 动态联动规则
//   - 布局引擎配置
//   - 验证规则配置
//
// 🎯 目标：
//   - 完全类型安全
//   - 可序列化（存储到数据库）
//   - 可扩展（插件化）
//   - 业界最佳实践
//
// 🏆 质量标准：
//   - TypeScript类型安全 100%
//   - JSON Schema兼容
//   - 支持国际化
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 字段类型枚举（30+类型）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 表单字段类型（业界最全）
 */
export type FormFieldType =
    // 🔤 文本输入类 (8种)
    | 'text' // 单行文本
    | 'textarea' // 多行文本
    | 'password' // 密码
    | 'email' // 邮箱
    | 'url' // URL
    | 'tel' // 电话
    | 'search' // 搜索框
    | 'code' // 代码编辑器
    // 🔢 数字输入类 (4种)
    | 'number' // 数字
    | 'integer' // 整数
    | 'decimal' // 小数
    | 'currency' // 货币
    // 📅 日期时间类 (5种)
    | 'date' // 日期
    | 'datetime' // 日期时间
    | 'time' // 时间
    | 'daterange' // 日期范围
    | 'datetimerange' // 日期时间范围
    // ✅ 选择类 (7种)
    | 'select' // 下拉选择
    | 'multiselect' // 多选下拉
    | 'radio' // 单选按钮
    | 'checkbox' // 多选框
    | 'switch' // 开关
    | 'slider' // 滑块
    | 'rate' // 评分
    // 📤 文件上传类 (3种)
    | 'upload' // 文件上传
    | 'image' // 图片上传
    | 'file' // 通用文件
    // 🎨 富文本类 (2种)
    | 'richtext' // 富文本编辑器
    | 'markdown' // Markdown编辑器
    // 🌳 复杂组件类 (6种)
    | 'cascader' // 级联选择
    | 'tree' // 树形选择
    | 'transfer' // 穿梭框
    | 'color' // 颜色选择器
    | 'icon' // 图标选择器
    | 'location' // 地图定位
    // 🔧 特殊类型 (5种)
    | 'divider' // 分割线
    | 'title' // 标题
    | 'description' // 描述文本
    | 'slot' // 自定义插槽
    | 'component' // 自定义组件

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 验证规则定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 验证规则类型
 */
export type ValidationRuleType =
    | 'required' // 必填
    | 'min' // 最小值/长度
    | 'max' // 最大值/长度
    | 'pattern' // 正则表达式
    | 'email' // 邮箱格式
    | 'url' // URL格式
    | 'phone' // 电话号码
    | 'idcard' // 身份证号
    | 'custom' // 自定义函数

/**
 * 验证规则
 */
export interface ValidationRule {
    /** 规则类型 */
    type: ValidationRuleType
    /** 规则值（如min的值） */
    value?: any
    /** 错误提示消息 */
    message?: string
    /** 触发时机 */
    trigger?: 'blur' | 'change' | 'submit'
    /** 自定义验证函数 */
    validator?: (value: any, formData: Record<string, any>) => boolean | string | Promise<boolean | string>
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 联动规则定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 联动条件
 */
export interface LinkageCondition {
    /** 目标字段 */
    field: string
    /** 操作符 */
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'notcontains'
    /** 比较值 */
    value: any
    /** 逻辑运算符（多条件时） */
    logic?: 'and' | 'or'
}

/**
 * 联动动作
 */
export interface LinkageAction {
    /** 动作类型 */
    type: 'show' | 'hide' | 'enable' | 'disable' | 'setValue' | 'setOptions' | 'required' | 'optional'
    /** 目标字段 */
    target: string | string[]
    /** 动作值（如setValue的值） */
    value?: any
}

/**
 * 联动规则
 */
export interface LinkageRule {
    /** 规则ID */
    id: string
    /** 规则名称 */
    name: string
    /** 触发条件（支持多条件） */
    conditions: LinkageCondition[]
    /** 执行动作 */
    actions: LinkageAction[]
    /** 是否启用 */
    enabled?: boolean
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 布局配置定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 布局类型
 */
export type FormLayoutType =
    | 'horizontal' // 水平布局
    | 'vertical' // 垂直布局
    | 'inline' // 行内布局
    | 'grid' // 网格布局
    | 'tabs' // 标签页布局
    | 'collapse' // 折叠面板布局
    | 'steps' // 步骤条布局

/**
 * 网格布局配置
 */
export interface GridLayout {
    /** 列数 */
    cols: number
    /** 列间距（px） */
    gutter: number
    /** 响应式断点 */
    responsive?: {
        xs?: number // <768px
        sm?: number // ≥768px
        md?: number // ≥992px
        lg?: number // ≥1200px
        xl?: number // ≥1920px
    }
}

/**
 * 标签页布局配置
 */
export interface TabsLayout {
    /** 标签页列表 */
    tabs: Array<{
        /** 标签页ID */
        id: string
        /** 标签页名称 */
        label: string
        /** 标签页图标 */
        icon?: string
        /** 包含的字段 */
        fields: string[]
    }>
}

/**
 * 步骤条布局配置
 */
export interface StepsLayout {
    /** 步骤列表 */
    steps: Array<{
        /** 步骤ID */
        id: string
        /** 步骤名称 */
        title: string
        /** 步骤描述 */
        description?: string
        /** 步骤图标 */
        icon?: string
        /** 包含的字段 */
        fields: string[]
    }>
    /** 当前步骤 */
    current?: number
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 字段配置定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 选项配置（用于select/radio/checkbox等）
 */
export interface FieldOption {
    /** 选项标签 */
    label: string
    /** 选项值 */
    value: any
    /** 是否禁用 */
    disabled?: boolean
    /** 选项颜色（用于tag等） */
    color?: string
    /** 选项图标 */
    icon?: string
    /** 选项分组 */
    group?: string
    /** 子选项（用于级联选择） */
    children?: FieldOption[]
}

/**
 * 字段样式配置
 */
export interface FieldStyle {
    /** 宽度 */
    width?: string | number
    /** 最小宽度 */
    minWidth?: string | number
    /** 最大宽度 */
    maxWidth?: string | number
    /** 自定义class */
    className?: string
    /** 自定义style */
    customStyle?: Record<string, any>
}

/**
 * 字段配置（完整）
 */
export interface FormFieldConfig {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 基础属性
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /** 字段ID（唯一） */
    id: string
    /** 字段名称（表单数据key） */
    name: string
    /** 字段类型 */
    type: FormFieldType
    /** 字段标签 */
    label?: string
    /** 占位符 */
    placeholder?: string
    /** 默认值 */
    defaultValue?: any
    /** 帮助文本 */
    helpText?: string
    /** 是否必填 */
    required?: boolean
    /** 是否禁用 */
    disabled?: boolean
    /** 是否只读 */
    readonly?: boolean
    /** 是否隐藏 */
    hidden?: boolean

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 验证规则
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /** 验证规则列表 */
    rules?: ValidationRule[]

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 字段特定配置
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /** 选项列表（select/radio/checkbox等） */
    options?: FieldOption[]
    /** 选项数据源（远程加载） */
    optionsSource?: {
        /** API地址 */
        url: string
        /** 请求方法 */
        method?: 'GET' | 'POST'
        /** 请求参数 */
        params?: Record<string, any>
        /** 数据路径（从响应中提取） */
        dataPath?: string
        /** 标签字段名 */
        labelField?: string
        /** 值字段名 */
        valueField?: string
    }

    /** 数字范围（number/integer/decimal等） */
    min?: number
    max?: number
    step?: number
    precision?: number // 精度（小数位数）

    /** 文本长度（text/textarea等） */
    minLength?: number
    maxLength?: number
    showWordLimit?: boolean // 显示字数统计

    /** 文本框行数（textarea） */
    rows?: number
    autosize?: boolean | { minRows?: number; maxRows?: number }

    /** 日期格式（date/datetime等） */
    format?: string
    valueFormat?: string

    /** 上传配置（upload/image/file等） */
    upload?: {
        /** 上传地址 */
        action: string
        /** 请求头 */
        headers?: Record<string, string>
        /** 上传字段名 */
        name?: string
        /** 附加数据 */
        data?: Record<string, any>
        /** 文件大小限制（MB） */
        maxSize?: number
        /** 文件类型限制 */
        accept?: string
        /** 最大文件数 */
        limit?: number
        /** 是否支持多选 */
        multiple?: boolean
        /** 列表样式 */
        listType?: 'text' | 'picture' | 'picture-card'
    }

    /** 富文本配置（richtext） */
    richtext?: {
        /** 工具栏配置 */
        toolbar?: string[]
        /** 高度 */
        height?: number
        /** 是否允许上传图片 */
        allowImageUpload?: boolean
    }

    /** 级联选择配置（cascader） */
    cascader?: {
        /** 是否可搜索 */
        filterable?: boolean
        /** 是否显示完整路径 */
        showAllLevels?: boolean
        /** 次级菜单展开方式 */
        expandTrigger?: 'click' | 'hover'
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 布局与样式
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /** 网格布局（cols占用列数） */
    span?: number // 占用列数（24栅格系统）
    offset?: number // 左侧偏移列数
    pull?: number // 向左移动列数
    push?: number // 向右移动列数

    /** 样式配置 */
    style?: FieldStyle

    /** 标签宽度 */
    labelWidth?: string | number

    /** 标签位置 */
    labelPosition?: 'left' | 'right' | 'top'

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 高级功能
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /** 动态显示条件（表达式） */
    showWhen?: string | ((formData: Record<string, any>) => boolean)

    /** 动态禁用条件（表达式） */
    disabledWhen?: string | ((formData: Record<string, any>) => boolean)

    /** 数据转换器 */
    transform?: {
        /** 输入转换（显示前） */
        input?: (value: any) => any
        /** 输出转换（提交前） */
        output?: (value: any) => any
    }

    /** 自定义插槽名称 */
    slotName?: string

    /** 自定义组件（component类型） */
    component?: any
    componentProps?: Record<string, any>

    /** 扩展属性（传递给组件的props） */
    props?: Record<string, any>

    /** 事件监听器 */
    on?: Record<string, (value: any, formData: Record<string, any>) => void>
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 表单配置定义（顶层）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 表单配置（完整）
 */
export interface FormConfig {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 基础信息
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /** 表单ID（唯一） */
    id: string
    /** 表单名称 */
    name: string
    /** 表单描述 */
    description?: string
    /** 表单版本 */
    version?: string
    /** 创建时间 */
    createdAt?: string
    /** 更新时间 */
    updatedAt?: string
    /** 创建者 */
    createdBy?: string

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 表单配置
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /** 布局类型 */
    layout: FormLayoutType

    /** 标签宽度 */
    labelWidth?: string | number

    /** 标签位置 */
    labelPosition?: 'left' | 'right' | 'top'

    /** 表单尺寸 */
    size?: 'large' | 'default' | 'small'

    /** 是否显示必填星号 */
    showAsterisk?: boolean

    /** 是否显示验证消息 */
    showMessage?: boolean

    /** 是否行内显示 */
    inline?: boolean

    /** 禁用整个表单 */
    disabled?: boolean

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 字段列表
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /** 字段配置列表 */
    fields: FormFieldConfig[]

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 高级布局
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /** 网格布局配置 */
    gridLayout?: GridLayout

    /** 标签页布局配置 */
    tabsLayout?: TabsLayout

    /** 步骤条布局配置 */
    stepsLayout?: StepsLayout

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 联动规则
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /** 联动规则列表 */
    linkageRules?: LinkageRule[]

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 表单操作
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /** 是否显示提交按钮 */
    showSubmit?: boolean
    /** 提交按钮文本 */
    submitText?: string
    /** 提交按钮位置 */
    submitPosition?: 'left' | 'center' | 'right'

    /** 是否显示重置按钮 */
    showReset?: boolean
    /** 重置按钮文本 */
    resetText?: string

    /** 是否显示取消按钮 */
    showCancel?: boolean
    /** 取消按钮文本 */
    cancelText?: string

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 事件钩子
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /** 表单加载前 */
    onBeforeLoad?: (formData: Record<string, any>) => void | Promise<void>
    /** 表单加载后 */
    onAfterLoad?: (formData: Record<string, any>) => void | Promise<void>

    /** 提交前（可用于验证或转换数据） */
    onBeforeSubmit?: (formData: Record<string, any>) => boolean | Record<string, any> | Promise<boolean | Record<string, any>>
    /** 提交后 */
    onAfterSubmit?: (response: any) => void | Promise<void>

    /** 字段值变化 */
    onFieldChange?: (fieldName: string, value: any, formData: Record<string, any>) => void | Promise<void>

    /** 验证失败 */
    onValidationError?: (errors: Record<string, string[]>) => void

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 国际化
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /** 国际化配置 */
    i18n?: {
        /** 当前语言 */
        locale?: string
        /** 翻译字典 */
        messages?: Record<string, Record<string, string>>
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 其他配置
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /** 表单样式 */
    style?: Record<string, any>
    /** 表单class */
    className?: string

    /** 扩展配置（自定义） */
    extra?: Record<string, any>
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📤 导出
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type {
    FormConfig as default
}

