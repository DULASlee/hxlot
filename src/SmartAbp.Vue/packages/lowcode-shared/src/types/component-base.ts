/**
 * 统一组件基础接口定义
 * 所有SmartAbp组件都应该继承或使用这些基础接口
 */

/**
 * 组件尺寸枚举
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * 组件变体（样式风格）
 */
export type ComponentVariant = 
  | 'primary' 
  | 'secondary' 
  | 'danger' 
  | 'success' 
  | 'warning' 
  | 'info'
  | 'default'

/**
 * 组件状态
 */
export type ComponentState = 
  | 'idle' 
  | 'loading' 
  | 'success' 
  | 'error' 
  | 'disabled'

/**
 * 基础组件Props接口
 * 所有组件都应该支持这些基础属性
 */
export interface BaseComponentProps {
  /**
   * 组件唯一标识
   */
  id?: string

  /**
   * CSS类名
   */
  className?: string

  /**
   * 测试ID（用于自动化测试）
   */
  testId?: string

  /**
   * 是否禁用
   */
  disabled?: boolean

  /**
   * 是否加载中
   */
  loading?: boolean

  /**
   * 组件变体（样式风格）
   */
  variant?: ComponentVariant

  /**
   * 组件尺寸
   */
  size?: ComponentSize

  /**
   * ARIA标签（无障碍访问）
   */
  ariaLabel?: string

  /**
   * ARIA角色
   */
  role?: string

  /**
   * 自定义样式
   */
  style?: Record<string, string | number>

  /**
   * 自定义数据属性
   */
  dataAttrs?: Record<string, string | number | boolean>
}

/**
 * 可验证组件Props接口
 */
export interface ValidatableComponentProps extends BaseComponentProps {
  /**
   * 是否必填
   */
  required?: boolean

  /**
   * 验证规则
   */
  rules?: ValidationRule[]

  /**
   * 错误提示信息
   */
  errorMessage?: string

  /**
   * 是否显示验证状态
   */
  showValidation?: boolean
}

/**
 * 验证规则
 */
export interface ValidationRule {
  /**
   * 规则类型
   */
  type: 'required' | 'email' | 'url' | 'pattern' | 'custom'

  /**
   * 错误提示信息
   */
  message: string

  /**
   * 正则表达式（用于pattern类型）
   */
  pattern?: RegExp

  /**
   * 自定义验证器函数（用于custom类型）
   */
  validator?: (value: any) => boolean | Promise<boolean> | { valid: boolean } | Promise<{ valid: boolean }>

  /**
   * 触发时机
   */
  trigger?: 'blur' | 'change' | 'submit'
}

/**
 * 表单组件Props接口
 */
export interface FormComponentProps extends ValidatableComponentProps {
  /**
   * 字段名称
   */
  name?: string

  /**
   * 字段值
   */
  value?: unknown

  /**
   * 占位符
   */
  placeholder?: string

  /**
   * 是否只读
   */
  readonly?: boolean

  /**
   * 自动聚焦
   */
  autofocus?: boolean
}

/**
 * 容器组件Props接口
 */
export interface ContainerComponentProps extends BaseComponentProps {
  /**
   * 容器标签名
   */
  tag?: string

  /**
   * 内边距
   */
  padding?: ComponentSize | string

  /**
   * 外边距
   */
  margin?: ComponentSize | string

  /**
   * 是否流式布局
   */
  fluid?: boolean
}

/**
 * 交互组件Props接口
 */
export interface InteractiveComponentProps extends BaseComponentProps {
  /**
   * 是否可点击
   */
  clickable?: boolean

  /**
   * 是否可拖拽
   */
  draggable?: boolean

  /**
   * 是否可选择
   */
  selectable?: boolean

  /**
   * 是否聚焦
   */
  focused?: boolean

  /**
   * 悬停提示
   */
  tooltip?: string
}

/**
 * 组件元数据
 */
export interface ComponentMetadata {
  /**
   * 组件名称
   */
  name: string

  /**
   * 组件版本
   */
  version: string

  /**
   * 组件描述
   */
  description?: string

  /**
   * 组件作者
   */
  author?: string

  /**
   * 组件标签
   */
  tags?: string[]

  /**
   * 组件图标
   */
  icon?: string

  /**
   * 是否已废弃
   */
  deprecated?: boolean

  /**
   * 废弃原因
   */
  deprecationReason?: string

  /**
   * 替代组件
   */
  replacement?: string
}
