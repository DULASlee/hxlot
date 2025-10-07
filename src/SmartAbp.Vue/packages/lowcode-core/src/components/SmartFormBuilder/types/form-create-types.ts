// src/SmartAbp.Vue/packages/lowcode-core/src/components/SmartFormBuilder/types/form-create-types.ts
/**
 * @file form-create-types.ts
 * @description form-create类型定义扩展
 * @author SmartAbp Team
 * @version 2.0.0
 * 
 * 🎯 核心作用:
 * 1. 为@form-create/element-ui提供完整的TypeScript类型支持
 * 2. 扩展form-create API以支持SmartAbp特定需求
 * 3. 提供类型安全的form-create规则定义
 */

/**
 * @interface FormCreateRule
 * @description form-create表单规则定义
 */
export interface FormCreateRule {
  // 基础属性
  type: string // 组件类型：'input', 'select', 'datePicker'等
  field: string // 字段名，用于数据绑定
  title?: string // 字段标题/标签
  value?: any // 默认值
  
  // 组件属性
  props?: Record<string, any> // 传递给组件的props
  
  // 布局属性
  col?: {
    span?: number // 栅格占位格数（1-24）
    offset?: number // 栅格左侧的间隔格数
    push?: number // 栅格向右移动格数
    pull?: number // 栅格向左移动格数
  }
  
  // 显示控制
  hidden?: boolean // 是否隐藏字段
  display?: boolean // 是否显示字段（与hidden相反）
  
  // 验证规则
  validate?: any[] // Element Plus验证规则数组
  
  // 选项（用于select, radio, checkbox等）
  options?: Array<{
    label: string
    value: any
    disabled?: boolean
    [key: string]: any
  }>
  
  // 子规则（用于嵌套组件）
  children?: FormCreateRule[]
  
  // 事件处理
  on?: Record<string, Function> // 事件监听器
  emit?: string[] // 要监听的事件名称
  
  // 插槽
  slot?: string // 插槽名称
  
  // 样式
  class?: string | string[] | Record<string, boolean> // CSS类名
  style?: Record<string, string> // 行内样式
  
  // 条件渲染
  vIf?: boolean | (() => boolean) // v-if条件
  vShow?: boolean | (() => boolean) // v-show条件
  
  // 其他
  name?: string // 组件name属性
  native?: boolean // 是否使用原生组件
  info?: string // 字段说明/提示信息
  
  // 扩展属性
  [key: string]: any
}

/**
 * @interface FormCreateConfig
 * @description form-create配置对象
 */
export interface FormCreateConfig {
  // 表单配置
  form?: {
    inline?: boolean // 行内表单模式
    labelPosition?: 'left' | 'right' | 'top' // 标签位置
    labelWidth?: string | number // 标签宽度
    labelSuffix?: string // 标签后缀
    hideRequiredAsterisk?: boolean // 是否隐藏必填星号
    showMessage?: boolean // 是否显示验证错误信息
    inlineMessage?: boolean // 是否以行内形式展示验证信息
    statusIcon?: boolean // 是否在输入框中显示验证结果图标
    validateOnRuleChange?: boolean // 是否在规则改变后立即触发验证
    size?: 'large' | 'default' | 'small' // 表单尺寸
    disabled?: boolean // 是否禁用该表单内的所有组件
    [key: string]: any
  }
  
  // 行配置
  row?: {
    gutter?: number // 栅格间隔
    type?: 'default' | 'flex' // 布局模式
    justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between' // flex布局水平排列方式
    align?: 'top' | 'middle' | 'bottom' // flex布局垂直排列方式
    tag?: string // 自定义元素标签
    [key: string]: any
  }
  
  // 提交按钮
  submitBtn?: boolean | {
    show?: boolean // 是否显示
    innerText?: string // 按钮文本
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' // 按钮类型
    size?: 'large' | 'default' | 'small' // 按钮尺寸
    plain?: boolean // 是否朴素按钮
    round?: boolean // 是否圆角按钮
    circle?: boolean // 是否圆形按钮
    loading?: boolean // 是否加载中状态
    disabled?: boolean // 是否禁用
    icon?: string // 图标类名
    col?: { span?: number; offset?: number } // 栅格布局
    click?: (formData: any) => void | Promise<void> // 点击事件
    [key: string]: any
  }
  
  // 重置按钮
  resetBtn?: boolean | {
    show?: boolean
    innerText?: string
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
    size?: 'large' | 'default' | 'small'
    plain?: boolean
    round?: boolean
    circle?: boolean
    loading?: boolean
    disabled?: boolean
    icon?: string
    col?: { span?: number; offset?: number }
    click?: () => void
    [key: string]: any
  }
  
  // 全局配置
  global?: {
    upload?: {
      action?: string // 上传地址
      headers?: Record<string, string> // 请求头
      data?: Record<string, any> // 附加数据
      name?: string // 文件字段名
      withCredentials?: boolean // 是否携带cookie
      [key: string]: any
    }
    [key: string]: any
  }
  
  // 其他配置
  mounted?: (api: any) => void // 表单挂载完成回调
  onSubmit?: (formData: any, api: any) => void | Promise<void> // 提交回调
  formData?: Record<string, any> // 表单初始数据
  [key: string]: any
}

/**
 * @interface FormCreateApi
 * @description form-create API接口
 */
export interface FormCreateApi {
  // 表单数据操作
  formData(): Record<string, any> // 获取表单数据
  getValue(field: string): any // 获取字段值
  setValue(field: string, value: any): void // 设置字段值
  setValue(values: Record<string, any>): void // 批量设置字段值
  changeValue(field: string, value: any): void // 修改字段值（触发事件）
  changeField(field: string, value: any): void // 同changeValue
  
  // 表单验证
  validate(callback?: (valid: boolean) => void): Promise<any> // 验证整个表单
  validateField(field: string, callback?: (valid: boolean) => void): Promise<any> // 验证指定字段
  clearValidateState(fields?: string | string[]): void // 清除验证状态
  
  // 表单重置
  resetFields(fields?: string | string[]): void // 重置字段到初始值
  
  // 表单提交
  submit(successFn?: Function, failFn?: Function): Promise<any> // 提交表单
  
  // 规则操作
  updateRule(field: string, rule: Partial<FormCreateRule>): void // 更新规则
  updateRules(rules: Record<string, Partial<FormCreateRule>>): void // 批量更新规则
  mergeRule(field: string, rule: Partial<FormCreateRule>): void // 合并规则
  mergeRules(rules: Record<string, Partial<FormCreateRule>>): void // 批量合并规则
  getRule(field: string): FormCreateRule | undefined // 获取规则
  
  // 字段操作
  removeField(field: string): void // 移除字段
  removeRule(field: string): void // 同removeField
  fields(): string[] // 获取所有字段名
  append(rule: FormCreateRule, after?: string): void // 追加字段
  prepend(rule: FormCreateRule, before?: string): void // 前置字段
  hidden(hidden: boolean, fields?: string | string[]): void // 隐藏字段
  hiddenStatus(field: string): boolean // 获取隐藏状态
  display(display: boolean, fields?: string | string[]): void // 显示/隐藏字段
  displayStatus(field: string): boolean // 获取显示状态
  disabled(disabled: boolean, fields?: string | string[]): void // 禁用字段
  
  // 组件方法
  method(field: string, methodName: string, ...args: any[]): any // 调用组件方法
  el(field: string): HTMLElement | undefined // 获取字段DOM元素
  
  // 表单配置
  updateOptions(options: Partial<FormCreateConfig>): void // 更新全局配置
  getOptions(): FormCreateConfig // 获取全局配置
  
  // 刷新
  refresh(): void // 刷新表单
  reload(rules?: FormCreateRule[]): void // 重载表单规则
  
  // 事件
  on(event: string, callback: Function): void // 监听事件
  once(event: string, callback: Function): void // 监听事件（一次）
  off(event: string, callback?: Function): void // 取消监听
  
  // 其他
  nextTick(fn: Function): void // 下一帧执行
  nextRefresh(fn: Function): void // 下次刷新后执行
  sync(rule: FormCreateRule): void // 同步规则
  
  // 扩展
  [key: string]: any
}

/**
 * @interface FormCreateComponent
 * @description form-create组件实例接口
 */
export interface FormCreateComponent {
  api: FormCreateApi
  rule: FormCreateRule[]
  option: FormCreateConfig
  fapi: FormCreateApi // api的别名
  [key: string]: any
}

/**
 * @exports 导出所有类型
 */
export type {
  FormCreateRule as Rule,
  FormCreateConfig as Config,
  FormCreateApi as Api,
  FormCreateComponent as Component
}

